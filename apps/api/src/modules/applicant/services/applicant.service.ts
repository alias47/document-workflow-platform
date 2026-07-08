import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { ApplicantRepository } from '../repositories/applicant.repository';

import type { ApplicantQueryDto } from '../dto/applicant-query.dto';
import type { CreateApplicantDto } from '../dto/create-applicant.dto';
import type { UpdateApplicantDto } from '../dto/update-applicant.dto';

import { ACTIVITY_TYPES } from '@/modules/activity/interfaces/activity-type';
import { ActivityService } from '@/modules/activity/services/activity.service';
import { AuditService } from '@/modules/audit/services/audit.service';
import { DocumentRequirementService } from '@/modules/document-requirement/services/document-requirement.service';
import { NotificationService } from '@/modules/notification/services/notification.service';
import { NOTIFICATION_TEMPLATES } from '@/modules/notification/templates/notification-templates';
import { WorkflowService } from '@/modules/workflow/services/workflow.service';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class ApplicantService {
  constructor(
    private readonly applicantRepo: ApplicantRepository,
    private readonly auditService: AuditService,
    private readonly workflowService: WorkflowService,
    private readonly activityService: ActivityService,
    private readonly prisma: PrismaService,
    private readonly requirementService: DocumentRequirementService,
    private readonly notificationService: NotificationService,
  ) {}

  async list(organizationId: string, query: ApplicantQueryDto) {
    const { page, pageSize, search, status, assignedTo, sortBy, sortOrder } = query;

    const { data, total } = await this.applicantRepo.list(organizationId, {
      page,
      pageSize,
      sortBy,
      sortOrder: sortOrder as 'asc' | 'desc',
      ...(search !== undefined ? { search } : {}),
      ...(status !== undefined ? { status } : {}),
      ...(assignedTo !== undefined ? { assignedTo } : {}),
    });

    return {
      data,
      meta: {
        page,
        pageSize,
        totalItems: total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async getById(id: string, organizationId: string) {
    const applicant = await this.applicantRepo.findById(id, organizationId);
    if (!applicant) throw new NotFoundException('Applicant not found');
    return applicant;
  }

  /**
   * Non-deleted applicant counts grouped by lifecycle status, for the dashboard
   * summary. Read-only aggregate.
   */
  async countByStatus(organizationId: string) {
    return this.applicantRepo.countByStatus(organizationId);
  }

  async create(dto: CreateApplicantDto, organizationId: string, staffId: string) {
    if (dto.email) {
      const existing = await this.applicantRepo.findByEmail(organizationId, dto.email);
      if (existing) {
        throw new ConflictException('An applicant with this email already exists');
      }
    }

    const applicantNumber = await this.generateApplicantNumber(organizationId);

    // Transaction: create applicant + primary assignment atomically
    const applicant = await this.prisma.$transaction(async (tx) => {
      const created = await tx.applicant.create({
        data: {
          organizationId,
          applicantNumber,
          firstName: dto.firstName,
          lastName: dto.lastName,
          createdBy: staffId,
          ...(dto.middleName !== undefined ? { middleName: dto.middleName } : {}),
          ...(dto.gender !== undefined ? { gender: dto.gender } : {}),
          ...(dto.dateOfBirth !== undefined ? { dateOfBirth: new Date(dto.dateOfBirth) } : {}),
          ...(dto.nationality !== undefined ? { nationality: dto.nationality } : {}),
          ...(dto.email !== undefined ? { email: dto.email } : {}),
          ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
          ...(dto.address !== undefined ? { address: dto.address } : {}),
          ...(dto.city !== undefined ? { city: dto.city } : {}),
          ...(dto.country !== undefined ? { country: dto.country } : {}),
        },
      });

      await tx.applicantAssignment.create({
        data: {
          organizationId,
          applicantId: created.id,
          staffId: dto.assignedStaffId,
          assignedBy: staffId,
          isPrimary: true,
        },
      });

      // Business rule: a newly created applicant is placed into the org's
      // default workflow stage as part of the same atomic transaction.
      await this.workflowService.assignDefaultStageInTransaction(tx, {
        organizationId,
        applicantId: created.id,
        staffId,
      });

      // Assign all active document requirements to this applicant in the same transaction.
      await this.requirementService.assignRequirementsInTransaction(tx, created.id, organizationId);

      return created;
    });

    void this.auditService.log({
      organizationId,
      actorId: staffId,
      actorType: 'staff',
      action: 'applicant.created',
      resourceType: 'applicant',
      resourceId: applicant.id,
    });

    void this.activityService.record({
      organizationId,
      applicantId: applicant.id,
      actorId: staffId,
      type: ACTIVITY_TYPES.APPLICANT_CREATED,
      title: 'Applicant created',
    });

    // Trigger (11.2.4): when the applicant is created with an email, invite them
    // to their portal. Routed through NotificationService — best-effort, never
    // blocks or fails applicant creation.
    if (dto.email) {
      void this.notificationService.notify({
        organizationId,
        template: NOTIFICATION_TEMPLATES.APPLICANT_PORTAL_INVITATION,
        recipient: dto.email,
        variables: { applicantName: `${dto.firstName} ${dto.lastName}` },
        metadata: { applicantId: applicant.id },
      });
    }

    return { id: applicant.id, applicantNumber: applicant.applicantNumber };
  }

  async update(id: string, organizationId: string, dto: UpdateApplicantDto, staffId: string) {
    const existing = await this.applicantRepo.findById(id, organizationId);
    if (!existing) throw new NotFoundException('Applicant not found');

    if (dto.email && dto.email !== existing.email) {
      const conflict = await this.applicantRepo.findByEmail(organizationId, dto.email);
      if (conflict) throw new ConflictException('An applicant with this email already exists');
    }

    const updated = await this.applicantRepo.update(id, {
      ...(dto.firstName !== undefined ? { firstName: dto.firstName } : {}),
      ...(dto.middleName !== undefined ? { middleName: dto.middleName } : {}),
      ...(dto.lastName !== undefined ? { lastName: dto.lastName } : {}),
      ...(dto.gender !== undefined ? { gender: dto.gender } : {}),
      ...(dto.dateOfBirth !== undefined ? { dateOfBirth: new Date(dto.dateOfBirth) } : {}),
      ...(dto.nationality !== undefined ? { nationality: dto.nationality } : {}),
      ...(dto.email !== undefined ? { email: dto.email } : {}),
      ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
      ...(dto.address !== undefined ? { address: dto.address } : {}),
      ...(dto.city !== undefined ? { city: dto.city } : {}),
      ...(dto.country !== undefined ? { country: dto.country } : {}),
      updatedBy: staffId,
    });

    void this.auditService.log({
      organizationId,
      actorId: staffId,
      actorType: 'staff',
      action: 'applicant.updated',
      resourceType: 'applicant',
      resourceId: id,
    });

    void this.activityService.record({
      organizationId,
      applicantId: id,
      actorId: staffId,
      type: ACTIVITY_TYPES.APPLICANT_UPDATED,
      title: 'Applicant details updated',
    });

    return updated;
  }

  async archive(id: string, organizationId: string, staffId: string) {
    const existing = await this.applicantRepo.findById(id, organizationId);
    if (!existing) throw new NotFoundException('Applicant not found');

    await this.applicantRepo.softDelete(id, staffId);

    void this.auditService.log({
      organizationId,
      actorId: staffId,
      actorType: 'staff',
      action: 'applicant.archived',
      resourceType: 'applicant',
      resourceId: id,
    });
  }

  private async generateApplicantNumber(_organizationId: string): Promise<string> {
    const total = await this.applicantRepo.countAll();
    const year = new Date().getFullYear();
    const seq = String(total + 1).padStart(4, '0');
    return `APP-${year}-${seq}`;
  }
}
