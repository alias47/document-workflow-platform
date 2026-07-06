import { Injectable, NotFoundException } from '@nestjs/common';

import { DocumentRepository } from '../repositories/document.repository';

import type { CreateDocumentDto } from '../dto/create-document.dto';
import type { DocumentQueryDto } from '../dto/document-query.dto';
import type { UpdateDocumentDto } from '../dto/update-document.dto';
import type { DocumentCategory, DocumentStatus } from '@prisma/client';

import { ACTIVITY_TYPES } from '@/modules/activity/interfaces/activity-type';
import { ActivityService } from '@/modules/activity/services/activity.service';
import { ApplicantService } from '@/modules/applicant/services/applicant.service';
import { AuditService } from '@/modules/audit/services/audit.service';
import { NotificationService } from '@/modules/notification/services/notification.service';
import { NOTIFICATION_TEMPLATES } from '@/modules/notification/templates/notification-templates';

@Injectable()
export class DocumentService {
  constructor(
    private readonly documentRepo: DocumentRepository,
    private readonly applicantService: ApplicantService,
    private readonly auditService: AuditService,
    private readonly activityService: ActivityService,
    private readonly notificationService: NotificationService,
  ) {}

  async list(organizationId: string, query: DocumentQueryDto) {
    const { page, pageSize, applicantId, category, status, sortBy, sortOrder } = query;

    const { data, total } = await this.documentRepo.list(organizationId, {
      page,
      pageSize,
      sortBy,
      sortOrder: sortOrder as 'asc' | 'desc',
      ...(applicantId !== undefined ? { applicantId } : {}),
      ...(category !== undefined ? { category } : {}),
      ...(status !== undefined ? { status } : {}),
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
    const document = await this.documentRepo.findById(id, organizationId);
    if (!document) throw new NotFoundException('Document not found');
    return document;
  }

  /**
   * Non-deleted document counts grouped by verification status (dashboard
   * summary). Read-only aggregate.
   */
  async countByStatus(organizationId: string) {
    return this.documentRepo.countByStatus(organizationId);
  }

  async create(dto: CreateDocumentDto, organizationId: string, staffId: string) {
    // Organization isolation: the applicant must exist within the caller's org.
    // ApplicantService.getById throws NotFoundException on org mismatch.
    await this.applicantService.getById(dto.applicantId, organizationId);

    const document = await this.documentRepo.create({
      organizationId,
      applicantId: dto.applicantId,
      uploadedBy: staffId,
      category: dto.category as DocumentCategory,
      originalFilename: dto.originalFilename,
      storedFilename: dto.storedFilename,
      mimeType: dto.mimeType,
      fileSize: dto.fileSize,
      storageKey: dto.storageKey,
      createdBy: staffId,
      ...(dto.checksum !== undefined ? { checksum: dto.checksum } : {}),
      ...(dto.expiresAt !== undefined ? { expiresAt: new Date(dto.expiresAt) } : {}),
    });

    void this.auditService.log({
      organizationId,
      actorId: staffId,
      actorType: 'staff',
      action: 'document.created',
      resourceType: 'document',
      resourceId: document.id,
    });

    void this.activityService.record({
      organizationId,
      applicantId: dto.applicantId,
      actorId: staffId,
      type: ACTIVITY_TYPES.DOCUMENT_UPLOADED,
      title: 'Document added',
      ...(dto.originalFilename !== undefined ? { description: dto.originalFilename } : {}),
      metadata: { documentId: document.id },
    });

    return { id: document.id };
  }

  async update(id: string, organizationId: string, dto: UpdateDocumentDto, staffId: string) {
    const existing = await this.documentRepo.findById(id, organizationId);
    if (!existing) throw new NotFoundException('Document not found');

    // Setting a verification decision stamps who verified it and when.
    const isVerificationDecision = dto.status === 'verified' || dto.status === 'rejected';

    const updated = await this.documentRepo.update(id, {
      ...(dto.category !== undefined ? { category: dto.category as DocumentCategory } : {}),
      ...(dto.status !== undefined ? { status: dto.status as DocumentStatus } : {}),
      ...(dto.expiresAt !== undefined ? { expiresAt: new Date(dto.expiresAt) } : {}),
      ...(dto.verificationNotes !== undefined ? { verificationNotes: dto.verificationNotes } : {}),
      ...(isVerificationDecision ? { verifiedAt: new Date(), verifiedBy: staffId } : {}),
      updatedBy: staffId,
    });

    void this.auditService.log({
      organizationId,
      actorId: staffId,
      actorType: 'staff',
      action: 'document.updated',
      resourceType: 'document',
      resourceId: id,
    });

    // A verification decision is a distinct activity worth surfacing on the log.
    if (dto.status === 'verified' || dto.status === 'rejected') {
      const verified = dto.status === 'verified';
      void this.activityService.record({
        organizationId,
        applicantId: existing.applicantId,
        actorId: staffId,
        type: verified ? ACTIVITY_TYPES.DOCUMENT_VERIFIED : ACTIVITY_TYPES.DOCUMENT_REJECTED,
        title: verified ? 'Document verified' : 'Document rejected',
        description: existing.originalFilename,
        metadata: { documentId: id },
      });

      // Trigger (11.2.4): notify the applicant of the approval/rejection decision.
      void this.notifyDecision(
        id,
        existing.applicantId,
        organizationId,
        existing.originalFilename,
        verified,
      );
    }

    return updated;
  }

  /**
   * Best-effort applicant notification for a document decision. Fetches the
   * applicant's email within the caller's org; skips silently if the applicant
   * has no email on file. Never throws into the update transaction.
   */
  private async notifyDecision(
    documentId: string,
    applicantId: string,
    organizationId: string,
    documentName: string,
    approved: boolean,
  ): Promise<void> {
    const applicant = await this.applicantService
      .getById(applicantId, organizationId)
      .catch(() => null);
    if (!applicant?.email) return;

    void this.notificationService.notify({
      organizationId,
      template: approved
        ? NOTIFICATION_TEMPLATES.DOCUMENT_APPROVED
        : NOTIFICATION_TEMPLATES.DOCUMENT_REJECTED,
      recipient: applicant.email,
      variables: {
        applicantName: `${applicant.firstName} ${applicant.lastName}`,
        documentName,
      },
      metadata: { documentId, applicantId },
    });
  }

  async archive(id: string, organizationId: string, staffId: string) {
    const existing = await this.documentRepo.findById(id, organizationId);
    if (!existing) throw new NotFoundException('Document not found');

    await this.documentRepo.softDelete(id, staffId);

    void this.auditService.log({
      organizationId,
      actorId: staffId,
      actorType: 'staff',
      action: 'document.archived',
      resourceType: 'document',
      resourceId: id,
    });

    void this.activityService.record({
      organizationId,
      applicantId: existing.applicantId,
      actorId: staffId,
      type: ACTIVITY_TYPES.DOCUMENT_DELETED,
      title: 'Document deleted',
      description: existing.originalFilename,
      metadata: { documentId: id },
    });
  }
}
