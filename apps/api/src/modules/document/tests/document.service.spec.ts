import { NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { DocumentRepository } from '../repositories/document.repository';
import { DocumentService } from '../services/document.service';

import type { CreateDocumentDto } from '../dto/create-document.dto';
import type { DocumentQueryDto } from '../dto/document-query.dto';
import type { UpdateDocumentDto } from '../dto/update-document.dto';

import { ActivityService } from '@/modules/activity/services/activity.service';
import { ApplicantService } from '@/modules/applicant/services/applicant.service';
import { AuditService } from '@/modules/audit/services/audit.service';
import { DocumentRequirementRepository } from '@/modules/document-requirement/repositories/document-requirement.repository';
import { NotificationService } from '@/modules/notification/services/notification.service';

const ORG_ID = 'org-uuid-1';
const STAFF_ID = 'staff-uuid-1';
const APPLICANT_ID = 'applicant-uuid-1';
const DOCUMENT_ID = 'document-uuid-1';

const mockDocument = {
  id: DOCUMENT_ID,
  organizationId: ORG_ID,
  applicantId: APPLICANT_ID,
  uploadedBy: STAFF_ID,
  category: 'identity',
  status: 'pending',
  originalFilename: 'passport.pdf',
  storedFilename: 'stored-passport.pdf',
  mimeType: 'application/pdf',
  fileSize: 204800,
  storageKey: 'org/applicant/passport.pdf',
  checksum: null,
  expiresAt: null,
  verifiedAt: null,
  verifiedBy: null,
  verificationNotes: null,
  createdAt: new Date(),
  createdBy: STAFF_ID,
  updatedAt: new Date(),
  updatedBy: null,
  deletedAt: null,
  deletedBy: null,
  uploadedByStaff: null,
};

describe('DocumentService', () => {
  let service: DocumentService;
  let repo: jest.Mocked<DocumentRepository>;
  let applicantService: jest.Mocked<ApplicantService>;
  let auditService: jest.Mocked<AuditService>;
  let activityService: jest.Mocked<ActivityService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentService,
        {
          provide: DocumentRepository,
          useValue: {
            findById: jest.fn(),
            list: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
          } satisfies Partial<Record<keyof DocumentRepository, jest.Mock>>,
        },
        {
          provide: ApplicantService,
          useValue: {
            getById: jest.fn().mockResolvedValue({
              id: APPLICANT_ID,
              firstName: 'Test',
              lastName: 'Applicant',
              email: 'applicant@test.com',
            }),
          },
        },
        {
          provide: AuditService,
          useValue: { log: jest.fn().mockResolvedValue(undefined) },
        },
        {
          provide: ActivityService,
          useValue: { record: jest.fn().mockResolvedValue(undefined) },
        },
        {
          provide: NotificationService,
          useValue: { notify: jest.fn().mockResolvedValue(undefined) },
        },
        {
          provide: DocumentRequirementRepository,
          useValue: { updateApplicantRequirementStatus: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    service = module.get(DocumentService);
    repo = module.get(DocumentRepository) as jest.Mocked<DocumentRepository>;
    applicantService = module.get(ApplicantService) as jest.Mocked<ApplicantService>;
    auditService = module.get(AuditService) as jest.Mocked<AuditService>;
    activityService = module.get(ActivityService) as jest.Mocked<ActivityService>;
  });

  describe('list', () => {
    it('returns paginated data and meta', async () => {
      repo.list.mockResolvedValue({ data: [mockDocument as never], total: 1 });
      const query: DocumentQueryDto = {
        page: 1,
        pageSize: 25,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };

      const result = await service.list(ORG_ID, query);

      expect(result.data).toHaveLength(1);
      expect(result.meta.totalItems).toBe(1);
      expect(result.meta.totalPages).toBe(1);
      expect(repo.list).toHaveBeenCalledWith(
        ORG_ID,
        expect.objectContaining({ page: 1, pageSize: 25 }),
      );
    });

    it('forwards applicant and status filters to the repository', async () => {
      repo.list.mockResolvedValue({ data: [], total: 0 });
      const query: DocumentQueryDto = {
        page: 1,
        pageSize: 25,
        applicantId: APPLICANT_ID,
        status: 'verified',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };

      await service.list(ORG_ID, query);
      expect(repo.list).toHaveBeenCalledWith(
        ORG_ID,
        expect.objectContaining({ applicantId: APPLICANT_ID, status: 'verified' }),
      );
    });
  });

  describe('getById', () => {
    it('returns document when found in organization', async () => {
      repo.findById.mockResolvedValue(mockDocument as never);
      const result = await service.getById(DOCUMENT_ID, ORG_ID);
      expect(result.id).toBe(DOCUMENT_ID);
    });

    it('throws NotFoundException when not found (including org mismatch)', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.getById(DOCUMENT_ID, 'other-org')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const createDto: CreateDocumentDto = {
      applicantId: APPLICANT_ID,
      category: 'identity',
      originalFilename: 'passport.pdf',
      storedFilename: 'stored-passport.pdf',
      mimeType: 'application/pdf',
      fileSize: 204800,
      storageKey: 'org/applicant/passport.pdf',
    };

    it('verifies applicant org isolation, creates the record, and logs audit', async () => {
      applicantService.getById.mockResolvedValue({ id: APPLICANT_ID } as never);
      repo.create.mockResolvedValue(mockDocument as never);

      const result = await service.create(createDto, ORG_ID, STAFF_ID);

      expect(applicantService.getById).toHaveBeenCalledWith(APPLICANT_ID, ORG_ID);
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ organizationId: ORG_ID, uploadedBy: STAFF_ID }),
      );
      expect(result.id).toBe(DOCUMENT_ID);
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'document.created' }),
      );
      expect(activityService.record).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'document.uploaded', applicantId: APPLICANT_ID }),
      );
    });

    it('propagates NotFoundException when applicant is in another org', async () => {
      applicantService.getById.mockRejectedValue(new NotFoundException('Applicant not found'));

      await expect(service.create(createDto, ORG_ID, STAFF_ID)).rejects.toThrow(NotFoundException);
      expect(repo.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('stamps verifier when status becomes verified', async () => {
      const dto: UpdateDocumentDto = { status: 'verified', verificationNotes: 'Looks good' };
      repo.findById.mockResolvedValue(mockDocument as never);
      repo.update.mockResolvedValue({ ...mockDocument, status: 'verified' } as never);

      const result = await service.update(DOCUMENT_ID, ORG_ID, dto, STAFF_ID);

      expect(repo.update).toHaveBeenCalledWith(
        DOCUMENT_ID,
        expect.objectContaining({ status: 'verified', verifiedBy: STAFF_ID }),
      );
      expect(result.status).toBe('verified');
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'document.updated' }),
      );
      expect(activityService.record).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'document.verified', applicantId: APPLICANT_ID }),
      );
    });

    it('records a rejected activity when status becomes rejected', async () => {
      const dto: UpdateDocumentDto = { status: 'rejected', verificationNotes: 'Blurry scan' };
      repo.findById.mockResolvedValue(mockDocument as never);
      repo.update.mockResolvedValue({ ...mockDocument, status: 'rejected' } as never);

      await service.update(DOCUMENT_ID, ORG_ID, dto, STAFF_ID);

      expect(activityService.record).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'document.rejected' }),
      );
    });

    it('does not record a verification activity for a plain category change', async () => {
      const dto: UpdateDocumentDto = { category: 'academic' };
      repo.findById.mockResolvedValue(mockDocument as never);
      repo.update.mockResolvedValue(mockDocument as never);

      await service.update(DOCUMENT_ID, ORG_ID, dto, STAFF_ID);

      expect(activityService.record).not.toHaveBeenCalled();
    });

    it('does not stamp a verifier for a plain category change', async () => {
      const dto: UpdateDocumentDto = { category: 'academic' };
      repo.findById.mockResolvedValue(mockDocument as never);
      repo.update.mockResolvedValue(mockDocument as never);

      await service.update(DOCUMENT_ID, ORG_ID, dto, STAFF_ID);

      const updateArg = repo.update.mock.calls[0]?.[1];
      expect(updateArg).not.toHaveProperty('verifiedBy');
    });

    it('throws NotFoundException when document does not exist', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(
        service.update('bad-id', ORG_ID, { category: 'other' }, STAFF_ID),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('archive', () => {
    it('soft-deletes document and logs audit', async () => {
      repo.findById.mockResolvedValue(mockDocument as never);
      repo.softDelete.mockResolvedValue({ ...mockDocument, deletedAt: new Date() } as never);

      await service.archive(DOCUMENT_ID, ORG_ID, STAFF_ID);

      expect(repo.softDelete).toHaveBeenCalledWith(DOCUMENT_ID, STAFF_ID);
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'document.archived' }),
      );
      expect(activityService.record).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'document.deleted', applicantId: APPLICANT_ID }),
      );
    });

    it('throws NotFoundException when document not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.archive('bad-id', ORG_ID, STAFF_ID)).rejects.toThrow(NotFoundException);
      expect(repo.softDelete).not.toHaveBeenCalled();
    });
  });
});
