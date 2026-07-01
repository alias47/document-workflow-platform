import { Injectable, NotFoundException } from '@nestjs/common';

import { DocumentRepository } from '../repositories/document.repository';

import type { CreateDocumentDto } from '../dto/create-document.dto';
import type { DocumentQueryDto } from '../dto/document-query.dto';
import type { UpdateDocumentDto } from '../dto/update-document.dto';
import type { DocumentCategory, DocumentStatus } from '@prisma/client';

import { ApplicantService } from '@/modules/applicant/services/applicant.service';
import { AuditService } from '@/modules/audit/services/audit.service';

@Injectable()
export class DocumentService {
  constructor(
    private readonly documentRepo: DocumentRepository,
    private readonly applicantService: ApplicantService,
    private readonly auditService: AuditService,
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

    return updated;
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
  }
}
