export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024,
  ALLOWED_MIME_TYPES: ['application/pdf', 'image/jpeg', 'image/png'] as const,
  ALLOWED_EXTENSIONS: ['.pdf', '.jpg', '.jpeg', '.png'] as const,
} as const;

export type AllowedMimeType = (typeof UPLOAD_CONFIG.ALLOWED_MIME_TYPES)[number];
