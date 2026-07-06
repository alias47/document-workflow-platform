import { registerAs } from '@nestjs/config';

export const EMAIL_CONFIG_KEY = 'email';

export interface EmailConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  from: string;
  useTls: boolean;
}

export const emailConfig = registerAs(EMAIL_CONFIG_KEY, (): EmailConfig => ({
  host: process.env['SMTP_HOST'] ?? 'localhost',
  port: parseInt(process.env['SMTP_PORT'] ?? '1025', 10),
  user: process.env['SMTP_USER'] ?? '',
  password: process.env['SMTP_PASSWORD'] ?? '',
  from: process.env['SMTP_FROM'] ?? 'noreply@system.local',
  useTls: process.env['SMTP_USE_TLS'] === 'true',
}));
