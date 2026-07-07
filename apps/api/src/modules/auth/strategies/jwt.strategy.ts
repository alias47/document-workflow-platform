import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthRepository } from '../repositories/auth.repository';

import type { JwtPayload } from '../interfaces/jwt-payload.interface';
import type { Request } from 'express';

import { JWT_CONFIG_KEY, type JwtConfig } from '@/config/jwt.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private readonly authRepo: AuthRepository,
  ) {
    const jwtCfg = config.get<JwtConfig>(JWT_CONFIG_KEY) as JwtConfig;
    super({
      // Extract the access token from the HttpOnly cookie set on login/refresh.
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) =>
          (req?.cookies as Record<string, string | undefined>)['access_token'] ?? null,
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtCfg.secret,
    });
  }

  /**
   * The signed JWT is authenticity, not authority. On every request we re-load
   * the staff member and their organization from the database and reject the
   * request if the user no longer exists, was soft-deleted, is not active, or
   * the organization is disabled/deleted (Sprint 12.1 §4). Role and permissions
   * are rebuilt from current DB state so a role change takes effect immediately
   * rather than lingering for the access-token lifetime.
   */
  async validate(payload: JwtPayload): Promise<JwtPayload> {
    if (!payload.sub) throw new UnauthorizedException('Invalid token');

    const staff = await this.authRepo.findStaffForValidation(payload.sub);
    if (!staff) throw new UnauthorizedException('Account no longer exists');
    if (staff.status !== 'active') throw new UnauthorizedException('Account is not active');
    if (!staff.organization || staff.organization.deletedAt || !staff.organization.isActive) {
      throw new UnauthorizedException('Organization is not active');
    }

    // Rebuild the authorization context from current DB state. Permissions are
    // loaded via the permissions-bearing lookup to keep RBAC current.
    const withPerms = await this.authRepo.findStaffById(payload.sub);
    const permissions = withPerms
      ? withPerms.role.permissions.map((rp) => rp.permission.action)
      : [];

    return {
      sub: staff.id,
      email: staff.email,
      organizationId: staff.organizationId,
      role: staff.role.name,
      permissions,
    };
  }
}
