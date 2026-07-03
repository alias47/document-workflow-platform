import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import type { ApplicantJwtPayload } from '../interfaces/applicant-jwt-payload.interface';
import type { Request } from 'express';

import { JWT_CONFIG_KEY, type JwtConfig } from '@/config/jwt.config';

export const APPLICANT_JWT_STRATEGY = 'applicant-jwt';

@Injectable()
export class ApplicantJwtStrategy extends PassportStrategy(Strategy, APPLICANT_JWT_STRATEGY) {
  constructor(config: ConfigService) {
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

  validate(payload: ApplicantJwtPayload): ApplicantJwtPayload {
    if (!payload.sub || payload.type !== 'applicant') {
      throw new UnauthorizedException('Invalid applicant token');
    }
    return payload;
  }
}
