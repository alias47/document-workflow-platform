import { Test, type TestingModule } from '@nestjs/testing';

import { WorkflowRepository } from '../repositories/workflow.repository';

import { PrismaService } from '@/prisma/prisma.service';

const ORG_ID = 'org-uuid-1';
const STAFF_ID = 'staff-uuid-1';
const APPLICANT_ID = 'applicant-uuid-1';
const WORKFLOW_ID = 'workflow-uuid-1';
const FROM_STAGE = 'stage-from';
const TO_STAGE = 'stage-to';

/**
 * Verifies the atomic stage-change transaction performs all three required
 * writes — ApplicantWorkflow update, WorkflowHistory insert, and AuditLog
 * create — using a single transaction client (business rule, TASK 8.1).
 */
describe('WorkflowRepository transaction behavior', () => {
  let repo: WorkflowRepository;
  let tx: {
    applicantWorkflow: { update: jest.Mock; create: jest.Mock };
    workflowHistory: { create: jest.Mock };
    auditLog: { create: jest.Mock };
  };
  let transaction: jest.Mock;

  beforeEach(async () => {
    tx = {
      applicantWorkflow: {
        update: jest.fn().mockResolvedValue({ id: WORKFLOW_ID, currentStageId: TO_STAGE }),
        create: jest.fn().mockResolvedValue({ id: WORKFLOW_ID }),
      },
      workflowHistory: { create: jest.fn().mockResolvedValue({ id: 'history-1' }) },
      auditLog: { create: jest.fn().mockResolvedValue(undefined) },
    };

    transaction = jest.fn((cb: (client: unknown) => Promise<unknown>) => cb(tx));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowRepository,
        { provide: PrismaService, useValue: { $transaction: transaction } },
      ],
    }).compile();

    repo = module.get(WorkflowRepository);
  });

  describe('changeStage', () => {
    it('runs update + history + audit inside a single transaction', async () => {
      await repo.changeStage({
        organizationId: ORG_ID,
        applicantId: APPLICANT_ID,
        workflowId: WORKFLOW_ID,
        fromStageId: FROM_STAGE,
        toStageId: TO_STAGE,
        changedBy: STAFF_ID,
        comment: 'progressing',
      });

      expect(transaction).toHaveBeenCalledTimes(1);
      expect(tx.applicantWorkflow.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: WORKFLOW_ID },
          data: expect.objectContaining({ currentStageId: TO_STAGE }),
        }),
      );
      expect(tx.workflowHistory.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            fromStageId: FROM_STAGE,
            toStageId: TO_STAGE,
            changedBy: STAFF_ID,
            comment: 'progressing',
          }),
        }),
      );
      expect(tx.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ action: 'workflow.stage_changed' }),
        }),
      );
    });

    it('propagates errors so the transaction rolls back', async () => {
      tx.workflowHistory.create.mockRejectedValue(new Error('history write failed'));

      await expect(
        repo.changeStage({
          organizationId: ORG_ID,
          applicantId: APPLICANT_ID,
          workflowId: WORKFLOW_ID,
          fromStageId: FROM_STAGE,
          toStageId: TO_STAGE,
          changedBy: STAFF_ID,
        }),
      ).rejects.toThrow('history write failed');
      expect(tx.auditLog.create).not.toHaveBeenCalled();
    });
  });

  describe('createInitialWorkflow', () => {
    it('creates the workflow and an initial history row on the supplied tx', async () => {
      await repo.createInitialWorkflow(
        {
          organizationId: ORG_ID,
          applicantId: APPLICANT_ID,
          stageId: TO_STAGE,
          createdBy: STAFF_ID,
        },
        tx as never,
      );

      expect(tx.applicantWorkflow.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ currentStageId: TO_STAGE, applicantId: APPLICANT_ID }),
        }),
      );
      expect(tx.workflowHistory.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ fromStageId: null, toStageId: TO_STAGE }),
        }),
      );
    });
  });
});
