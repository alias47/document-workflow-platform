import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';

export interface CreateApplicantData {
  organizationId: string;
  applicantNumber: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender?: string;
  dateOfBirth?: Date;
  nationality?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  createdBy: string;
}

export interface UpdateApplicantData {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  gender?: string;
  dateOfBirth?: Date;
  nationality?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  updatedBy?: string;
}

export interface ApplicantListOptions {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
  assignedTo?: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const ASSIGNMENT_INCLUDE = {
  assignments: {
    include: {
      staff: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { isPrimary: 'desc' as const },
  },
} satisfies Prisma.ApplicantInclude;

@Injectable()
export class ApplicantRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string, organizationId: string) {
    return this.prisma.applicant.findFirst({
      where: { id, organizationId, deletedAt: null },
      include: ASSIGNMENT_INCLUDE,
    });
  }

  async findByEmail(organizationId: string, email: string) {
    return this.prisma.applicant.findFirst({
      where: { organizationId, email, deletedAt: null },
    });
  }

  async findByNumber(applicantNumber: string) {
    return this.prisma.applicant.findUnique({ where: { applicantNumber } });
  }

  async countByOrganization(organizationId: string): Promise<number> {
    return this.prisma.applicant.count({ where: { organizationId } });
  }

  async countAll(): Promise<number> {
    return this.prisma.applicant.count();
  }

  /**
   * Count of non-deleted applicants grouped by lifecycle status. Returns one row
   * per status present; callers total or pick specific statuses. Single groupBy
   * query — no N+1.
   */
  async countByStatus(organizationId: string): Promise<{ status: string; count: number }[]> {
    const groups = await this.prisma.applicant.groupBy({
      by: ['status'],
      where: { organizationId, deletedAt: null },
      _count: { status: true },
    });
    return groups.map((g) => ({ status: g.status, count: g._count.status }));
  }

  async list(organizationId: string, opts: ApplicantListOptions) {
    const { page, pageSize, search, status, assignedTo, sortBy, sortOrder } = opts;

    const baseWhere: Prisma.ApplicantWhereInput = {
      organizationId,
      deletedAt: null,
      ...(status ? { status: status as 'active' | 'inactive' | 'archived' } : {}),
    };

    if (search) {
      baseWhere.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { applicantNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (assignedTo) {
      baseWhere.assignments = { some: { staffId: assignedTo } };
    }

    const [data, total] = await Promise.all([
      this.prisma.applicant.findMany({
        where: baseWhere,
        include: ASSIGNMENT_INCLUDE,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.applicant.count({ where: baseWhere }),
    ]);

    return { data, total };
  }

  async create(data: CreateApplicantData) {
    return this.prisma.applicant.create({
      data: {
        organizationId: data.organizationId,
        applicantNumber: data.applicantNumber,
        firstName: data.firstName,
        lastName: data.lastName,
        createdBy: data.createdBy,
        ...(data.middleName !== undefined ? { middleName: data.middleName } : {}),
        ...(data.gender !== undefined ? { gender: data.gender } : {}),
        ...(data.dateOfBirth !== undefined ? { dateOfBirth: data.dateOfBirth } : {}),
        ...(data.nationality !== undefined ? { nationality: data.nationality } : {}),
        ...(data.email !== undefined ? { email: data.email } : {}),
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
        ...(data.address !== undefined ? { address: data.address } : {}),
        ...(data.city !== undefined ? { city: data.city } : {}),
        ...(data.country !== undefined ? { country: data.country } : {}),
      },
    });
  }

  async createAssignment(data: {
    organizationId: string;
    applicantId: string;
    staffId: string;
    assignedBy: string;
    isPrimary: boolean;
  }) {
    return this.prisma.applicantAssignment.create({ data });
  }

  async update(id: string, data: UpdateApplicantData) {
    return this.prisma.applicant.update({
      where: { id },
      data: {
        ...(data.firstName !== undefined ? { firstName: data.firstName } : {}),
        ...(data.middleName !== undefined ? { middleName: data.middleName } : {}),
        ...(data.lastName !== undefined ? { lastName: data.lastName } : {}),
        ...(data.gender !== undefined ? { gender: data.gender } : {}),
        ...(data.dateOfBirth !== undefined ? { dateOfBirth: data.dateOfBirth } : {}),
        ...(data.nationality !== undefined ? { nationality: data.nationality } : {}),
        ...(data.email !== undefined ? { email: data.email } : {}),
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
        ...(data.address !== undefined ? { address: data.address } : {}),
        ...(data.city !== undefined ? { city: data.city } : {}),
        ...(data.country !== undefined ? { country: data.country } : {}),
        ...(data.updatedBy !== undefined ? { updatedBy: data.updatedBy } : {}),
      },
      include: ASSIGNMENT_INCLUDE,
    });
  }

  async softDelete(id: string, deletedBy: string) {
    return this.prisma.applicant.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy, status: 'archived' },
    });
  }
}
