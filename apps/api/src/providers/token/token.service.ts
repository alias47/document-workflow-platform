import crypto from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import type { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import type { StringValue } from 'ms';

import { JWT_CONFIG_KEY, type JwtConfig } from '@/config/jwt.config';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class TokenService {
  private readonly jwtCfg: JwtConfig;

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {
    this.jwtCfg = this.config.get<JwtConfig>(JWT_CONFIG_KEY) as JwtConfig;
  }

  generateAccessToken(payload: JwtPayload): string {
    return this.jwt.sign(payload, {
      secret: this.jwtCfg.secret,
      expiresIn: this.jwtCfg.accessExpiresIn as StringValue,
    });
  }

  generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  verifyAccessToken(token: string): JwtPayload {
    return this.jwt.verify<JwtPayload>(token, { secret: this.jwtCfg.secret });
  }
}
