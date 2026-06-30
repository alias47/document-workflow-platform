import { registerAs } from '@nestjs/config';

export const JWT_CONFIG_KEY = 'jwt';

export interface JwtConfig {
  secret: string;
  accessExpiresIn: string;
  refreshExpiresIn: string;
}

export const jwtConfig = registerAs(JWT_CONFIG_KEY, (): JwtConfig => ({
  secret: process.env['JWT_SECRET'] as string,
  accessExpiresIn: process.env['JWT_ACCESS_EXPIRES_IN'] ?? '15m',
  refreshExpiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] ?? '7d',
}));
