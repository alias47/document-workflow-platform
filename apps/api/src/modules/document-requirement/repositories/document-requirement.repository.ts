import { Injectable } from '@nestjs/common';
import { type DocumentCategory, type RequirementStatus, Prisma } from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';

export interface CreateRequirementData {
  organizationId: string;
  name: string;
  category: DocumentCategory;
  isRequired: boolean;
  isActive: boolean;
  sortOrder: number;
  createdBy: string;
  description?: string | undefined;
}

export interface UpdateRequirementData {
  name?: string | undefined;
  description?: string | undefined;
  category?: DocumentCategory | undefined;
  isRequired?: boolean | undefined;
  isActive?: boolean | undefined;
  sortOrder?: number | undefined;
  deletedAt?: Date | undefined;
  deletedBy?: string | undefined;
  updatedBy?: string | undefined;
}

export interface RequirementListOptions {
  page: number;
  pageSize: number;
  search?: string | undefined;
  isActive?: boolean | undefined;
  category?: DocumentCategory | undefined;
}

@Injectable()
export class DocumentRequirementRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Minimal applicant contact lookup for notification triggers. */
  async findApplicantContact(applicantId: string, organizationId: string) {
    return this.prisma.applicant.findFirst({
      where: { id: applicantId, organizationId },
      select: { firstName: true, lastName: true, email: true },
    });
  }

  async findById(id: string, organizationId: string) {
    return this.prisma.documentRequirement.findFirst({
      where: { id, organizationId, deletedAt: null },
      include: {
        _count: { select: { applicantRequirements: true } },
      },
    });
  }

  async findByName(organizationId: string, name: string) {
    return this.prisma.documentRequirement.findFirst({
      where: { organizationId, name, deletedAt: null },
    });
  }

  async list(organizationId: string, opts: RequirementListOptions) {
    const { page, pageSize, search, isActive, category } = opts;
    const where: Prisma.DocumentRequirementWhereInput = {
      organizationId,
      deletedAt: null,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(isActive !== undefined ? { isActive } : {}),
      ...(category !== undefined ? { category } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.documentRequirement.findMany({
        where,
        include: { _count: { select: { applicantRequirements: true } } },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.documentRequirement.count({ where }),
    ]);

    return { data, total };
  }

  async listActive(organizationId: string) {
    return this.prisma.documentRequirement.findMany({
      where: { organizationId, isActive: true, deletedAt: null },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async create(data: CreateRequirementData) {
    return this.prisma.documentRequirement.create({
      data: {
        organizationId: data.organizationId,
        name: data.name,
        category: data.category,
        isRequired: data.isRequired,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
        createdBy: data.createdBy,
        ...(data.description !== undefined ? { description: data.description } : {}),
      },
    });
  }

  async update(id: string, data: UpdateRequirementData) {
    return this.prisma.documentRequirement.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.category !== undefined ? { category: data.category } : {}),
        ...(data.isRequired !== undefined ? { isRequired: data.isRequired } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
        ...(data.deletedAt !== undefined ? { deletedAt: data.deletedAt } : {}),
        ...(data.deletedBy !== undefined ? { deletedBy: data.deletedBy } : {}),
        ...(data.updatedBy !== undefined ? { updatedBy: data.updatedBy } : {}),
      },
      include: { _count: { select: { applicantRequirements: true } } },
    });
  }

  async countAssignedApplicants(requirementId: string): Promise<number> {
    return this.prisma.applicantDocumentRequirement.count({ where: { requirementId } });
  }

  /**
   * Per-applicant document requirement rollup for the dashboard completion
   * widget. Groups every non-deleted applicant's requirements by (applicant,
   * status) in one query, plus an organization-wide status count in a second —
   * so the service can derive fully-complete / incomplete / averages without
   * loading individual requirement rows (no N+1).
   */
  async getCompletionAggregate(organizationId: string): Promise<{
    perApplicant: { applicantId: string; status: string; count: number }[];
    statusTotals: { status: string; count: number }[];
  }> {
    const applicantScope: Prisma.ApplicantDocumentRequirementWhereInput = {
      applicant: { organizationId, deletedAt: null },
      requirement: { organizationId, deletedAt: null },
    };

    const [perApplicantGroups, statusGroups] = await this.prisma.$transaction([
      this.prisma.applicantDocumentRequirement.groupBy({
        by: ['applicantId', 'status'],
        where: applicantScope,
        _count: { status: true },
        orderBy: { applicantId: 'asc' },
      }),
      this.prisma.applicantDocumentRequirement.groupBy({
        by: ['status'],
        where: applicantScope,
        _count: { status: true },
        orderBy: { status: 'asc' },
      }),
    ]);

    // The array-form $transaction widens groupBy's `_count` to a union; the
    // runtime shape is exactly `{ _count: { status: number } }`, so narrow it.
    const perApplicant = (
      perApplicantGroups as unknown as {
        applicantId: string;
        status: string;
        _count: { status: number };
      }[]
    ).map((g) => ({ applicantId: g.applicantId, status: g.status, count: g._count.status }));

    const statusTotals = (
      statusGroups as unknown as { status: string; _count: { status: number } }[]
    ).map((g) => ({ status: g.status, count: g._count.status }));

    return { perApplicant, statusTotals };
  }

  // ── Applicant requirements ────────────────────────────────────────────────

  async findApplicantRequirement(id: string) {
    return this.prisma.applicantDocumentRequirement.findUnique({
      where: { id },
      include: {
        requirement: true,
        documents: {
          where: { deletedAt: null },
          include: { uploadedByStaff: { select: { id: true, firstName: true, lastName: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async listApplicantRequirements(applicantId: string, organizationId: string) {
    return this.prisma.applicantDocumentRequirement.findMany({
      where: {
        applicantId,
        requirement: { organizationId, deletedAt: null },
      },
      include: {
        requirement: true,
        documents: {
          where: { deletedAt: null },
          include: { uploadedByStaff: { select: { id: true, firstName: true, lastName: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { requirement: { sortOrder: 'asc' } },
    });
  }

  async assignRequirementsInTransaction(
    tx: Prisma.TransactionClient,
    applicantId: string,
    requirementIds: string[],
  ) {
    if (requirementIds.length === 0) return;
    await tx.applicantDocumentRequirement.createMany({
      data: requirementIds.map((requirementId) => ({ applicantId, requirementId })),
      skipDuplicates: true,
    });
  }

  async syncApplicantRequirements(applicantId: string, organizationId: string) {
    const active = await this.listActive(organizationId);
    if (active.length === 0) return;

    await this.prisma.applicantDocumentRequirement.createMany({
      data: active.map((r) => ({ applicantId, requirementId: r.id })),
      skipDuplicates: true,
    });
  }

  async updateApplicantRequirementStatus(id: string, status: RequirementStatus) {
    return this.prisma.applicantDocumentRequirement.update({
      where: { id },
      data: {
        status,
        ...(status === 'approved' ? { completedAt: new Date() } : {}),
        ...(status === 'pending' ? { completedAt: null } : {}),
      },
      include: { requirement: true },
    });
  }
}
