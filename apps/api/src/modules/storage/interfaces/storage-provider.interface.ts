import type { Readable } from 'stream';

/** DI token for the active StorageProvider implementation. */
export const STORAGE_PROVIDER = Symbol('STORAGE_PROVIDER');

/** Immutable descriptor of where a stored object lives. */
export interface StoredObjectLocation {
  /** Provider-relative key that uniquely addresses the object (never a filesystem path). */
  storageKey: string;
}

/**
 * Abstraction over the physical storage backend. Business code depends only on
 * this interface so the backing store can swap (local disk → R2 → S3) via config
 * without touching the document domain.
 */
export interface StorageProvider {
  /**
   * Persist a buffer under a deterministic key derived from the given parts.
   * Implementations must confine writes to their configured root and generate a
   * collision-free stored filename — never trust caller-supplied filenames.
   */
  upload(input: UploadInput): Promise<StoredObjectLocation>;

  /** Open a readable stream for a previously stored object. */
  download(storageKey: string): Promise<Readable>;

  /** Remove the physical object. Resolves even if already absent is left to the caller via exists(). */
  delete(storageKey: string): Promise<void>;

  /** Whether an object currently exists at the key. */
  exists(storageKey: string): Promise<boolean>;
}

export interface UploadInput {
  organizationId: string;
  applicantId: string;
  /** Server-generated stored filename including extension (already sanitized). */
  storedFilename: string;
  buffer: Buffer;
}
