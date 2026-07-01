import { createReadStream } from 'fs';
import { mkdir, rm, stat, writeFile } from 'fs/promises';
import path from 'path';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type {
  StorageProvider,
  StoredObjectLocation,
  UploadInput,
} from '../interfaces/storage-provider.interface';
import type { Readable } from 'stream';

import { type StorageConfig, STORAGE_CONFIG_KEY } from '@/config';

/**
 * Filesystem-backed StorageProvider. Objects live under:
 *   <root>/organizations/<orgId>/applicants/<applicantId>/<year>/<month>/<storedFilename>
 *
 * Every resolved path is confined to the configured root, so a crafted key
 * containing `..` or an absolute segment can never escape the storage sandbox.
 */
@Injectable()
export class LocalStorageProvider implements StorageProvider {
  private readonly root: string;

  constructor(private readonly config: ConfigService) {
    const cfg = this.config.get<StorageConfig>(STORAGE_CONFIG_KEY);
    // Resolve once at construction so all confinement checks share one absolute base.
    this.root = path.resolve(process.cwd(), cfg?.localRoot ?? 'storage');
  }

  async upload(input: UploadInput): Promise<StoredObjectLocation> {
    const storageKey = this.buildStorageKey(input);
    const absolute = this.resolveWithinRoot(storageKey);

    await mkdir(path.dirname(absolute), { recursive: true });
    await writeFile(absolute, input.buffer, { flag: 'wx' });

    return { storageKey };
  }

  async download(storageKey: string): Promise<Readable> {
    const absolute = this.resolveWithinRoot(storageKey);
    // Surface a clear error before opening a stream if the object is gone.
    await stat(absolute);
    return createReadStream(absolute);
  }

  async delete(storageKey: string): Promise<void> {
    const absolute = this.resolveWithinRoot(storageKey);
    await rm(absolute, { force: true });
  }

  async exists(storageKey: string): Promise<boolean> {
    try {
      const absolute = this.resolveWithinRoot(storageKey);
      await stat(absolute);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Deterministic key partitioned by org → applicant → year/month. The stored
   * filename is server-generated upstream, so no client input reaches the path
   * except the UUID-scoped identifiers, which are validated by the controller.
   */
  private buildStorageKey(input: UploadInput): string {
    const now = new Date();
    const year = String(now.getUTCFullYear());
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    return path.posix.join(
      'organizations',
      input.organizationId,
      'applicants',
      input.applicantId,
      year,
      month,
      input.storedFilename,
    );
  }

  /**
   * Resolve a storage key to an absolute path and guarantee it stays inside the
   * root. Rejects directory traversal and absolute-path injection.
   */
  private resolveWithinRoot(storageKey: string): string {
    const absolute = path.resolve(this.root, storageKey);
    const relative = path.relative(this.root, absolute);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      throw new Error('Resolved storage path escapes the storage root');
    }
    return absolute;
  }
}
