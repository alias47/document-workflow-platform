import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { WorkflowRepository } from '../repositories/workflow.repository';
import { WorkflowService } from '../services/workflow.service';

import type { CreateWorkflowStageDto } from '../dto/create-workflow-stage.dto';
import type { UpdateApplicantWorkflowDto } from '../dto/update-applicant-workflow.dto';

import { ActivityService } from '@/modules/activity/services/activity.service';
import { AuditService } from '@/modules/audit/services/audit.service';
import { PrismaService } from '@/prisma/prisma.service';

const ORG_ID = 'org-uuid-1';
const STAFF_ID = 'staff-uuid-1';
const APPLICANT_ID = 'applicant-uuid-1';
const STAGE_ID = 'stage-uuid-1';
const WORKFLOW_ID = 'workflow-uuid-1';

const mockStage = {
  id: STAGE_ID,
  organizationId: ORG_ID,
  name: 'New Inquiry',
  description: null,
  color: null,
  icon: null,
  order: 0,
  isDefault: true,
  isFinal: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: STAFF_ID,
  updatedBy: null,
  deletedBy: null,
};

const mockWorkflow = {
  id: WORKFLOW_ID,
  organizationId: ORG_ID,
  applicantId: APPLICANT_ID,
  currentStageId: STAGE_ID,
  enteredStageAt: new Date(),
  expectedCompletionDate: null,
  notes: null,
  currentStage: mockStage,
};

