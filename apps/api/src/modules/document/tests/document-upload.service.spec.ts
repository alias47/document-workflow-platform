import { Readable } from 'stream';

import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { DocumentRepository } from '../repositories/document.repository';
import { DocumentUploadService } from '../services/document-upload.service';
import { FileValidationService } from '../services/file-validation.service';

import type { UploadDocumentDto } from '../dto/upload-document.dto';

import { ApplicantService } from '@/modules/applicant/services/applicant.service';
import { AuditService } from '@/modules/audit/services/audit.service';
import { STORAGE_PROVIDER } from '@/modules/storage/interfaces/storage-provider.interface';

const ORG_ID = 'org-uuid-1';
const STAFF_ID = 'staff-uuid-1';
const APPLICANT_ID = 'applicant-uuid-1';
const DOCUMENT_ID = 'document-uuid-1';

function makeFile(): Express.Multer.File {
  return {
    fieldname: 'file',
    originalname: '../evil name.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    size: 11,
    buffer: Buffer.from('hello world'),
    stream: undefined as never,
    destination: '',
    filename: '',
    path: '',
  };
}

const uploadDto: UploadDocumentDto = { applicantId: APPLICANT_ID, category: 'identity' };

describe('DocumentUploadService', () => {
  let service: DocumentUploadService;
  let repo: jest.Mocked<DocumentRepository>;
  let applicantService: jest.Mocked<ApplicantService>;
  let auditService: jest.Mocked<AuditService>;
  let fileValidation: { validate: jest.Mock };
  let storage: {
    upload: jest.Mock;
    download: jest.Mock;
    delete: jest.Mock;
    exists: jest.Mock;
  };

  beforeEach(async () => {
    storage = {
      upload: jest
        .fn()
        .mockResolvedValue({ storageKey: 'organizations/o/applicants/a/2026/07/x.pdf' }),
      download: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined),
      exists: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentUploadService,
        {
          provide: DocumentRepository,
          useValue: {
            findById: jest.fn(),
            create: jest.fn(),
            markFileDeleted: jest.fn(),
          } satisfies Partial<Record<keyof DocumentRepository, jest.Mock>>,
        },
        {
          provide: FileValidationService,
          useValue: (fileValidation = {
            validate: jest
              .fn()
              .mockReturnValue({ extension: '.pdf', mimeType: 'application/pdf', size: 11 }),
          }),
        },
        { provide: ApplicantService, useValue: { getById: jest.fn() } },
        { provide: AuditService, useValue: { log: jest.fn().mockResolvedValue(undefined) } },
        { provide: STORAGE_PROVIDER, useValue: storage },
      ],
    }).compile();

    service = module.get(DocumentUploadService);
    repo = module.get(DocumentRepository) as jest.Mocked<DocumentRepository>;
    applicantService = module.get(ApplicantService) as jest.Mocked<ApplicantService>;
    auditService = module.get(AuditService) as jest.Mocked<AuditService>;
  });

  describe('upload', () => {
    it('validates, sanitizes name, stores file, computes checksum, and persists metadata', async () => {
      applicantService.getById.mockResolvedValue({ id: APPLICANT_ID } as never);
      repo.create.mockResolvedValue({ id: DOCUMENT_ID } as never);

      const result = await service.upload(makeFile(), uploadDto, ORG_ID, STAFF_ID);

      expect(storage.upload).toHaveBeenCalledWith(
        expect.objectContaining({ organizationId: ORG_ID, applicantId: APPLICANT_ID }),
      );
      // Original name is sanitized (no path traversal), stored name is UUID-based.
      const createArg = repo.create.mock.calls[0]?.[0];
      expect(createArg?.originalFilename).toBe('evil name.pdf');
      expect(createArg?.storedFilename).toMatch(/\.pdf$/);
      // Deterministic SHA-256 of "hello world".
      expect(createArg?.checksum).toBe(
        'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9',
      );
      expect(result.id).toBe(DOCUMENT_ID);
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'document.uploaded' }),
      );
    });

    it('rejects an invalid file before any storage work', async () => {
      fileValidation.validate.mockImplementationOnce(() => {
        throw new BadRequestException('No file provided');
      });

      await expect(service.upload(undefined, uploadDto, ORG_ID, STAFF_ID)).rejects.toThrow(
        BadRequestException,
      );
      expect(storage.upload).not.toHaveBeenCalled();
    });

    it('rolls back the stored file if metadata persistence fails', async () => {
      applicantService.getById.mockResolvedValue({ id: APPLICANT_ID } as never);
      repo.create.mockRejectedValue(new Error('db down'));

      await expect(service.upload(makeFile(), uploadDto, ORG_ID, STAFF_ID)).rejects.toThrow(
        'db down',
      );
      expect(storage.delete).toHaveBeenCalledWith('organizations/o/applicants/a/2026/07/x.pdf');
    });
  });

  describe('download', () => {
    it('returns a stream with original filename and content type', async () => {
      repo.findById.mockResolvedValue({
        id: DOCUMENT_ID,
        storageKey: 'key',
        originalFilename: 'passport.pdf',
        mimeType: 'application/pdf',
      } as never);
      storage.exists.mockResolvedValue(true);
      storage.download.mockResolvedValue(Readable.from(['data']));

      const result = await service.download(DOCUMENT_ID, ORG_ID);
      expect(result.filename).toBe('passport.pdf');
      expect(result.contentType).toBe('application/pdf');
    });

    it('throws NotFoundException when the document does not exist', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.download('bad', ORG_ID)).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when the physical file is missing', async () => {
      repo.findById.mockResolvedValue({ storageKey: 'key' } as never);
      storage.exists.mockResolvedValue(false);
      await expect(service.download(DOCUMENT_ID, ORG_ID)).rejects.toThrow(/file not found/);
    });
  });

  describe('deleteFile', () => {
    it('deletes the physical file, retains the record, and logs audit', async () => {
      repo.findById.mockResolvedValue({ id: DOCUMENT_ID, storageKey: 'key' } as never);
      repo.markFileDeleted.mockResolvedValue({ id: DOCUMENT_ID } as never);

      await service.deleteFile(DOCUMENT_ID, ORG_ID, STAFF_ID);

      expect(storage.delete).toHaveBeenCalledWith('key');
      expect(repo.markFileDeleted).toHaveBeenCalledWith(DOCUMENT_ID, STAFF_ID);
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'document.file_deleted' }),
      );
    });

    it('throws NotFoundException when document not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.deleteFile('bad', ORG_ID, STAFF_ID)).rejects.toThrow(NotFoundException);
      expect(storage.delete).not.toHaveBeenCalled();
    });
  });
});
