import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import type { JwtPayload } from '../interfaces/jwt-payload.interface';
import type { Request } from 'express';

import { JWT_CONFIG_KEY, type JwtConfig } from '@/config/jwt.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
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

  validate(payload: JwtPayload): JwtPayload {
    if (!payload.sub) throw new UnauthorizedException('Invalid token');
    return payload;
  }
}
