import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';

export interface CreateWorkflowStageData {
  organizationId: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  order?: number;
  isDefault?: boolean;
  isFinal?: boolean;
  createdBy: string;
}

export interface UpdateWorkflowStageData {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  order?: number;
  isDefault?: boolean;
  isFinal?: boolean;
  updatedBy: string;
}

export interface ChangeStageData {
  organizationId: string;
  applicantId: string;
  workflowId: string;
  fromStageId: string;
  toStageId: string;
  changedBy: string;
  comment?: string;
  expectedCompletionDate?: Date;
  notes?: string;
}

@Injectable()
export class WorkflowRepository {
  constructor(private readonly prisma: PrismaService) {}

  // --- Stages -------------------------------------------------------------

  async listStages(organizationId: string) {
    return this.prisma.workflowStage.findMany({
      where: { organizationId, deletedAt: null },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async findStageById(id: string, organizationId: string) {
    return this.prisma.workflowStage.findFirst({
      where: { id, organizationId, deletedAt: null },
    });
  }

  /**
   * Distribution of active (non-deleted) applicants across every workflow stage.
   * Returns one row per stage — including stages with zero applicants — ordered
   * by the stage's configured order. Stage names are never hardcoded; they come
   * straight from the workflow configuration. Single query, no N+1: the per-stage
   * count is a filtered `_count` relation aggregate.
   */
  async getStageDistribution(organizationId: string) {
    const stages = await this.prisma.workflowStage.findMany({
      where: { organizationId, deletedAt: null },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        name: true,
        color: true,
        order: true,
        isFinal: true,
        _count: {
          select: {
            currentWorkflows: {
              where: {
                deletedAt: null,
                applicant: { deletedAt: null, organizationId },
              },
            },
          },
        },
      },
    });

    return stages.map((s) => ({
      stageId: s.id,
      stageName: s.name,
      color: s.color,
      order: s.order,
      isFinal: s.isFinal,
      applicantCount: s._count.currentWorkflows,
    }));
  }

  async findDefaultStage(organizationId: string) {
    return this.prisma.workflowStage.findFirst({
      where: { organizationId, isDefault: true, deletedAt: null },
      orderBy: { order: 'asc' },
    });
  }

  async createStage(data: CreateWorkflowStageData) {
    return this.prisma.workflowStage.create({
      data: {
        organizationId: data.organizationId,
        name: data.name,
        createdBy: data.createdBy,
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.color !== undefined ? { color: data.color } : {}),
        ...(data.icon !== undefined ? { icon: data.icon } : {}),
        ...(data.order !== undefined ? { order: data.order } : {}),
        ...(data.isDefault !== undefined ? { isDefault: data.isDefault } : {}),
        ...(data.isFinal !== undefined ? { isFinal: data.isFinal } : {}),
      },
    });
  }

  async updateStage(id: string, data: UpdateWorkflowStageData) {
    return this.prisma.workflowStage.update({
      where: { id },
      data: {
        updatedBy: data.updatedBy,
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.color !== undefined ? { color: data.color } : {}),
        ...(data.icon !== undefined ? { icon: data.icon } : {}),
        ...(data.order !== undefined ? { order: data.order } : {}),
        ...(data.isDefault !== undefined ? { isDefault: data.isDefault } : {}),
        ...(data.isFinal !== undefined ? { isFinal: data.isFinal } : {}),
      },
    });
  }

  async softDeleteStage(id: string, deletedBy: string) {
    return this.prisma.workflowStage.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy },
    });
  }

  /**
   * Count active applicants currently sitting in the given stage. Used to
   * block deletion of a stage that is still in use.
   */
  async countActiveWorkflowsInStage(stageId: string): Promise<number> {
    return this.prisma.applicantWorkflow.count({
      where: { currentStageId: stageId, deletedAt: null },
    });
  }

  /**
   * Clears the isDefault flag on every other stage in the org so exactly one
   * default remains. Runs inside the supplied transaction when provided.
   */
  async clearDefaultStages(
    organizationId: string,
    exceptId: string | null,
    tx: Prisma.TransactionClient = this.prisma,
  ): Promise<void> {
    await tx.workflowStage.updateMany({
      where: {
        organizationId,
        isDefault: true,
        deletedAt: null,
        ...(exceptId !== null ? { id: { not: exceptId } } : {}),
      },
      data: { isDefault: false },
    });
  }

  // --- Applicant workflow -------------------------------------------------

  /**
   * Create the initial ApplicantWorkflow + first WorkflowHistory row for a newly
   * created applicant. Runs inside the caller's transaction so applicant creation
   * and workflow assignment succeed or roll back together (business rule).
   */
  async createInitialWorkflow(
    data: {
      organizationId: string;
      applicantId: string;
      stageId: string;
      createdBy: string;
    },
    tx: Prisma.TransactionClient,
  ) {
    const workflow = await tx.applicantWorkflow.create({
      data: {
        organizationId: data.organizationId,
        applicantId: data.applicantId,
        currentStageId: data.stageId,
        createdBy: data.createdBy,
      },
    });

    await tx.workflowHistory.create({
      data: {
        organizationId: data.organizationId,
        applicantId: data.applicantId,
        fromStageId: null,
        toStageId: data.stageId,
        changedBy: data.createdBy,
        comment: 'Workflow initialized',
      },
    });

    return workflow;
  }

  async findWorkflowByApplicant(applicantId: string, organizationId: string) {
    return this.prisma.applicantWorkflow.findFirst({
      where: { applicantId, organizationId, deletedAt: null },
      include: { currentStage: true },
    });
  }

  async listHistory(applicantId: string, organizationId: string) {
    return this.prisma.workflowHistory.findMany({
      where: { applicantId, organizationId },
      orderBy: { changedAt: 'desc' },
    });
  }

  /**
   * Atomically move an applicant to a new stage: update the ApplicantWorkflow,
   * append an immutable WorkflowHistory row, and write an AuditLog — all inside
   * a single transaction (business rule, TASK 8.1).
   */
  async changeStage(data: ChangeStageData) {
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.applicantWorkflow.update({
        where: { id: data.workflowId },
        data: {
          currentStageId: data.toStageId,
          enteredStageAt: new Date(),
          updatedBy: data.changedBy,
          ...(data.expectedCompletionDate !== undefined
            ? { expectedCompletionDate: data.expectedCompletionDate }
            : {}),
          ...(data.notes !== undefined ? { notes: data.notes } : {}),
        },
        include: { currentStage: true },
      });

      await tx.workflowHistory.create({
        data: {
          organizationId: data.organizationId,
          applicantId: data.applicantId,
          fromStageId: data.fromStageId,
          toStageId: data.toStageId,
          changedBy: data.changedBy,
          ...(data.comment !== undefined ? { comment: data.comment } : {}),
        },
      });

      await tx.auditLog.create({
        data: {
          organizationId: data.organizationId,
          actorId: data.changedBy,
          actorType: 'staff',
          action: 'workflow.stage_changed',
          resourceType: 'applicant_workflow',
          resourceId: data.workflowId,
          metadata: { fromStageId: data.fromStageId, toStageId: data.toStageId },
        },
      });

      return updated;
    });
  }
}
