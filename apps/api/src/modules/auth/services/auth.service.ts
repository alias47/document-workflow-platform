import crypto from 'node:crypto';

import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AuthRepository } from '../repositories/auth.repository';

import type { ChangePasswordDto } from '../dto/change-password.dto';
import type { LoginDto } from '../dto/login.dto';
import type { JwtPayload } from '../interfaces/jwt-payload.interface';

import { APP_CONFIG_KEY, type AppConfig } from '@/config/app.config';
import { JWT_CONFIG_KEY, type JwtConfig } from '@/config/jwt.config';
import { AuditService } from '@/modules/audit/services/audit.service';
import { NotificationService } from '@/modules/notification/services/notification.service';
import { NOTIFICATION_TEMPLATES } from '@/modules/notification/templates/notification-templates';
import { PasswordService } from '@/providers/password/password.service';
import { TokenService, type TokenPair } from '@/providers/token/token.service';

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 15;
const RESET_TOKEN_EXPIRY_MINUTES = 60;

export interface StaffProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  organizationId: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly authRepo: AuthRepository,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly config: ConfigService,
    private readonly auditService: AuditService,
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,
  ) {}

  async login(
    dto: LoginDto,
    organizationId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ tokens: TokenPair; mustChangePass: boolean; staff: StaffProfile }> {
    const staff = await this.authRepo.findStaffByEmail(organizationId, dto.email);

    if (!staff) throw new UnauthorizedException('Invalid email or password');

    if (staff.lockedUntil && staff.lockedUntil > new Date()) {
      throw new UnauthorizedException('Account is temporarily locked. Try again later.');
    }

    if (staff.status !== 'active' || staff.deletedAt) {
      throw new UnauthorizedException('Account is not active');
    }

    const valid = await this.passwordService.verify(staff.passwordHash, dto.password);

    if (!valid) {
      const lockUntil =
        staff.failedAttempts + 1 >= MAX_FAILED_ATTEMPTS
          ? new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000)
          : undefined;
      await this.authRepo.incrementFailedAttempts(staff.id, lockUntil);
      await this.auditService.log({
        organizationId,
        actorId: staff.id,
        action: 'auth.login.failed',
        metadata: { reason: 'invalid_password', locked: !!lockUntil },
        ...(ipAddress !== undefined ? { ipAddress } : {}),
        ...(userAgent !== undefined ? { userAgent } : {}),
      });
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.authRepo.updateLastLogin(staff.id);

    const permissions = staff.role.permissions.map((rp) => rp.permission.action);
    const payload: JwtPayload = {
      sub: staff.id,
      email: staff.email,
      organizationId: staff.organizationId,
      role: staff.role.name,
      permissions,
    };

    const accessToken = this.tokenService.generateAccessToken(payload);
    const rawRefresh = this.tokenService.generateRefreshToken();
    const refreshHash = this.tokenService.hashToken(rawRefresh);
    const jwtCfg = this.config.get<JwtConfig>(JWT_CONFIG_KEY) as JwtConfig;
    const expiresAt = this.parseExpiry(jwtCfg.refreshExpiresIn);

    await this.authRepo.createRefreshToken({
      staffId: staff.id,
      tokenHash: refreshHash,
      expiresAt,
      ...(ipAddress ? { ipAddress } : {}),
      ...(userAgent ? { userAgent } : {}),
    });

    await this.auditService.log({
      organizationId: staff.organizationId,
      actorId: staff.id,
      action: 'auth.login.success',
      ...(ipAddress !== undefined ? { ipAddress } : {}),
      ...(userAgent !== undefined ? { userAgent } : {}),
    });

    return {
      tokens: { accessToken, refreshToken: rawRefresh },
      mustChangePass: staff.mustChangePass,
      staff: {
        id: staff.id,
        email: staff.email,
        firstName: staff.firstName,
        lastName: staff.lastName,
        role: staff.role.name,
        organizationId: staff.organizationId,
      },
    };
  }

  async refresh(rawToken: string, ipAddress?: string, userAgent?: string): Promise<TokenPair> {
    const hash = this.tokenService.hashToken(rawToken);
    const stored = await this.authRepo.findRefreshToken(hash);

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const staff = await this.authRepo.findStaffById(stored.staffId);
    if (!staff || staff.status !== 'active') throw new UnauthorizedException('Staff not found');

    const permissions = staff.role.permissions.map((rp) => rp.permission.action);
    const payload: JwtPayload = {
      sub: staff.id,
      email: staff.email,
      organizationId: staff.organizationId,
      role: staff.role.name,
      permissions,
    };

    const accessToken = this.tokenService.generateAccessToken(payload);
    const newRaw = this.tokenService.generateRefreshToken();
    const newHash = this.tokenService.hashToken(newRaw);
    const jwtCfg = this.config.get<JwtConfig>(JWT_CONFIG_KEY) as JwtConfig;
    const expiresAt = this.parseExpiry(jwtCfg.refreshExpiresIn);

    const newToken = await this.authRepo.createRefreshToken({
      staffId: staff.id,
      tokenHash: newHash,
      expiresAt,
      ...(ipAddress ? { ipAddress } : {}),
      ...(userAgent ? { userAgent } : {}),
    });
    await this.authRepo.revokeRefreshToken(stored.id, newToken.id);

    return { accessToken, refreshToken: newRaw };
  }

  async logout(rawToken: string): Promise<void> {
    const hash = this.tokenService.hashToken(rawToken);
    const stored = await this.authRepo.findRefreshToken(hash);
    if (stored && !stored.revokedAt) {
      await this.authRepo.revokeRefreshToken(stored.id);
      const staffRecord = await this.authRepo.findStaffById(stored.staffId);
      if (staffRecord) {
        await this.auditService.log({
          organizationId: staffRecord.organizationId,
          actorId: stored.staffId,
          action: 'auth.logout',
        });
      }
    }
  }

  async logoutAll(staffId: string): Promise<void> {
    const staff = await this.authRepo.findStaffById(staffId);
    await this.authRepo.revokeAllStaffTokens(staffId);
    if (staff) {
      await this.auditService.log({
        organizationId: staff.organizationId,
        actorId: staffId,
        action: 'auth.logout_all',
      });
    }
  }

  async getMe(staffId: string): Promise<StaffProfile> {
    const staff = await this.authRepo.findStaffById(staffId);
    if (!staff) throw new NotFoundException('Staff not found');
    return {
      id: staff.id,
      email: staff.email,
      firstName: staff.firstName,
      lastName: staff.lastName,
      role: staff.role.name,
      organizationId: staff.organizationId,
    };
  }

  async changePassword(staffId: string, dto: ChangePasswordDto): Promise<void> {
    const staff = await this.authRepo.findStaffById(staffId);
    if (!staff) throw new NotFoundException('Staff not found');

    const valid = await this.passwordService.verify(staff.passwordHash, dto.currentPassword);
    if (!valid) throw new UnauthorizedException('Current password is incorrect');

    if (dto.currentPassword === dto.newPassword) {
      throw new ConflictException('New password must differ from current password');
    }

    const hash = await this.passwordService.hash(dto.newPassword);
    await this.authRepo.updatePassword(staffId, hash);
    await this.authRepo.revokeAllStaffTokens(staffId);

    await this.auditService.log({
      organizationId: staff.organizationId,
      actorId: staffId,
      action: 'auth.password.changed',
    });
  }

  async forgotPassword(email: string, organizationId: string): Promise<void> {
    const staff = await this.authRepo.findStaffByEmail(organizationId, email);
    // Always return success — never reveal whether email exists
    if (!staff) return;

    const token = crypto.randomBytes(32).toString('hex');
    const hash = this.tokenService.hashToken(token);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000);

    await this.authRepo.storePasswordResetToken(staff.id, hash, expiresAt);

    // Trigger (11.2.4): staff password reset. Routed through NotificationService —
    // the auth module never touches the email transport directly (11.2.8).
    const appConfig = this.config.get<AppConfig>(APP_CONFIG_KEY);
    const resetUrl = `${appConfig?.appUrl ?? ''}/reset-password?token=${token}`;
    void this.notificationService.notify({
      organizationId,
      template: NOTIFICATION_TEMPLATES.STAFF_PASSWORD_RESET,
      recipient: staff.email,
      variables: {
        staffName: `${staff.firstName} ${staff.lastName}`,
        portalUrl: resetUrl,
      },
      metadata: { staffId: staff.id },
    });

    await this.auditService.log({
      organizationId,
      actorId: staff.id,
      action: 'auth.password.reset_requested',
    });

    this.logger.log(`Password reset requested for ${staff.email}`);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const hash = this.tokenService.hashToken(token);
    const stored = await this.authRepo.findValidPasswordResetToken(hash);

    if (!stored) throw new UnauthorizedException('Invalid or expired reset token');

    const staff = await this.authRepo.findStaffById(stored.staffId);
    const passwordHash = await this.passwordService.hash(newPassword);
    await this.authRepo.updatePassword(stored.staffId, passwordHash);
    await this.authRepo.markPasswordResetTokenUsed(stored.id);
    await this.authRepo.revokeAllStaffTokens(stored.staffId);

    if (staff) {
      await this.auditService.log({
        organizationId: staff.organizationId,
        actorId: stored.staffId,
        action: 'auth.password.reset_completed',
      });
    }
  }

  private parseExpiry(expiry: string): Date {
    const unit = expiry.slice(-1);
    const value = parseInt(expiry.slice(0, -1), 10);
    const ms = unit === 'd' ? value * 86400000 : unit === 'h' ? value * 3600000 : value * 60000;
    return new Date(Date.now() + ms);
  }
}
