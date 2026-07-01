import { Test, type TestingModule } from '@nestjs/testing';

import { DocumentController } from '../controllers/document.controller';
import { DocumentService } from '../services/document.service';

import type { CreateDocumentDto } from '../dto/create-document.dto';
import type { DocumentQueryDto } from '../dto/document-query.dto';
import type { UpdateDocumentDto } from '../dto/update-document.dto';
import type { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';

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
      ],
    }).compile();

    controller = module.get(DocumentController);
    service = module.get(DocumentService) as jest.Mocked<DocumentService>;
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
});
