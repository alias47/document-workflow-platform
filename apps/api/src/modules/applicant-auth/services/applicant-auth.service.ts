import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ApplicantAuthRepository } from '../repositories/applicant-auth.repository';

import type { ApplicantChangePasswordDto } from '../dto/applicant-change-password.dto';
import type { ApplicantLoginDto } from '../dto/applicant-login.dto';
import type { ApplicantJwtPayload } from '../interfaces/applicant-jwt-payload.interface';

import { JWT_CONFIG_KEY, type JwtConfig } from '@/config/jwt.config';
import { AuditService } from '@/modules/audit/services/audit.service';
import { PasswordService } from '@/providers/password/password.service';
import { TokenService, type TokenPair } from '@/providers/token/token.service';

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 15;

export interface ApplicantProfile {
  portalAccountId: string;
  applicantId: string;
  email: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  mustChangePass: boolean;
}

@Injectable()
export class ApplicantAuthService {
  constructor(
    private readonly authRepo: ApplicantAuthRepository,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly config: ConfigService,
    private readonly auditService: AuditService,
  ) {}

  async login(
    dto: ApplicantLoginDto,
    organizationId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ tokens: TokenPair; mustChangePass: boolean; profile: ApplicantProfile }> {
    const account = await this.authRepo.findPortalAccountByEmail(organizationId, dto.email);
    if (!account) throw new UnauthorizedException('Invalid email or password');

    if (account.lockedUntil && account.lockedUntil > new Date()) {
      throw new UnauthorizedException('Account is temporarily locked. Try again later.');
    }

    if (account.status === 'suspended' || account.status === 'disabled') {
      throw new UnauthorizedException('Account is not active');
    }

    // Business rule (11.3.7): login only allowed after portal account is activated
    // (acceptedAt set on the invitation) AND a password has been set.
    if (!account.activatedAt || !account.passwordHash) {
      throw new UnauthorizedException(
        'Account not yet activated. Please use your invitation link.',
      );
    }

    const valid = await this.passwordService.verify(account.passwordHash, dto.password);
    if (!valid) {
      const lockUntil =
        account.failedAttempts + 1 >= MAX_FAILED_ATTEMPTS
          ? new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000)
          : undefined;
      await this.authRepo.incrementFailedAttempts(account.id, lockUntil);
      void this.auditService.log({
        organizationId,
        actorId: account.id,
        actorType: 'applicant',
        action: 'applicant_auth.login.failed',
        metadata: { reason: 'invalid_password', locked: !!lockUntil } as never,
        ...(ipAddress !== undefined ? { ipAddress } : {}),
        ...(userAgent !== undefined ? { userAgent } : {}),
      });
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.authRepo.updateLastLogin(account.id);

    if (!account.applicant) throw new UnauthorizedException('Applicant record not found');

    const payload: ApplicantJwtPayload = {
      sub: account.id,
      applicantId: account.applicant.id,
      organizationId: account.organizationId,
      email: account.email,
      type: 'applicant',
    };

    const accessToken = this.tokenService.generateAccessToken(payload as never);
    const rawRefresh = this.tokenService.generateRefreshToken();
    const refreshHash = this.tokenService.hashToken(rawRefresh);
    const jwtCfg = this.config.get<JwtConfig>(JWT_CONFIG_KEY) as JwtConfig;
    const expiresAt = this.parseExpiry(jwtCfg.refreshExpiresIn);

    await this.authRepo.createRefreshToken({
      portalAccountId: account.id,
      tokenHash: refreshHash,
      expiresAt,
      ...(ipAddress ? { ipAddress } : {}),
      ...(userAgent ? { userAgent } : {}),
    });

    void this.auditService.log({
      organizationId,
      actorId: account.id,
      actorType: 'applicant',
      action: 'applicant_auth.login.success',
      ...(ipAddress !== undefined ? { ipAddress } : {}),
      ...(userAgent !== undefined ? { userAgent } : {}),
    });

    return {
      tokens: { accessToken, refreshToken: rawRefresh },
      mustChangePass: account.mustChangePass,
      profile: {
        portalAccountId: account.id,
        applicantId: account.applicant.id,
        email: account.email,
        organizationId: account.organizationId,
        firstName: account.applicant.firstName,
        lastName: account.applicant.lastName,
        mustChangePass: account.mustChangePass,
      },
    };
  }

  async refresh(rawToken: string, ipAddress?: string, userAgent?: string): Promise<TokenPair> {
    const hash = this.tokenService.hashToken(rawToken);
    const stored = await this.authRepo.findRefreshToken(hash);

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const account = await this.authRepo.findPortalAccountById(stored.portalAccountId);
    if (!account || account.status === 'suspended' || account.status === 'disabled') {
      throw new UnauthorizedException('Account not found or inactive');
    }
    if (!account.applicant) throw new UnauthorizedException('Applicant record not found');

    const payload: ApplicantJwtPayload = {
      sub: account.id,
      applicantId: account.applicant.id,
      organizationId: account.organizationId,
      email: account.email,
      type: 'applicant',
    };

    const accessToken = this.tokenService.generateAccessToken(payload as never);
    const newRaw = this.tokenService.generateRefreshToken();
    const newHash = this.tokenService.hashToken(newRaw);
    const jwtCfg = this.config.get<JwtConfig>(JWT_CONFIG_KEY) as JwtConfig;
    const expiresAt = this.parseExpiry(jwtCfg.refreshExpiresIn);

    const newToken = await this.authRepo.createRefreshToken({
      portalAccountId: account.id,
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
      const account = await this.authRepo.findPortalAccountById(stored.portalAccountId);
      if (account) {
        void this.auditService.log({
          organizationId: account.organizationId,
          actorId: account.id,
          actorType: 'applicant',
          action: 'applicant_auth.logout',
        });
      }
    }
  }

  async getMe(portalAccountId: string): Promise<ApplicantProfile> {
    const account = await this.authRepo.findPortalAccountById(portalAccountId);
    if (!account || !account.applicant) throw new NotFoundException('Portal account not found');
    return {
      portalAccountId: account.id,
      applicantId: account.applicant.id,
      email: account.email,
      organizationId: account.organizationId,
      firstName: account.applicant.firstName,
      lastName: account.applicant.lastName,
      mustChangePass: account.mustChangePass,
    };
  }

  async changePassword(portalAccountId: string, dto: ApplicantChangePasswordDto): Promise<void> {
    const account = await this.authRepo.findPortalAccountById(portalAccountId);
    if (!account || !account.passwordHash) throw new NotFoundException('Portal account not found');

    const valid = await this.passwordService.verify(account.passwordHash, dto.currentPassword);
    if (!valid) throw new UnauthorizedException('Current password is incorrect');

    if (dto.currentPassword === dto.newPassword) {
      throw new ConflictException('New password must differ from current password');
    }

    const hash = await this.passwordService.hash(dto.newPassword);
    await this.authRepo.updatePassword(portalAccountId, hash);
    await this.authRepo.revokeAllPortalAccountTokens(portalAccountId);

    void this.auditService.log({
      organizationId: account.organizationId,
      actorId: account.id,
      actorType: 'applicant',
      action: 'applicant_auth.password.changed',
    });
  }

  private parseExpiry(expiry: string): Date {
    const unit = expiry.slice(-1);
    const value = parseInt(expiry.slice(0, -1), 10);
    const ms = unit === 'd' ? value * 86400000 : unit === 'h' ? value * 3600000 : value * 60000;
    return new Date(Date.now() + ms);
  }
}
