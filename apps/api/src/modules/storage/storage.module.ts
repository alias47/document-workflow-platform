import { Module } from '@nestjs/common';

import { STORAGE_PROVIDER } from './interfaces/storage-provider.interface';
import { LocalStorageProvider } from './providers/local-storage.provider';

/**
 * Binds the StorageProvider token to the configured implementation. Today only
 * `local` exists; adding R2/S3 means registering another provider here and
 * selecting it by config — business modules stay untouched.
 */
@Module({
  providers: [
    LocalStorageProvider,
    { provide: STORAGE_PROVIDER, useExisting: LocalStorageProvider },
  ],
  exports: [STORAGE_PROVIDER],
})
export class StorageModule {}
