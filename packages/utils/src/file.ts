const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const ALLOWED_MIME_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png']);

/**
 * Format a byte count into a human-readable string.
 * Example: 1048576 → "1.0 MB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Validate that an uploaded file meets project requirements.
 * Returns null when valid, or an error message string.
 */
export function validateUploadedFile(file: { size: number; type: string }): string | null {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return 'Only PDF, JPG, and PNG files are accepted.';
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return `File must not exceed ${formatFileSize(MAX_UPLOAD_SIZE_BYTES)}.`;
  }

  return null;
}

/**
 * Return a human-readable label for a MIME type.
 */
export function getMimeTypeLabel(mimeType: string): string {
  const labels: Record<string, string> = {
    'application/pdf': 'PDF',
    'image/jpeg': 'JPG',
    'image/png': 'PNG',
  };

  return labels[mimeType] ?? mimeType;
}
