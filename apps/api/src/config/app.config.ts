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
  /** True in production. */
  isProd: boolean;
  /**
   * Whether auth cookies carry the `Secure` flag. Defaults to production-only
   * so local HTTP dev works, but can be forced on (e.g. staging behind HTTPS)
   * via COOKIE_SECURE without changing NODE_ENV. Config-driven so controllers
   * never read process.env directly (CLAUDE.md §7/§19).
   */
  cookieSecure: boolean;
}

export const appConfig = registerAs(APP_CONFIG_KEY, (): AppConfig => {
  const nodeEnv = process.env['NODE_ENV'] ?? 'development';
  const isProd = nodeEnv === 'production';
  const cookieSecureEnv = process.env['COOKIE_SECURE'];
  return {
    nodeEnv,
    port: parseInt(process.env['PORT'] ?? '3001', 10),
    apiPrefix: process.env['API_PREFIX'] ?? 'api',
    apiVersion: process.env['API_VERSION'] ?? 'v1',
    defaultOrganizationId: process.env['DEFAULT_ORG_ID'] as string,
    appUrl: process.env['APP_URL'] ?? process.env['CORS_ORIGIN'] ?? 'http://localhost:3000',
    isProd,
    cookieSecure: cookieSecureEnv !== undefined ? cookieSecureEnv === 'true' : isProd,
  };
});
