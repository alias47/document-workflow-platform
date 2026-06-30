const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const appName = process.env.NEXT_PUBLIC_APP_NAME ?? 'EduFlow';
const appEnv = process.env.NEXT_PUBLIC_ENV ?? 'development';

export const env = {
  apiUrl,
  appName,
  appEnv,
  isDev: appEnv === 'development',
  isProd: appEnv === 'production',
} as const;
