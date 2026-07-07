import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { ApplicantAuthRepository } from '../repositories/applicant-auth.repository';

import type { ApplicantJwtPayload } from '../interfaces/applicant-jwt-payload.interface';
import type { Request } from 'express';

import { JWT_CONFIG_KEY, type JwtConfig } from '@/config/jwt.config';

export const APPLICANT_JWT_STRATEGY = 'applicant-jwt';

// Portal account states that must never hold an authenticated session. Mirrors
// the rejection rules enforced in ApplicantAuthService.login().
const BLOCKED_PORTAL_STATUSES = new Set(['suspended', 'disabled', 'locked']);

@Injectable()
export class ApplicantJwtStrategy extends PassportStrategy(Strategy, APPLICANT_JWT_STRATEGY) {
  constructor(
    config: ConfigService,
    private readonly authRepo: ApplicantAuthRepository,
  ) {
    const jwtCfg = config.get<JwtConfig>(JWT_CONFIG_KEY) as JwtConfig;
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) =>
          (req?.cookies as Record<string, string | undefined>)['applicant_access_token'] ?? null,
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtCfg.secret,
    });
  }

  /**
   * Re-validate the applicant session against current DB state on every request
   * (Sprint 12.1 §4): the portal account must still exist, not be soft-deleted,
   * be activated, not be suspended/disabled/locked, and its organization must be
   * active and have the applicant portal enabled.
   */
  async validate(payload: ApplicantJwtPayload): Promise<ApplicantJwtPayload> {
    if (!payload.sub || payload.type !== 'applicant') {
      throw new UnauthorizedException('Invalid applicant token');
    }

    const account = await this.authRepo.findPortalAccountForValidation(payload.sub);
    if (!account || !account.applicant) {
      throw new UnauthorizedException('Account no longer exists');
    }
    if (BLOCKED_PORTAL_STATUSES.has(account.status)) {
      throw new UnauthorizedException('Account is not active');
    }
    if (!account.activatedAt) {
      throw new UnauthorizedException('Account is not activated');
    }

    const org = await this.authRepo.findOrganizationStatus(account.organizationId);
    if (!org || org.deletedAt || !org.isActive) {
      throw new UnauthorizedException('Organization is not active');
    }
    if (!org.portalEnabled) {
      throw new UnauthorizedException('Applicant portal is disabled');
    }

    return {
      sub: account.id,
      applicantId: account.applicant.id,
      organizationId: account.organizationId,
      email: account.email,
      type: 'applicant',
    };
  }
}
