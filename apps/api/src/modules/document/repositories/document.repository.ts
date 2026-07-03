import { Injectable } from '@nestjs/common';
import { Prisma, type DocumentCategory, type DocumentStatus } from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';

export interface CreateDocumentData {
  organizationId: string;
  applicantId: string;
  uploadedBy: string;
  category: DocumentCategory;
  originalFilename: string;
  storedFilename: string;
  mimeType: string;
  fileSize: number;
  storageKey: string;
  checksum?: string;
  expiresAt?: Date;
  createdBy: string;
  requirementId?: string;
}

export interface UpdateDocumentData {
  category?: DocumentCategory;
  status?: DocumentStatus;
  expiresAt?: Date;
  verificationNotes?: string;
  verifiedAt?: Date;
  verifiedBy?: string;
  updatedBy?: string;
}

export interface DocumentListOptions {
  page: number;
  pageSize: number;
  applicantId?: string;
  category?: string;
  status?: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const UPLOADER_INCLUDE = {
  uploadedByStaff: { select: { id: true, firstName: true, lastName: true } },
} satisfies Prisma.DocumentInclude;

@Injectable()
export class DocumentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string, organizationId: string) {
    return this.prisma.document.findFirst({
      where: { id, organizationId, deletedAt: null },
      include: UPLOADER_INCLUDE,
    });
  }

  async list(organizationId: string, opts: DocumentListOptions) {
    const { page, pageSize, applicantId, category, status, sortBy, sortOrder } = opts;

    const where: Prisma.DocumentWhereInput = {
      organizationId,
      deletedAt: null,
      ...(applicantId ? { applicantId } : {}),
      ...(category ? { category: category as DocumentCategory } : {}),
      ...(status ? { status: status as DocumentStatus } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        include: UPLOADER_INCLUDE,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.document.count({ where }),
    ]);

    return { data, total };
  }

  async create(data: CreateDocumentData) {
    return this.prisma.document.create({
      data: {
        organizationId: data.organizationId,
        applicantId: data.applicantId,
        uploadedBy: data.uploadedBy,
        category: data.category,
        originalFilename: data.originalFilename,
        storedFilename: data.storedFilename,
        mimeType: data.mimeType,
        fileSize: data.fileSize,
        storageKey: data.storageKey,
        createdBy: data.createdBy,
        ...(data.checksum !== undefined ? { checksum: data.checksum } : {}),
        ...(data.expiresAt !== undefined ? { expiresAt: data.expiresAt } : {}),
        ...(data.requirementId !== undefined ? { requirementId: data.requirementId } : {}),
      },
    });
  }

  async update(id: string, data: UpdateDocumentData) {
    return this.prisma.document.update({
      where: { id },
      data: {
        ...(data.category !== undefined ? { category: data.category } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.expiresAt !== undefined ? { expiresAt: data.expiresAt } : {}),
        ...(data.verificationNotes !== undefined
          ? { verificationNotes: data.verificationNotes }
          : {}),
        ...(data.verifiedAt !== undefined ? { verifiedAt: data.verifiedAt } : {}),
        ...(data.verifiedBy !== undefined ? { verifiedBy: data.verifiedBy } : {}),
        ...(data.updatedBy !== undefined ? { updatedBy: data.updatedBy } : {}),
      },
      include: UPLOADER_INCLUDE,
    });
  }

  async softDelete(id: string, deletedBy: string) {
    return this.prisma.document.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy, status: 'archived' },
    });
  }

  /**
   * Record that the physical file was removed while retaining the metadata row
   * for audit. Sets status to `archived` and stamps the actor. The DB record is
   * intentionally NOT soft-deleted — only the underlying file is gone.
   */
  async markFileDeleted(id: string, updatedBy: string) {
    return this.prisma.document.update({
      where: { id },
      data: { status: 'archived', updatedBy },
      include: UPLOADER_INCLUDE,
    });
  }
}
