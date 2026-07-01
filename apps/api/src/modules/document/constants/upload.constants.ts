/**
 * Upload allowlists. Extension and MIME are checked together so a mismatched
 * pair (e.g. `.pdf` declared as `image/png`) is rejected.
 */
export const ALLOWED_UPLOAD_TYPES: ReadonlyArray<{ mime: string; extensions: string[] }> = [
  { mime: 'application/pdf', extensions: ['.pdf'] },
  { mime: 'image/jpeg', extensions: ['.jpg', '.jpeg'] },
  { mime: 'image/png', extensions: ['.png'] },
  { mime: 'image/webp', extensions: ['.webp'] },
  {
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    extensions: ['.docx'],
  },
];

export const ALLOWED_MIME_TYPES: ReadonlySet<string> = new Set(
  ALLOWED_UPLOAD_TYPES.map((t) => t.mime),
);

export const ALLOWED_EXTENSIONS: ReadonlySet<string> = new Set(
  ALLOWED_UPLOAD_TYPES.flatMap((t) => t.extensions),
);
