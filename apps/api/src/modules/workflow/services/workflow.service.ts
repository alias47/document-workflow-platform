import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { WorkflowRepository } from '../repositories/workflow.repository';

import type { CreateWorkflowStageDto } from '../dto/create-workflow-stage.dto';
import type { UpdateApplicantWorkflowDto } from '../dto/update-applicant-workflow.dto';
import type { UpdateWorkflowStageDto } from '../dto/update-workflow-stage.dto';

import { AuditService } from '@/modules/audit/services/audit.service';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class WorkflowService {
  constructor(
    private readonly workflowRepo: WorkflowRepository,
    private readonly auditService: AuditService,
    private readonly prisma: PrismaService,
  ) {}

  // --- Stages -------------------------------------------------------------

  async listStages(organizationId: string) {
    return this.workflowRepo.listStages(organizationId);
  }

  async createStage(dto: CreateWorkflowStageDto, organizationId: string, staffId: string) {
    const stage = await this.prisma.$transaction(async (tx) => {
      if (dto.isDefault) {
        await this.workflowRepo.clearDefaultStages(organizationId, null, tx);
      }
      return tx.workflowStage.create({
        data: {
          organizationId,
          name: dto.name,
          createdBy: staffId,
          ...(dto.description !== undefined ? { description: dto.description } : {}),
          ...(dto.color !== undefined ? { color: dto.color } : {}),
          ...(dto.icon !== undefined ? { icon: dto.icon } : {}),
          ...(dto.order !== undefined ? { order: dto.order } : {}),
          ...(dto.isDefault !== undefined ? { isDefault: dto.isDefault } : {}),
          ...(dto.isFinal !== undefined ? { isFinal: dto.isFinal } : {}),
        },
      });
    });

    void this.auditService.log({
      organizationId,
      actorId: staffId,
      actorType: 'staff',
      action: 'workflow.stage_created',
      resourceType: 'workflow_stage',
      resourceId: stage.id,
    });

    return stage;
  }

  async updateStage(
    id: string,
    organizationId: string,
    dto: UpdateWorkflowStageDto,
    staffId: string,
  ) {
    const existing = await this.workflowRepo.findStageById(id, organizationId);
    if (!existing) throw new NotFoundException('Workflow stage not found');

    const updated = await this.prisma.$transaction(async (tx) => {
      if (dto.isDefault) {
        await this.workflowRepo.clearDefaultStages(organizationId, id, tx);
      }
      return tx.workflowStage.update({
        where: { id },
        data: {
          updatedBy: staffId,
          ...(dto.name !== undefined ? { name: dto.name } : {}),
          ...(dto.description !== undefined ? { description: dto.description } : {}),
          ...(dto.color !== undefined ? { color: dto.color } : {}),
          ...(dto.icon !== undefined ? { icon: dto.icon } : {}),
          ...(dto.order !== undefined ? { order: dto.order } : {}),
          ...(dto.isDefault !== undefined ? { isDefault: dto.isDefault } : {}),
          ...(dto.isFinal !== undefined ? { isFinal: dto.isFinal } : {}),
        },
      });
    });

    void this.auditService.log({
      organizationId,
      actorId: staffId,
      actorType: 'staff',
      action: 'workflow.stage_updated',
      resourceType: 'workflow_stage',
      resourceId: id,
    });

    return updated;
  }

  async archiveStage(id: string, organizationId: string, staffId: string) {
    const existing = await this.workflowRepo.findStageById(id, organizationId);
    if (!existing) throw new NotFoundException('Workflow stage not found');

    // Business rule: cannot delete a stage currently used by applicants.
    const inUse = await this.workflowRepo.countActiveWorkflowsInStage(id);
    if (inUse > 0) {
      throw new ConflictException(
        'Cannot delete a workflow stage that is currently assigned to applicants',
      );
    }

    await this.workflowRepo.softDeleteStage(id, staffId);

    void this.auditService.log({
      organizationId,
      actorId: staffId,
      actorType: 'staff',
      action: 'workflow.stage_archived',
      resourceType: 'workflow_stage',
      resourceId: id,
    });
  }

  // --- Applicant workflow -------------------------------------------------

  async getApplicantWorkflow(applicantId: string, organizationId: string) {
    const workflow = await this.workflowRepo.findWorkflowByApplicant(applicantId, organizationId);
    if (!workflow) throw new NotFoundException('Workflow not found for this applicant');
    return workflow;
  }

  async getHistory(applicantId: string, organizationId: string) {
    // Surface a clear 404 when the applicant has no workflow in this org.
    await this.getApplicantWorkflow(applicantId, organizationId);
    return this.workflowRepo.listHistory(applicantId, organizationId);
  }

  async changeStage(
    applicantId: string,
    organizationId: string,
    dto: UpdateApplicantWorkflowDto,
    staffId: string,
  ) {
    const workflow = await this.workflowRepo.findWorkflowByApplicant(applicantId, organizationId);
    if (!workflow) throw new NotFoundException('Workflow not found for this applicant');

    const targetStage = await this.workflowRepo.findStageById(dto.stageId, organizationId);
    // Business rule: cannot move to a deleted (or non-existent / cross-org) stage.
    if (!targetStage) {
      throw new BadRequestException('Target workflow stage does not exist or has been deleted');
    }

    return this.workflowRepo.changeStage({
      organizationId,
      applicantId,
      workflowId: workflow.id,
      fromStageId: workflow.currentStageId,
      toStageId: dto.stageId,
      changedBy: staffId,
      ...(dto.comment !== undefined ? { comment: dto.comment } : {}),
      ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
      ...(dto.expectedCompletionDate !== undefined
        ? { expectedCompletionDate: new Date(dto.expectedCompletionDate) }
        : {}),
    });
  }

  /**
   * Assign the org's default workflow stage to a newly created applicant. Called
   * from within the applicant-creation transaction so both writes are atomic. If
   * no default stage is configured the applicant is created without a workflow
   * (workflow can be initialized later once stages are seeded).
   */
  async assignDefaultStageInTransaction(
    tx: Prisma.TransactionClient,
    params: { organizationId: string; applicantId: string; staffId: string },
  ): Promise<void> {
    const defaultStage = await this.workflowRepo.findDefaultStage(params.organizationId);
    if (!defaultStage) return;

    await this.workflowRepo.createInitialWorkflow(
      {
        organizationId: params.organizationId,
        applicantId: params.applicantId,
        stageId: defaultStage.id,
        createdBy: params.staffId,
      },
      tx,
    );
  }
}
