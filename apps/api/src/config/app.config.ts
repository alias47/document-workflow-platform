import { registerAs } from '@nestjs/config';

export const APP_CONFIG_KEY = 'app';

export interface AppConfig {
  nodeEnv: string;
  port: number;
  apiPrefix: string;
  apiVersion: string;
}

export const appConfig = registerAs(APP_CONFIG_KEY, (): AppConfig => ({
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
  port: parseInt(process.env['PORT'] ?? '3001', 10),
  apiPrefix: process.env['API_PREFIX'] ?? 'api',
  apiVersion: process.env['API_VERSION'] ?? 'v1',
}));
