import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { DocumentRequirementRepository } from '../repositories/document-requirement.repository';
import { DocumentRequirementService } from '../services/document-requirement.service';

import type { CreateRequirementDto } from '../dto/create-requirement.dto';
import type { UpdateRequirementDto } from '../dto/update-requirement.dto';
import type { Prisma } from '@prisma/client';

import { ActivityService } from '@/modules/activity/services/activity.service';
import { AuditService } from '@/modules/audit/services/audit.service';
import { NotificationService } from '@/modules/notification/services/notification.service';

const ORG_ID = 'org-uuid-1';
const STAFF_ID = 'staff-uuid-1';
const REQ_ID = 'req-uuid-1';
const APPLICANT_ID = 'applicant-uuid-1';

const mockRequirement = {
  id: REQ_ID,
  organizationId: ORG_ID,
  name: 'Passport',
  description: null,
  category: 'identity' as const,
  isRequired: true,
  isActive: true,
  sortOrder: 0,
  createdAt: new Date(),
  createdBy: STAFF_ID,
  updatedAt: new Date(),
  updatedBy: null,
  deletedAt: null,
  deletedBy: null,
  _count: { applicantRequirements: 0 },
};

describe('DocumentRequirementService', () => {
  let service: DocumentRequirementService;
  let repo: jest.Mocked<DocumentRequirementRepository>;
  let auditService: jest.Mocked<AuditService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentRequirementService,
        {
          provide: DocumentRequirementRepository,
          useValue: {
            findById: jest.fn(),
            findByName: jest.fn(),
            findApplicantContact: jest.fn(),
            list: jest.fn(),
            listActive: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            countAssignedApplicants: jest.fn(),
            findApplicantRequirement: jest.fn(),
            listApplicantRequirements: jest.fn(),
            syncApplicantRequirements: jest.fn(),
            updateApplicantRequirementStatus: jest.fn(),
            assignRequirementsInTransaction: jest.fn(),
            getCompletionAggregate: jest.fn(),
          },
        },
        {
          provide: AuditService,
          useValue: { log: jest.fn() },
        },
        {
          provide: ActivityService,
          useValue: { record: jest.fn() },
        },
        {
          provide: NotificationService,
          useValue: { notify: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(DocumentRequirementService);
    repo = module.get(DocumentRequirementRepository);
    auditService = module.get(AuditService);

    jest.clearAllMocks();
  });

  describe('list', () => {
    it('returns paginated requirements with meta', async () => {
      repo.list.mockResolvedValue({ data: [mockRequirement], total: 1 });
      const result = await service.list(ORG_ID, { page: 1, pageSize: 25 });
      expect(result.data).toHaveLength(1);
      expect(result.meta.totalItems).toBe(1);
    });

    it('caps pageSize at 100', async () => {
      repo.list.mockResolvedValue({ data: [], total: 0 });
      await service.list(ORG_ID, { page: 1, pageSize: 200 });
      expect(repo.list).toHaveBeenCalledWith(ORG_ID, expect.objectContaining({ pageSize: 100 }));
    });
  });

  describe('getById', () => {
    it('returns requirement when found', async () => {
      repo.findById.mockResolvedValue(mockRequirement);
      const result = await service.getById(REQ_ID, ORG_ID);
      expect(result).toEqual(mockRequirement);
    });

    it('throws NotFoundException when not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.getById('missing', ORG_ID)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const createDto: CreateRequirementDto = {
      name: 'Passport',
      category: 'identity',
    };

    it('creates requirement and logs audit', async () => {
      repo.findByName.mockResolvedValue(null);
      repo.create.mockResolvedValue(mockRequirement);

      const result = await service.create(createDto, ORG_ID, STAFF_ID);
      expect(result).toEqual(mockRequirement);
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'document.requirement_created' }),
      );
    });

    it('throws ConflictException when name already exists', async () => {
      repo.findByName.mockResolvedValue(mockRequirement);
      await expect(service.create(createDto, ORG_ID, STAFF_ID)).rejects.toThrow(ConflictException);
      expect(repo.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const updateDto: UpdateRequirementDto = { name: 'New Name' };

    it('updates requirement and logs audit', async () => {
      repo.findById.mockResolvedValue(mockRequirement);
      repo.findByName.mockResolvedValue(null);
      repo.update.mockResolvedValue({ ...mockRequirement, name: 'New Name' });

      await service.update(REQ_ID, ORG_ID, updateDto, STAFF_ID);
      expect(repo.update).toHaveBeenCalled();
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'document.requirement_updated' }),
      );
    });

    it('throws NotFoundException for unknown requirement', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.update('missing', ORG_ID, updateDto, STAFF_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ConflictException when new name is taken', async () => {
      repo.findById.mockResolvedValue(mockRequirement);
      repo.findByName.mockResolvedValue({ ...mockRequirement, id: 'other-req' });
      await expect(service.update(REQ_ID, ORG_ID, updateDto, STAFF_ID)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('archive', () => {
    it('archives requirement when no applicants assigned', async () => {
      repo.findById.mockResolvedValue(mockRequirement);
      repo.countAssignedApplicants.mockResolvedValue(0);
      repo.update.mockResolvedValue(mockRequirement);

      await service.archive(REQ_ID, ORG_ID, STAFF_ID);
      expect(repo.update).toHaveBeenCalledWith(
        REQ_ID,
        expect.objectContaining({ deletedAt: expect.any(Date) }),
      );
    });

    it('throws BadRequestException when applicants are assigned', async () => {
      repo.findById.mockResolvedValue(mockRequirement);
      repo.countAssignedApplicants.mockResolvedValue(5);
      await expect(service.archive(REQ_ID, ORG_ID, STAFF_ID)).rejects.toThrow(BadRequestException);
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('throws NotFoundException for unknown requirement', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.archive('missing', ORG_ID, STAFF_ID)).rejects.toThrow(NotFoundException);
    });
  });

  describe('assignRequirementsInTransaction', () => {
    it('assigns active requirements to applicant', async () => {
      const findMany = jest.fn().mockResolvedValue([{ id: 'req-1' }, { id: 'req-2' }]);
      const tx = { documentRequirement: { findMany } } as unknown as Prisma.TransactionClient;
      repo.assignRequirementsInTransaction.mockResolvedValue(undefined);

      await service.assignRequirementsInTransaction(tx, APPLICANT_ID, ORG_ID);
      expect(repo.assignRequirementsInTransaction).toHaveBeenCalledWith(tx, APPLICANT_ID, [
        'req-1',
        'req-2',
      ]);
    });

    it('does nothing when no active requirements exist', async () => {
      const findMany = jest.fn().mockResolvedValue([]);
      const tx = { documentRequirement: { findMany } } as unknown as Prisma.TransactionClient;

      await service.assignRequirementsInTransaction(tx, APPLICANT_ID, ORG_ID);
      expect(repo.assignRequirementsInTransaction).not.toHaveBeenCalled();
    });
  });

  describe('updateApplicantRequirementStatus', () => {
    it('throws NotFoundException when applicant requirement not found', async () => {
      repo.findApplicantRequirement.mockResolvedValue(null);
      await expect(
        service.updateApplicantRequirementStatus(
          'missing',
          ORG_ID,
          { status: 'approved' },
          STAFF_ID,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('updates status and logs audit', async () => {
      type AdrResult = Awaited<ReturnType<typeof repo.findApplicantRequirement>>;
      repo.findApplicantRequirement.mockResolvedValue({
        id: 'adr-1',
        status: 'uploaded',
        applicantId: APPLICANT_ID,
      } as unknown as AdrResult);
      type UpdateResult = Awaited<ReturnType<typeof repo.updateApplicantRequirementStatus>>;
      repo.updateApplicantRequirementStatus.mockResolvedValue({
        id: 'adr-1',
        status: 'approved',
      } as unknown as UpdateResult);

      await service.updateApplicantRequirementStatus(
        'adr-1',
        ORG_ID,
        { status: 'approved' },
        STAFF_ID,
      );
      expect(repo.updateApplicantRequirementStatus).toHaveBeenCalledWith('adr-1', 'approved');
    });
  });

  describe('getCompletionSummary', () => {
    it('derives fully-complete, incomplete, and average from the per-applicant rollup', async () => {
      repo.getCompletionAggregate.mockResolvedValue({
        // Applicant A: 2/2 approved → fully complete, 100%
        // Applicant B: 1/2 approved → incomplete, 50%
        // Applicant C: 0/1 approved → incomplete, 0%
        perApplicant: [
          { applicantId: 'A', status: 'approved', count: 2 },
          { applicantId: 'B', status: 'approved', count: 1 },
          { applicantId: 'B', status: 'pending', count: 1 },
          { applicantId: 'C', status: 'rejected', count: 1 },
        ],
        statusTotals: [
          { status: 'approved', count: 3 },
          { status: 'pending', count: 1 },
          { status: 'rejected', count: 1 },
        ],
      });

      const result = await service.getCompletionSummary(ORG_ID);

      expect(result.fullyComplete).toBe(1);
      expect(result.incomplete).toBe(2);
      // (100 + 50 + 0) / 3 = 50
      expect(result.averageCompletion).toBe(50);
      expect(result.applicantsWithRequirements).toBe(3);
    });

    it('counts awaiting-upload (pending) and missing (non-approved) documents', async () => {
      repo.getCompletionAggregate.mockResolvedValue({
        perApplicant: [
          { applicantId: 'A', status: 'pending', count: 2 },
          { applicantId: 'A', status: 'uploaded', count: 1 },
          { applicantId: 'B', status: 'rejected', count: 1 },
        ],
        statusTotals: [
          { status: 'pending', count: 2 },
          { status: 'uploaded', count: 1 },
          { status: 'rejected', count: 1 },
        ],
      });

      const result = await service.getCompletionSummary(ORG_ID);

      expect(result.awaitingUpload).toBe(2); // pending only
      expect(result.missingDocuments).toBe(4); // pending + uploaded + rejected
    });

    it('returns zeroed metrics for an organization with no requirements', async () => {
      repo.getCompletionAggregate.mockResolvedValue({ perApplicant: [], statusTotals: [] });

      const result = await service.getCompletionSummary(ORG_ID);

      expect(result).toEqual({
        fullyComplete: 0,
        incomplete: 0,
        averageCompletion: 0,
        awaitingUpload: 0,
        missingDocuments: 0,
        applicantsWithRequirements: 0,
      });
    });

    it('scopes the aggregate query to the organization', async () => {
      repo.getCompletionAggregate.mockResolvedValue({ perApplicant: [], statusTotals: [] });

      await service.getCompletionSummary(ORG_ID);

      expect(repo.getCompletionAggregate).toHaveBeenCalledWith(ORG_ID);
    });
  });
});
