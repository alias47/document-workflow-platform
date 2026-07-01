import { registerAs } from '@nestjs/config';

export const STORAGE_CONFIG_KEY = 'storage';

export interface StorageConfig {
  provider: string;
  localRoot: string;
  maxFileSizeBytes: number;
}

export const storageConfig = registerAs(STORAGE_CONFIG_KEY, (): StorageConfig => ({
  provider: process.env['STORAGE_PROVIDER'] ?? 'local',
  localRoot: process.env['STORAGE_LOCAL_ROOT'] ?? 'storage',
  maxFileSizeBytes: parseInt(process.env['STORAGE_MAX_FILE_SIZE_BYTES'] ?? '10485760', 10),
}));
