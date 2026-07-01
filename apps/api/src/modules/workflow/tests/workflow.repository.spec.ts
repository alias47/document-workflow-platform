/**
 * Integration tests for WorkflowRepository.
 * These tests run against a real PostgreSQL database (via PrismaService).
 * Requires DATABASE_URL to be set and `prisma migrate deploy` to have run.
 *
 * Run with: TEST_ORG_ID=<uuid> TEST_STAFF_ID=<uuid> TEST_APPLICANT_ID=<uuid> \
 *   npx jest workflow.repository.spec.ts
 */
import { Test, type TestingModule } from '@nestjs/testing';

import { WorkflowRepository } from '../repositories/workflow.repository';

import { PrismaModule } from '@/prisma/prisma.module';
import { PrismaService } from '@/prisma/prisma.service';

const TEST_ORG_ID = process.env['TEST_ORG_ID'];
const TEST_STAFF_ID = process.env['TEST_STAFF_ID'];
const TEST_APPLICANT_ID = process.env['TEST_APPLICANT_ID'];
const RUN_INTEGRATION = Boolean(TEST_ORG_ID && TEST_STAFF_ID && TEST_APPLICANT_ID);

const describeIntegration = RUN_INTEGRATION ? describe : describe.skip;

describeIntegration('WorkflowRepository (integration)', () => {
  const orgId = TEST_ORG_ID ?? '';
  const staffId = TEST_STAFF_ID ?? '';
  const applicantId = TEST_APPLICANT_ID ?? '';

  let repo: WorkflowRepository;
  let prisma: PrismaService;
  const createdStageIds: string[] = [];

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [WorkflowRepository],
    }).compile();

    repo = module.get(WorkflowRepository);
    prisma = module.get(PrismaService);

    // Start from a clean slate: remove any pre-existing workflow/history for the
    // test applicant (e.g. seeded data) so createInitialWorkflow is deterministic.
    await prisma.workflowHistory.deleteMany({ where: { applicantId } });
    await prisma.applicantWorkflow.deleteMany({ where: { applicantId } });
  });

  afterAll(async () => {
    await prisma.workflowHistory.deleteMany({ where: { applicantId } });
    await prisma.applicantWorkflow.deleteMany({ where: { applicantId } });
    if (createdStageIds.length) {
      await prisma.workflowStage.deleteMany({ where: { id: { in: createdStageIds } } });
    }
    await prisma.$disconnect();
  });

  async function createTestStage(suffix: string, isDefault = false) {
    const stage = await repo.createStage({
      organizationId: orgId,
      name: `Test Stage ${suffix}-${Date.now()}`,
      isDefault,
      createdBy: staffId,
    });
    createdStageIds.push(stage.id);
    return stage;
  }

  describe('stage lifecycle', () => {
    it('creates and finds a stage within the same org', async () => {
      const stage = await createTestStage('create');
      const found = await repo.findStageById(stage.id, orgId);
      expect(found?.id).toBe(stage.id);
    });

    it('returns null for a stage in another org', async () => {
      const stage = await createTestStage('org-mismatch');
      const found = await repo.findStageById(stage.id, '00000000-0000-0000-0000-0000000000ff');
      expect(found).toBeNull();
    });

    it('excludes a soft-deleted stage from findStageById', async () => {
      const stage = await createTestStage('soft-delete');
      await repo.softDeleteStage(stage.id, staffId);
      const found = await repo.findStageById(stage.id, orgId);
      expect(found).toBeNull();
    });
  });

  describe('changeStage transaction', () => {
    it('updates the workflow, appends history, and writes an audit log atomically', async () => {
      const fromStage = await createTestStage('from', true);
      const toStage = await createTestStage('to');

      const workflow = await prisma.$transaction((tx) =>
        repo.createInitialWorkflow(
          { organizationId: orgId, applicantId, stageId: fromStage.id, createdBy: staffId },
          tx,
        ),
      );

      await repo.changeStage({
        organizationId: orgId,
        applicantId,
        workflowId: workflow.id,
        fromStageId: fromStage.id,
        toStageId: toStage.id,
        changedBy: staffId,
        comment: 'integration move',
      });

      const updated = await repo.findWorkflowByApplicant(applicantId, orgId);
      expect(updated?.currentStageId).toBe(toStage.id);

      const history = await repo.listHistory(applicantId, orgId);
      expect(history.some((h) => h.toStageId === toStage.id)).toBe(true);

      const audit = await prisma.auditLog.findFirst({
        where: { resourceId: workflow.id, action: 'workflow.stage_changed' },
      });
      expect(audit).not.toBeNull();
    });
  });

  describe('countActiveWorkflowsInStage', () => {
    it('reports stages currently in use', async () => {
      const workflow = await repo.findWorkflowByApplicant(applicantId, orgId);
      if (workflow) {
        const count = await repo.countActiveWorkflowsInStage(workflow.currentStageId);
        expect(count).toBeGreaterThanOrEqual(1);
      }
    });
  });
});
