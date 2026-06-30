import { registerAs } from '@nestjs/config';

export const DATABASE_CONFIG_KEY = 'database';

export interface DatabaseConfig {
  url: string;
}

export const databaseConfig = registerAs(DATABASE_CONFIG_KEY, (): DatabaseConfig => ({
  url: process.env['DATABASE_URL'] as string,
}));
