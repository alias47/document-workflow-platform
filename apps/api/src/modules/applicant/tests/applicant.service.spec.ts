import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { ApplicantRepository } from '../repositories/applicant.repository';
import { ApplicantService } from '../services/applicant.service';

import type { ApplicantQueryDto } from '../dto/applicant-query.dto';
import type { CreateApplicantDto } from '../dto/create-applicant.dto';
import type { UpdateApplicantDto } from '../dto/update-applicant.dto';

import { ActivityService } from '@/modules/activity/services/activity.service';
import { AuditService } from '@/modules/audit/services/audit.service';
import { DocumentRequirementService } from '@/modules/document-requirement/services/document-requirement.service';
import { NotificationService } from '@/modules/notification/services/notification.service';
import { WorkflowService } from '@/modules/workflow/services/workflow.service';
import { PrismaService } from '@/prisma/prisma.service';

const ORG_ID = 'org-uuid-1';
const STAFF_ID = 'staff-uuid-1';
const APPLICANT_ID = 'applicant-uuid-1';

const mockApplicant = {
  id: APPLICANT_ID,
  organizationId: ORG_ID,
  applicantNumber: 'APP-2026-0001',
  firstName: 'John',
  middleName: null,
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: null,
  gender: null,
  dateOfBirth: null,
  nationality: null,
  address: null,
  city: null,
  country: null,
  status: 'active',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: STAFF_ID,
  updatedBy: null,
  deletedBy: null,
  assignments: [],
};

