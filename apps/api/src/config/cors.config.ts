import { registerAs } from '@nestjs/config';

export const CORS_CONFIG_KEY = 'cors';

export interface CorsConfig {
  origin: string | string[];
  credentials: boolean;
}

export const corsConfig = registerAs(CORS_CONFIG_KEY, (): CorsConfig => ({
  origin: process.env['CORS_ORIGIN'] ?? 'http://localhost:3000',
  credentials: process.env['CORS_CREDENTIALS'] === 'true',
}));