describe('WorkflowService', () => {
  let service: WorkflowService;
  let repo: jest.Mocked<WorkflowRepository>;
  let auditService: jest.Mocked<AuditService>;
  let activityService: jest.Mocked<ActivityService>;
  let prisma: { $transaction: jest.Mock };

  beforeEach(async () => {
    prisma = {
      $transaction: jest.fn((cb: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          workflowStage: {
            create: jest.fn((args: { data: Record<string, unknown> }) =>
              Promise.resolve({ ...mockStage, ...args.data }),
            ),
            update: jest.fn((args: { data: Record<string, unknown> }) =>
              Promise.resolve({ ...mockStage, ...args.data }),
            ),
          },
        };
        return cb(tx);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowService,
        {
          provide: WorkflowRepository,
          useValue: {
            listStages: jest.fn(),
            findStageById: jest.fn(),
            findDefaultStage: jest.fn(),
            createStage: jest.fn(),
            updateStage: jest.fn(),
            softDeleteStage: jest.fn(),
            countActiveWorkflowsInStage: jest.fn(),
            clearDefaultStages: jest.fn(),
            createInitialWorkflow: jest.fn(),
            findWorkflowByApplicant: jest.fn(),
            listHistory: jest.fn(),
            changeStage: jest.fn(),
          } satisfies Partial<Record<keyof WorkflowRepository, jest.Mock>>,
        },
        { provide: AuditService, useValue: { log: jest.fn().mockResolvedValue(undefined) } },
        {
          provide: ActivityService,
          useValue: { record: jest.fn().mockResolvedValue(undefined) },
        },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(WorkflowService);
    repo = module.get(WorkflowRepository) as jest.Mocked<WorkflowRepository>;
    auditService = module.get(AuditService) as jest.Mocked<AuditService>;
    activityService = module.get(ActivityService) as jest.Mocked<ActivityService>;
  });

  describe('listStages', () => {
    it('returns stages from the repository', async () => {
      repo.listStages.mockResolvedValue([mockStage] as never);
      const result = await service.listStages(ORG_ID);
      expect(result).toHaveLength(1);
      expect(repo.listStages).toHaveBeenCalledWith(ORG_ID);
    });
  });

  describe('createStage', () => {
    const dto: CreateWorkflowStageDto = { name: 'Documents Pending' };

    it('creates a stage and logs an audit entry', async () => {
      const result = await service.createStage(dto, ORG_ID, STAFF_ID);
      expect(result.name).toBe('Documents Pending');
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'workflow.stage_created' }),
      );
    });

    it('clears existing defaults when creating a new default stage', async () => {
      await service.createStage({ name: 'Default', isDefault: true }, ORG_ID, STAFF_ID);
      expect(repo.clearDefaultStages).toHaveBeenCalledWith(ORG_ID, null, expect.anything());
    });

    it('does not clear defaults for a non-default stage', async () => {
      await service.createStage(dto, ORG_ID, STAFF_ID);
      expect(repo.clearDefaultStages).not.toHaveBeenCalled();
    });
  });

  describe('updateStage', () => {
    it('throws NotFoundException when the stage does not exist', async () => {
      repo.findStageById.mockResolvedValue(null);
      await expect(service.updateStage(STAGE_ID, ORG_ID, { name: 'x' }, STAFF_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('updates and logs an audit entry', async () => {
      repo.findStageById.mockResolvedValue(mockStage as never);
      const result = await service.updateStage(STAGE_ID, ORG_ID, { name: 'Renamed' }, STAFF_ID);
      expect(result.name).toBe('Renamed');
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'workflow.stage_updated' }),
      );
    });
  });

  describe('archiveStage', () => {
    it('throws NotFoundException when the stage does not exist', async () => {
      repo.findStageById.mockResolvedValue(null);
      await expect(service.archiveStage(STAGE_ID, ORG_ID, STAFF_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ConflictException when the stage is still in use', async () => {
      repo.findStageById.mockResolvedValue(mockStage as never);
      repo.countActiveWorkflowsInStage.mockResolvedValue(2);
      await expect(service.archiveStage(STAGE_ID, ORG_ID, STAFF_ID)).rejects.toThrow(
        ConflictException,
      );
      expect(repo.softDeleteStage).not.toHaveBeenCalled();
    });

    it('soft-deletes and logs an audit entry when the stage is unused', async () => {
      repo.findStageById.mockResolvedValue(mockStage as never);
      repo.countActiveWorkflowsInStage.mockResolvedValue(0);
      repo.softDeleteStage.mockResolvedValue(mockStage as never);
      await service.archiveStage(STAGE_ID, ORG_ID, STAFF_ID);
      expect(repo.softDeleteStage).toHaveBeenCalledWith(STAGE_ID, STAFF_ID);
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'workflow.stage_archived' }),
      );
    });
  });

  describe('getApplicantWorkflow', () => {
    it('returns the workflow when found', async () => {
      repo.findWorkflowByApplicant.mockResolvedValue(mockWorkflow as never);
      const result = await service.getApplicantWorkflow(APPLICANT_ID, ORG_ID);
      expect(result.id).toBe(WORKFLOW_ID);
    });

    it('throws NotFoundException when the applicant has no workflow', async () => {
      repo.findWorkflowByApplicant.mockResolvedValue(null);
      await expect(service.getApplicantWorkflow(APPLICANT_ID, ORG_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('changeStage', () => {
    const dto: UpdateApplicantWorkflowDto = { stageId: 'stage-uuid-2', comment: 'moving on' };

    it('throws NotFoundException when the applicant has no workflow', async () => {
      repo.findWorkflowByApplicant.mockResolvedValue(null);
      await expect(service.changeStage(APPLICANT_ID, ORG_ID, dto, STAFF_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws BadRequestException when the target stage is deleted or missing', async () => {
      repo.findWorkflowByApplicant.mockResolvedValue(mockWorkflow as never);
      repo.findStageById.mockResolvedValue(null);
      await expect(service.changeStage(APPLICANT_ID, ORG_ID, dto, STAFF_ID)).rejects.toThrow(
        BadRequestException,
      );
      expect(repo.changeStage).not.toHaveBeenCalled();
    });

    it('delegates the transition to the repository with resolved from/to stages', async () => {
      repo.findWorkflowByApplicant.mockResolvedValue(mockWorkflow as never);
      repo.findStageById.mockResolvedValue({ ...mockStage, id: 'stage-uuid-2' } as never);
      repo.changeStage.mockResolvedValue(mockWorkflow as never);

      await service.changeStage(APPLICANT_ID, ORG_ID, dto, STAFF_ID);

      expect(repo.changeStage).toHaveBeenCalledWith(
        expect.objectContaining({
          workflowId: WORKFLOW_ID,
          fromStageId: STAGE_ID,
          toStageId: 'stage-uuid-2',
          changedBy: STAFF_ID,
          comment: 'moving on',
        }),
      );
    });

    it('records a workflow.stage_changed activity for the applicant', async () => {
      repo.findWorkflowByApplicant.mockResolvedValue(mockWorkflow as never);
      repo.findStageById.mockResolvedValue({ ...mockStage, id: 'stage-uuid-2' } as never);
      repo.changeStage.mockResolvedValue(mockWorkflow as never);

      await service.changeStage(APPLICANT_ID, ORG_ID, dto, STAFF_ID);

      expect(activityService.record).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'workflow.stage_changed',
          applicantId: APPLICANT_ID,
          actorId: STAFF_ID,
        }),
      );
    });
  });

  describe('getHistory', () => {
    it('throws NotFoundException when the applicant has no workflow', async () => {
      repo.findWorkflowByApplicant.mockResolvedValue(null);
      await expect(service.getHistory(APPLICANT_ID, ORG_ID)).rejects.toThrow(NotFoundException);
    });

    it('returns history when a workflow exists', async () => {
      repo.findWorkflowByApplicant.mockResolvedValue(mockWorkflow as never);
      repo.listHistory.mockResolvedValue([{ id: 'h1' }] as never);
      const result = await service.getHistory(APPLICANT_ID, ORG_ID);
      expect(result).toHaveLength(1);
    });
  });

  describe('assignDefaultStageInTransaction', () => {
    const tx = {} as never;

    it('creates the initial workflow when a default stage exists', async () => {
      repo.findDefaultStage.mockResolvedValue(mockStage as never);
      await service.assignDefaultStageInTransaction(tx, {
        organizationId: ORG_ID,
        applicantId: APPLICANT_ID,
        staffId: STAFF_ID,
      });
      expect(repo.createInitialWorkflow).toHaveBeenCalledWith(
        expect.objectContaining({ stageId: STAGE_ID, applicantId: APPLICANT_ID }),
        tx,
      );
    });

    it('is a no-op when no default stage is configured', async () => {
      repo.findDefaultStage.mockResolvedValue(null);
      await service.assignDefaultStageInTransaction(tx, {
        organizationId: ORG_ID,
        applicantId: APPLICANT_ID,
        staffId: STAFF_ID,
      });
      expect(repo.createInitialWorkflow).not.toHaveBeenCalled();
    });
  });
});
