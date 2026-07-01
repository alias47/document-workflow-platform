import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { FileValidationService } from './file-validation.service';
import { DocumentRepository } from '../repositories/document.repository';
import {
  computeSha256,
  generateStoredFilename,
  sanitizeOriginalFilename,
} from '../utils/file.utils';

import type { UploadDocumentDto } from '../dto/upload-document.dto';
import type { DocumentCategory } from '@prisma/client';
import type { Readable } from 'stream';

import { ApplicantService } from '@/modules/applicant/services/applicant.service';
import { AuditService } from '@/modules/audit/services/audit.service';
import {
  STORAGE_PROVIDER,
  type StorageProvider,
} from '@/modules/storage/interfaces/storage-provider.interface';

export interface DownloadResult {
  stream: Readable;
  filename: string;
  contentType: string;
}

@Injectable()
export class DocumentUploadService {
  constructor(
    private readonly documentRepo: DocumentRepository,
    private readonly fileValidation: FileValidationService,
    private readonly applicantService: ApplicantService,
    private readonly auditService: AuditService,
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
  ) {}

  async upload(
    file: Express.Multer.File | undefined,
    dto: UploadDocumentDto,
    organizationId: string,
    staffId: string,
  ) {
    // Reject invalid files before any storage or DB work.
    const validated = this.fileValidation.validate(file);
    const uploaded = file as Express.Multer.File;

    // Organization isolation: applicant must belong to the caller's org.
    await this.applicantService.getById(dto.applicantId, organizationId);

    const originalFilename = sanitizeOriginalFilename(uploaded.originalname);
    const storedFilename = generateStoredFilename(validated.extension);
    const checksum = computeSha256(uploaded.buffer);

    const { storageKey } = await this.storage.upload({
      organizationId,
      applicantId: dto.applicantId,
      storedFilename,
      buffer: uploaded.buffer,
    });

    try {
      const document = await this.documentRepo.create({
        organizationId,
        applicantId: dto.applicantId,
        uploadedBy: staffId,
        category: dto.category as DocumentCategory,
        originalFilename,
        storedFilename,
        mimeType: validated.mimeType,
        fileSize: validated.size,
        storageKey,
        checksum,
        createdBy: staffId,
        ...(dto.expiresAt !== undefined ? { expiresAt: new Date(dto.expiresAt) } : {}),
      });

      void this.auditService.log({
        organizationId,
        actorId: staffId,
        actorType: 'staff',
        action: 'document.uploaded',
        resourceType: 'document',
        resourceId: document.id,
      });

      return { id: document.id, storageKey, checksum };
    } catch (err) {
      // Persistence failed after the file landed — remove the orphaned object.
      await this.storage.delete(storageKey).catch(() => undefined);
      throw err;
    }
  }

  async download(id: string, organizationId: string): Promise<DownloadResult> {
    const document = await this.documentRepo.findById(id, organizationId);
    if (!document) throw new NotFoundException('Document not found');

    const exists = await this.storage.exists(document.storageKey);
    if (!exists) throw new NotFoundException('Document file not found');

    const stream = await this.storage.download(document.storageKey);
    return {
      stream,
      filename: document.originalFilename,
      contentType: document.mimeType,
    };
  }

  async deleteFile(id: string, organizationId: string, staffId: string) {
    const document = await this.documentRepo.findById(id, organizationId);
    if (!document) throw new NotFoundException('Document not found');

    // Remove the physical object but keep the metadata row for audit history.
    await this.storage.delete(document.storageKey);
    await this.documentRepo.markFileDeleted(id, staffId);

    void this.auditService.log({
      organizationId,
      actorId: staffId,
      actorType: 'staff',
      action: 'document.file_deleted',
      resourceType: 'document',
      resourceId: id,
    });
  }
}
