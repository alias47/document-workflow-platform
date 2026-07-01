import { createHash, randomUUID } from 'crypto';
import path from 'path';

// ASCII control characters (0x00–0x1F and 0x7F) — stripped from display names.

const CONTROL_CHARS = /[\u0000-\u001f\u007f]/g;
// Path separators and Windows-reserved filename characters.
const RESERVED_CHARS = /[\\/:*?"<>|]/g;

/**
 * Reduce a client-supplied filename to a safe display name. Strips any path
 * components and control/separator characters so the original name can be
 * stored and echoed back without enabling path or header injection. Never used
 * to build a filesystem path — only for the `originalFilename` metadata column.
 */
export function sanitizeOriginalFilename(raw: string): string {
  // `path.basename` discards directory segments (defeats `../` and absolute paths).
  const base = path.basename(raw);
  const cleaned = base
    .replace(CONTROL_CHARS, '')
    .replace(RESERVED_CHARS, '_')
    .replace(/\s+/g, ' ')
    // Drop leading dots so a name can't become a hidden/relative entry.
    .replace(/^\.+/, '')
    .trim();
  return cleaned.length > 0 ? cleaned.slice(0, 255) : 'file';
}

/**
 * Normalize an extension from a filename to a lowercase, dot-prefixed form.
 * Returns an empty string when there is no extension.
 */
export function extractExtension(filename: string): string {
  return path.extname(path.basename(filename)).toLowerCase();
}

/**
 * Generate a collision-free stored filename. The name is entirely
 * server-generated (UUID) so no client input reaches the storage path; only the
 * validated extension is preserved for content-type fidelity.
 */
export function generateStoredFilename(extension: string): string {
  return extension ? `${randomUUID()}${extension}` : randomUUID();
}

/** SHA-256 hex digest of a buffer, for integrity and duplicate detection. */
export function computeSha256(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}
