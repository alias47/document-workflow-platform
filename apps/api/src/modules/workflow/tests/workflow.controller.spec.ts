import { Test, type TestingModule } from '@nestjs/testing';

import { WorkflowController } from '../controllers/workflow.controller';
import { WorkflowService } from '../services/workflow.service';

import type { CreateWorkflowStageDto } from '../dto/create-workflow-stage.dto';
import type { UpdateApplicantWorkflowDto } from '../dto/update-applicant-workflow.dto';
import type { UpdateWorkflowStageDto } from '../dto/update-workflow-stage.dto';
import type { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';

const USER: JwtPayload = {
  sub: 'staff-uuid-1',
  email: 'admin@test.com',
  organizationId: 'org-uuid-1',
  role: 'Admin',
  permissions: ['workflow.view', 'workflow.create', 'workflow.update', 'workflow.archive'],
};

const STAGE_ID = 'stage-uuid-1';
const APPLICANT_ID = 'applicant-uuid-1';

describe('WorkflowController', () => {
  let controller: WorkflowController;
  let service: jest.Mocked<WorkflowService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkflowController],
      providers: [
        {
          provide: WorkflowService,
          useValue: {
            listStages: jest.fn(),
            createStage: jest.fn(),
            updateStage: jest.fn(),
            archiveStage: jest.fn(),
            getApplicantWorkflow: jest.fn(),
            changeStage: jest.fn(),
            getHistory: jest.fn(),
          } satisfies Partial<Record<keyof WorkflowService, jest.Mock>>,
        },
      ],
    }).compile();

    controller = module.get(WorkflowController);
    service = module.get(WorkflowService) as jest.Mocked<WorkflowService>;
  });

  describe('listStages', () => {
    it('returns a success envelope with stage data', async () => {
      service.listStages.mockResolvedValue([{ id: STAGE_ID }] as never);
      const result = await controller.listStages(USER);
      expect(result.success).toBe(true);
      expect(service.listStages).toHaveBeenCalledWith(USER.organizationId);
    });
  });

  describe('createStage', () => {
    it('forwards org and staff context to the service', async () => {
      const dto = { name: 'New Stage' } as CreateWorkflowStageDto;
      service.createStage.mockResolvedValue({ id: STAGE_ID } as never);
      const result = await controller.createStage(USER, dto);
      expect(result.data).toEqual({ id: STAGE_ID });
      expect(service.createStage).toHaveBeenCalledWith(dto, USER.organizationId, USER.sub);
    });
  });

  describe('updateStage', () => {
    it('forwards the update to the service', async () => {
      const dto = { name: 'Renamed' } as UpdateWorkflowStageDto;
      service.updateStage.mockResolvedValue({ id: STAGE_ID } as never);
      const result = await controller.updateStage(USER, STAGE_ID, dto);
      expect(result.success).toBe(true);
      expect(service.updateStage).toHaveBeenCalledWith(
        STAGE_ID,
        USER.organizationId,
        dto,
        USER.sub,
      );
    });
  });

  describe('archiveStage', () => {
    it('archives the stage and returns null data', async () => {
      service.archiveStage.mockResolvedValue(undefined);
      const result = await controller.archiveStage(USER, STAGE_ID);
      expect(result.data).toBeNull();
      expect(service.archiveStage).toHaveBeenCalledWith(STAGE_ID, USER.organizationId, USER.sub);
    });
  });

  describe('getApplicantWorkflow', () => {
    it('returns the applicant workflow in a success envelope', async () => {
      service.getApplicantWorkflow.mockResolvedValue({ id: 'wf' } as never);
      const result = await controller.getApplicantWorkflow(USER, APPLICANT_ID);
      expect(result.data).toEqual({ id: 'wf' });
      expect(service.getApplicantWorkflow).toHaveBeenCalledWith(APPLICANT_ID, USER.organizationId);
    });
  });

  describe('changeStage', () => {
    it('forwards the stage change to the service', async () => {
      const dto = { stageId: 'stage-uuid-2' } as UpdateApplicantWorkflowDto;
      service.changeStage.mockResolvedValue({ id: 'wf' } as never);
      const result = await controller.changeStage(USER, APPLICANT_ID, dto);
      expect(result.success).toBe(true);
      expect(service.changeStage).toHaveBeenCalledWith(
        APPLICANT_ID,
        USER.organizationId,
        dto,
        USER.sub,
      );
    });
  });

  describe('getHistory', () => {
    it('returns the workflow history in a success envelope', async () => {
      service.getHistory.mockResolvedValue([{ id: 'h1' }] as never);
      const result = await controller.getHistory(USER, APPLICANT_ID);
      expect(result.data).toHaveLength(1);
      expect(service.getHistory).toHaveBeenCalledWith(APPLICANT_ID, USER.organizationId);
    });
  });
});
