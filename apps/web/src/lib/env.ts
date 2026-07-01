const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';
const appName = process.env.NEXT_PUBLIC_APP_NAME ?? 'EduFlow';

// NEXT_PUBLIC_ENV must be set explicitly in the env file.
// Falls back to NODE_ENV so a missing var never silently enables mocks in production.
const appEnv = process.env.NEXT_PUBLIC_ENV ?? process.env.NODE_ENV ?? 'production';

export const env = {
  apiUrl,
  appName,
  appEnv,
  isDev: appEnv === 'development',
  isProd: appEnv === 'production',
} as const;

// Startup diagnostic — only printed server-side in development.
if (process.env.NODE_ENV === 'development') {
  console.warn(`[env] appEnv=${appEnv} isDev=${appEnv === 'development'} apiUrl=${apiUrl}`);
}