describe('ApplicantService', () => {
  let service: ApplicantService;
  let repo: jest.Mocked<ApplicantRepository>;
  let auditService: jest.Mocked<AuditService>;
  let workflowService: jest.Mocked<WorkflowService>;
  let activityService: jest.Mocked<ActivityService>;
  let prisma: { $transaction: jest.Mock };

  beforeEach(async () => {
    prisma = {
      $transaction: jest.fn((cb: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          applicant: {
            // Return the data passed in (including generated applicantNumber) merged with mock defaults
            create: jest.fn((args: { data: Record<string, unknown> }) =>
              Promise.resolve({ ...mockApplicant, ...args.data }),
            ),
          },
          applicantAssignment: { create: jest.fn().mockResolvedValue({}) },
          documentRequirement: { findMany: jest.fn().mockResolvedValue([]) },
        };
        return cb(tx);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicantService,
        {
          provide: ApplicantRepository,
          useValue: {
            findById: jest.fn(),
            findByEmail: jest.fn(),
            countByOrganization: jest.fn(),
            list: jest.fn(),
            create: jest.fn(),
            createAssignment: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
          } satisfies Partial<Record<keyof ApplicantRepository, jest.Mock>>,
        },
        {
          provide: AuditService,
          useValue: { log: jest.fn().mockResolvedValue(undefined) },
        },
        {
          provide: WorkflowService,
          useValue: {
            assignDefaultStageInTransaction: jest.fn().mockResolvedValue(undefined),
          } satisfies Partial<Record<keyof WorkflowService, jest.Mock>>,
        },
        {
          provide: ActivityService,
          useValue: { record: jest.fn().mockResolvedValue(undefined) },
        },
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: DocumentRequirementService,
          useValue: {
            assignRequirementsInTransaction: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: NotificationService,
          useValue: { notify: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    service = module.get(ApplicantService);
    repo = module.get(ApplicantRepository) as jest.Mocked<ApplicantRepository>;
    auditService = module.get(AuditService) as jest.Mocked<AuditService>;
    workflowService = module.get(WorkflowService) as jest.Mocked<WorkflowService>;
    activityService = module.get(ActivityService) as jest.Mocked<ActivityService>;
  });

  describe('list', () => {
    it('returns paginated data and meta', async () => {
      repo.list.mockResolvedValue({ data: [mockApplicant as never], total: 1 });
      const query: ApplicantQueryDto = {
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

    it('caps pageSize at 100', async () => {
      repo.list.mockResolvedValue({ data: [], total: 0 });
      const query: ApplicantQueryDto = {
        page: 1,
        pageSize: 100,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };

      await service.list(ORG_ID, query);
      expect(repo.list).toHaveBeenCalledWith(ORG_ID, expect.objectContaining({ pageSize: 100 }));
    });
  });

  describe('getById', () => {
    it('returns applicant when found in organization', async () => {
      repo.findById.mockResolvedValue(mockApplicant as never);
      const result = await service.getById(APPLICANT_ID, ORG_ID);
      expect(result.id).toBe(APPLICANT_ID);
    });

    it('throws NotFoundException when not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.getById('bad-id', ORG_ID)).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when org mismatch (different org)', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.getById(APPLICANT_ID, 'other-org')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const createDto: CreateApplicantDto = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      assignedStaffId: STAFF_ID,
    };

    it('creates applicant and assignment in a transaction', async () => {
      repo.findByEmail.mockResolvedValue(null);
      repo.countByOrganization.mockResolvedValue(0);

      const result = await service.create(createDto, ORG_ID, STAFF_ID);

      expect(result.applicantNumber).toBe('APP-2026-0001');
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(workflowService.assignDefaultStageInTransaction).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ organizationId: ORG_ID, staffId: STAFF_ID }),
      );
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'applicant.created' }),
      );
      expect(activityService.record).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'applicant.created' }),
      );
    });

    it('throws ConflictException when email already exists', async () => {
      repo.findByEmail.mockResolvedValue(mockApplicant as never);

      await expect(service.create(createDto, ORG_ID, STAFF_ID)).rejects.toThrow(ConflictException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('skips email check when no email provided', async () => {
      repo.countByOrganization.mockResolvedValue(3);
      const dtoNoEmail: CreateApplicantDto = {
        firstName: 'Jane',
        lastName: 'Smith',
        assignedStaffId: STAFF_ID,
      };

      const result = await service.create(dtoNoEmail, ORG_ID, STAFF_ID);
      expect(repo.findByEmail).not.toHaveBeenCalled();
      expect(result.applicantNumber).toBe('APP-2026-0004');
    });

    it('generates correct applicant number sequence', async () => {
      repo.findByEmail.mockResolvedValue(null);
      repo.countByOrganization.mockResolvedValue(9);

      const result = await service.create(createDto, ORG_ID, STAFF_ID);
      expect(result.applicantNumber).toBe('APP-2026-0010');
    });
  });

  describe('update', () => {
    const updateDto: UpdateApplicantDto = { phone: '+9779811111111' };

    it('updates applicant and returns updated record', async () => {
      repo.findById.mockResolvedValue(mockApplicant as never);
      repo.update.mockResolvedValue({ ...mockApplicant, phone: '+9779811111111' } as never);

      const result = await service.update(APPLICANT_ID, ORG_ID, updateDto, STAFF_ID);
      expect(repo.update).toHaveBeenCalledWith(
        APPLICANT_ID,
        expect.objectContaining({ phone: '+9779811111111' }),
      );
      expect(result.phone).toBe('+9779811111111');
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'applicant.updated' }),
      );
      expect(activityService.record).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'applicant.updated', applicantId: APPLICANT_ID }),
      );
    });

    it('throws NotFoundException when applicant does not exist', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.update('bad-id', ORG_ID, updateDto, STAFF_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ConflictException when new email already taken', async () => {
      const otherApplicant = { ...mockApplicant, id: 'other-id' };
      repo.findById.mockResolvedValue(mockApplicant as never);
      repo.findByEmail.mockResolvedValue(otherApplicant as never);

      await expect(
        service.update(APPLICANT_ID, ORG_ID, { email: 'taken@example.com' }, STAFF_ID),
      ).rejects.toThrow(ConflictException);
    });

    it('allows updating email to same value without conflict', async () => {
      repo.findById.mockResolvedValue(mockApplicant as never);
      repo.update.mockResolvedValue(mockApplicant as never);

      await service.update(APPLICANT_ID, ORG_ID, { email: mockApplicant.email }, STAFF_ID);
      expect(repo.findByEmail).not.toHaveBeenCalled();
    });
  });

  describe('archive', () => {
    it('soft-deletes applicant and logs audit', async () => {
      repo.findById.mockResolvedValue(mockApplicant as never);
      repo.softDelete.mockResolvedValue({ ...mockApplicant, deletedAt: new Date() } as never);

      await service.archive(APPLICANT_ID, ORG_ID, STAFF_ID);

      expect(repo.softDelete).toHaveBeenCalledWith(APPLICANT_ID, STAFF_ID);
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'applicant.archived' }),
      );
    });

    it('throws NotFoundException when applicant not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.archive('bad-id', ORG_ID, STAFF_ID)).rejects.toThrow(NotFoundException);
      expect(repo.softDelete).not.toHaveBeenCalled();
    });
  });
});
