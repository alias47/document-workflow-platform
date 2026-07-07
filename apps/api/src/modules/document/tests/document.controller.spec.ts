import { Readable } from 'stream';

import { Test, type TestingModule } from '@nestjs/testing';

import { DocumentController } from '../controllers/document.controller';
import { DocumentUploadService } from '../services/document-upload.service';
import { DocumentService } from '../services/document.service';

import type { CreateDocumentDto } from '../dto/create-document.dto';
import type { DocumentQueryDto } from '../dto/document-query.dto';
import type { UpdateDocumentDto } from '../dto/update-document.dto';
import type { UploadDocumentDto } from '../dto/upload-document.dto';
import type { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import type { Response } from 'express';

const USER: JwtPayload = {
  sub: 'staff-uuid-1',
  email: 'admin@test.com',
  organizationId: 'org-uuid-1',
  role: 'Admin',
  permissions: ['document.view', 'document.create', 'document.update', 'document.archive'],
};

const DOCUMENT_ID = 'document-uuid-1';

describe('DocumentController', () => {
  let controller: DocumentController;
  let service: jest.Mocked<DocumentService>;
  let uploadService: jest.Mocked<DocumentUploadService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentController],
      providers: [
        {
          provide: DocumentService,
          useValue: {
            list: jest.fn(),
            getById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            archive: jest.fn(),
          } satisfies Partial<Record<keyof DocumentService, jest.Mock>>,
        },
        {
          provide: DocumentUploadService,
          useValue: {
            upload: jest.fn(),
            download: jest.fn(),
            deleteFile: jest.fn(),
          } satisfies Partial<Record<keyof DocumentUploadService, jest.Mock>>,
        },
      ],
    }).compile();

    controller = module.get(DocumentController);
    service = module.get(DocumentService) as jest.Mocked<DocumentService>;
    uploadService = module.get(DocumentUploadService) as jest.Mocked<DocumentUploadService>;
  });

  describe('list', () => {
    it('returns a success envelope with data and meta', async () => {
      service.list.mockResolvedValue({
        data: [],
        meta: { page: 1, pageSize: 25, totalItems: 0, totalPages: 0 },
      });
      const query = {
        page: 1,
        pageSize: 25,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      } as DocumentQueryDto;

      const result = await controller.list(USER, query);

      expect(result.success).toBe(true);
      expect(service.list).toHaveBeenCalledWith(USER.organizationId, query);
    });
  });

  describe('getById', () => {
    it('returns the document in a success envelope', async () => {
      service.getById.mockResolvedValue({ id: DOCUMENT_ID } as never);

      const result = await controller.getById(USER, DOCUMENT_ID);

      expect(result.data).toEqual({ id: DOCUMENT_ID });
      expect(service.getById).toHaveBeenCalledWith(DOCUMENT_ID, USER.organizationId);
    });
  });

  describe('create', () => {
    it('passes org and staff context to the service', async () => {
      const dto = { applicantId: 'applicant-uuid-1' } as CreateDocumentDto;
      service.create.mockResolvedValue({ id: DOCUMENT_ID });

      const result = await controller.create(USER, dto);

      expect(result.data).toEqual({ id: DOCUMENT_ID });
      expect(service.create).toHaveBeenCalledWith(dto, USER.organizationId, USER.sub);
    });
  });

  describe('update', () => {
    it('forwards the update to the service', async () => {
      const dto = { status: 'verified' } as UpdateDocumentDto;
      service.update.mockResolvedValue({ id: DOCUMENT_ID } as never);

      const result = await controller.update(USER, DOCUMENT_ID, dto);

      expect(result.success).toBe(true);
      expect(service.update).toHaveBeenCalledWith(DOCUMENT_ID, USER.organizationId, dto, USER.sub);
    });
  });

  describe('archive', () => {
    it('archives the document and returns null data', async () => {
      service.archive.mockResolvedValue(undefined);

      const result = await controller.archive(USER, DOCUMENT_ID);

      expect(result.data).toBeNull();
      expect(service.archive).toHaveBeenCalledWith(DOCUMENT_ID, USER.organizationId, USER.sub);
    });
  });

  describe('upload', () => {
    it('delegates to the upload service with org and staff context', async () => {
      const dto = { applicantId: 'applicant-uuid-1', category: 'identity' } as UploadDocumentDto;
      const file = { originalname: 'x.pdf' } as Express.Multer.File;
      uploadService.upload.mockResolvedValue({ id: DOCUMENT_ID, storageKey: 'k', checksum: 'c' });

      const result = await controller.upload(USER, file, dto);

      expect(result.success).toBe(true);
      expect(result.data.id).toBe(DOCUMENT_ID);
      expect(uploadService.upload).toHaveBeenCalledWith(file, dto, USER.organizationId, {
        type: 'staff',
        staffId: USER.sub,
      });
    });
  });

  describe('download', () => {
    it('sets content headers and returns a streamable file', async () => {
      const headers: Record<string, string> = {};
      const res = {
        setHeader: jest.fn((k: string, v: string) => (headers[k] = v)),
      } as unknown as Response;
      uploadService.download.mockResolvedValue({
        stream: Readable.from(['data']),
        filename: 'passport report.pdf',
        contentType: 'application/pdf',
      });

      const result = await controller.download(USER, DOCUMENT_ID, res);

      expect(uploadService.download).toHaveBeenCalledWith(DOCUMENT_ID, USER.organizationId);
      expect(headers['Content-Type']).toBe('application/pdf');
      // Filename is URL-encoded to prevent header injection.
      expect(headers['Content-Disposition']).toContain('passport%20report.pdf');
      expect(result.getStream).toBeDefined();
    });
  });

  describe('deleteFile', () => {
    it('deletes the physical file and returns null data', async () => {
      uploadService.deleteFile.mockResolvedValue(undefined);

      const result = await controller.deleteFile(USER, DOCUMENT_ID);

      expect(result.data).toBeNull();
      expect(uploadService.deleteFile).toHaveBeenCalledWith(
        DOCUMENT_ID,
        USER.organizationId,
        USER.sub,
      );
    });
  });
});
