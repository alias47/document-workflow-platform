import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  ALLOWED_UPLOAD_TYPES,
} from '../constants/upload.constants';
import { extractExtension } from '../utils/file.utils';

import { type StorageConfig, STORAGE_CONFIG_KEY } from '@/config';

export interface ValidatedFile {
  extension: string;
  mimeType: string;
  size: number;
}

/**
 * Validates an uploaded file against size, emptiness, MIME, and extension rules.
 * Rejects anything outside the allowlist so only known-safe document types reach
 * storage. Throws BadRequestException (mapped to 400) on any violation.
 */
@Injectable()
export class FileValidationService {
  private readonly maxFileSizeBytes: number;

  constructor(private readonly config: ConfigService) {
    const cfg = this.config.get<StorageConfig>(STORAGE_CONFIG_KEY);
    this.maxFileSizeBytes = cfg?.maxFileSizeBytes ?? 10_485_760;
  }

  validate(file: Express.Multer.File | undefined): ValidatedFile {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const size = file.size ?? file.buffer?.length ?? 0;
    if (size <= 0 || !file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('Uploaded file is empty');
    }

    if (size > this.maxFileSizeBytes) {
      throw new BadRequestException(
        `File exceeds the maximum size of ${this.maxFileSizeBytes} bytes`,
      );
    }

    const mimeType = file.mimetype;
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      throw new BadRequestException(`Unsupported file type: ${mimeType}`);
    }

    const extension = extractExtension(file.originalname);
    if (!ALLOWED_EXTENSIONS.has(extension)) {
      throw new BadRequestException(`Unsupported file extension: ${extension || '(none)'}`);
    }

    // Extension and MIME must agree — a `.pdf` declared as `image/png` is rejected.
    const pairMatches = ALLOWED_UPLOAD_TYPES.some(
      (t) => t.mime === mimeType && t.extensions.includes(extension),
    );
    if (!pairMatches) {
      throw new BadRequestException(
        `File extension ${extension} does not match content type ${mimeType}`,
      );
    }

    return { extension, mimeType, size };
  }
}
