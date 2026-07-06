import { registerAs } from '@nestjs/config';

export const APP_CONFIG_KEY = 'app';

export interface AppConfig {
  nodeEnv: string;
  port: number;
  apiPrefix: string;
  apiVersion: string;
  defaultOrganizationId: string;
  /** Public frontend base URL used to build links inside notifications. */
  appUrl: string;
}

export const appConfig = registerAs(APP_CONFIG_KEY, (): AppConfig => ({
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
  port: parseInt(process.env['PORT'] ?? '3001', 10),
  apiPrefix: process.env['API_PREFIX'] ?? 'api',
  apiVersion: process.env['API_VERSION'] ?? 'v1',
  defaultOrganizationId: process.env['DEFAULT_ORG_ID'] as string,
  appUrl: process.env['APP_URL'] ?? process.env['CORS_ORIGIN'] ?? 'http://localhost:3000',
}));
