import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { DocumentRequirementRepository } from '../repositories/document-requirement.repository';

import type { CreateRequirementDto } from '../dto/create-requirement.dto';
import type { RequirementQueryDto } from '../dto/requirement-query.dto';
import type { UpdateRequirementStatusDto } from '../dto/update-requirement-status.dto';
import type { UpdateRequirementDto } from '../dto/update-requirement.dto';
import type { DocumentCategory, Prisma } from '@prisma/client';

import { ACTIVITY_TYPES } from '@/modules/activity/interfaces/activity-type';
import { ActivityService } from '@/modules/activity/services/activity.service';
import { AuditService } from '@/modules/audit/services/audit.service';
import { NotificationService } from '@/modules/notification/services/notification.service';
import { NOTIFICATION_TEMPLATES } from '@/modules/notification/templates/notification-templates';

const MAX_PAGE_SIZE = 100;

@Injectable()
export class DocumentRequirementService {
  constructor(
    private readonly requirementRepo: DocumentRequirementRepository,
    private readonly auditService: AuditService,
    private readonly activityService: ActivityService,
    private readonly notificationService: NotificationService,
  ) {}

  async list(organizationId: string, query: RequirementQueryDto) {
    const pageSize = Math.min(query.pageSize, MAX_PAGE_SIZE);

    const { data, total } = await this.requirementRepo.list(organizationId, {
      page: query.page,
      pageSize,
      ...(query.search !== undefined ? { search: query.search } : {}),
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
      ...(query.category !== undefined ? { category: query.category } : {}),
    });

    return {
      data,
      meta: {
        page: query.page,
        pageSize,
        totalItems: total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async getById(id: string, organizationId: string) {
    const req = await this.requirementRepo.findById(id, organizationId);
    if (!req) throw new NotFoundException('Document requirement not found');
    return req;
  }

  /**
   * Organization-wide document completion summary for the dashboard widget.
   * Derived from the per-applicant requirement rollup:
   *  - fullyComplete: applicants whose every requirement is approved
   *  - incomplete: applicants with at least one non-approved requirement
   *  - averageCompletion: mean approved-ratio across applicants that have
   *    requirements (0–100, rounded)
   *  - awaitingUpload: requirements still in `pending`
   *  - missingDocuments: requirements not yet approved (pending/uploaded/rejected)
   * All business logic lives here; DashboardService only consumes the result.
   */
  async getCompletionSummary(organizationId: string): Promise<{
    fullyComplete: number;
    incomplete: number;
    averageCompletion: number;
    awaitingUpload: number;
    missingDocuments: number;
    applicantsWithRequirements: number;
  }> {
    const { perApplicant, statusTotals } =
      await this.requirementRepo.getCompletionAggregate(organizationId);

    // Fold the per-(applicant,status) rows into per-applicant totals/approved.
    const byApplicant = new Map<string, { total: number; approved: number }>();
    for (const row of perApplicant) {
      const entry = byApplicant.get(row.applicantId) ?? { total: 0, approved: 0 };
      entry.total += row.count;
      if (row.status === 'approved') entry.approved += row.count;
      byApplicant.set(row.applicantId, entry);
    }

    let fullyComplete = 0;
    let incomplete = 0;
    let completionSum = 0;
    for (const { total, approved } of byApplicant.values()) {
      if (total > 0 && approved === total) {
        fullyComplete += 1;
      } else {
        incomplete += 1;
      }
      completionSum += total > 0 ? approved / total : 0;
    }

    const applicantsWithRequirements = byApplicant.size;
    const averageCompletion =
      applicantsWithRequirements > 0
        ? Math.round((completionSum / applicantsWithRequirements) * 100)
        : 0;

    const statusCount = (status: string): number =>
      statusTotals.find((s) => s.status === status)?.count ?? 0;

    const awaitingUpload = statusCount('pending');
    const missingDocuments =
      statusCount('pending') + statusCount('uploaded') + statusCount('rejected');

    return {
      fullyComplete,
      incomplete,
      averageCompletion,
      awaitingUpload,
      missingDocuments,
      applicantsWithRequirements,
    };
  }

  async create(dto: CreateRequirementDto, organizationId: string, staffId: string) {
    const existing = await this.requirementRepo.findByName(organizationId, dto.name);
    if (existing) {
      throw new ConflictException('A requirement with this name already exists');
    }

    const requirement = await this.requirementRepo.create({
      organizationId,
      name: dto.name,
      category: dto.category as DocumentCategory,
      isRequired: dto.isRequired ?? true,
      isActive: dto.isActive ?? true,
      sortOrder: dto.sortOrder ?? 0,
      createdBy: staffId,
      ...(dto.description !== undefined ? { description: dto.description } : {}),
    });

    void this.auditService.log({
      organizationId,
      actorId: staffId,
      actorType: 'staff',
      action: ACTIVITY_TYPES.DOCUMENT_REQUIREMENT_CREATED,
      resourceType: 'document_requirement',
      resourceId: requirement.id,
    });

    return requirement;
  }

  async update(id: string, organizationId: string, dto: UpdateRequirementDto, staffId: string) {
    const existing = await this.requirementRepo.findById(id, organizationId);
    if (!existing) throw new NotFoundException('Document requirement not found');

    if (dto.name && dto.name !== existing.name) {
      const conflict = await this.requirementRepo.findByName(organizationId, dto.name);
      if (conflict) throw new ConflictException('A requirement with this name already exists');
    }

    const updated = await this.requirementRepo.update(id, {
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.description !== undefined ? { description: dto.description } : {}),
      ...(dto.category !== undefined ? { category: dto.category as DocumentCategory } : {}),
      ...(dto.isRequired !== undefined ? { isRequired: dto.isRequired } : {}),
      ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
      updatedBy: staffId,
    });

    void this.auditService.log({
      organizationId,
      actorId: staffId,
      actorType: 'staff',
      action: ACTIVITY_TYPES.DOCUMENT_REQUIREMENT_UPDATED,
      resourceType: 'document_requirement',
      resourceId: id,
    });

    return updated;
  }

  async archive(id: string, organizationId: string, staffId: string) {
    const existing = await this.requirementRepo.findById(id, organizationId);
    if (!existing) throw new NotFoundException('Document requirement not found');

    const assignedCount = await this.requirementRepo.countAssignedApplicants(id);
    if (assignedCount > 0) {
      throw new BadRequestException(
        `Cannot delete a requirement currently assigned to ${assignedCount} applicant(s). Deactivate it instead.`,
      );
    }

    await this.requirementRepo.update(id, {
      deletedAt: new Date(),
      deletedBy: staffId,
      updatedBy: staffId,
    });

    void this.auditService.log({
      organizationId,
      actorId: staffId,
      actorType: 'staff',
      action: ACTIVITY_TYPES.DOCUMENT_REQUIREMENT_ARCHIVED,
      resourceType: 'document_requirement',
      resourceId: id,
    });
  }

  // ── Applicant requirements ─────────────────────────────────────────────────

  async listApplicantRequirements(applicantId: string, organizationId: string) {
    return this.requirementRepo.listApplicantRequirements(applicantId, organizationId);
  }

  async syncApplicantRequirements(applicantId: string, organizationId: string, staffId: string) {
    await this.requirementRepo.syncApplicantRequirements(applicantId, organizationId);

    void this.auditService.log({
      organizationId,
      actorId: staffId,
      actorType: 'staff',
      action: ACTIVITY_TYPES.DOCUMENT_REQUIREMENT_ASSIGNED,
      resourceType: 'applicant',
      resourceId: applicantId,
    });

    // Trigger (11.2.4): notify the applicant that new document requirements were
    // assigned. Best-effort; skips silently if the applicant has no email.
    const applicant = await this.requirementRepo.findApplicantContact(applicantId, organizationId);
    if (applicant?.email) {
      void this.notificationService.notify({
        organizationId,
        template: NOTIFICATION_TEMPLATES.NEW_DOCUMENT_REQUIREMENT_ASSIGNED,
        recipient: applicant.email,
        variables: {
          applicantName: `${applicant.firstName} ${applicant.lastName}`,
          documentName: 'required documents',
        },
        metadata: { applicantId },
      });
    }
  }

  async updateApplicantRequirementStatus(
    id: string,
    organizationId: string,
    dto: UpdateRequirementStatusDto,
    staffId: string,
  ) {
    const applicantReq = await this.requirementRepo.findApplicantRequirement(id);
    if (!applicantReq) throw new NotFoundException('Applicant document requirement not found');

    const updated = await this.requirementRepo.updateApplicantRequirementStatus(id, dto.status);

    void this.auditService.log({
      organizationId,
      actorId: staffId,
      actorType: 'staff',
      action: 'document.requirement_status_updated',
      resourceType: 'applicant_document_requirement',
      resourceId: id,
      metadata: { status: dto.status as Prisma.InputJsonValue },
    });

    return updated;
  }

  async assignRequirementsInTransaction(
    tx: Prisma.TransactionClient,
    applicantId: string,
    organizationId: string,
  ) {
    const activeReqs = await tx.documentRequirement.findMany({
      where: { organizationId, isActive: true, deletedAt: null },
      select: { id: true },
    });

    if (activeReqs.length === 0) return;

    await this.requirementRepo.assignRequirementsInTransaction(
      tx,
      applicantId,
      activeReqs.map((r) => r.id),
    );
  }
}
