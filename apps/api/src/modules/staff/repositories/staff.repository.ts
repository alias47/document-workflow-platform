import { Injectable } from '@nestjs/common';
import { Prisma, StaffStatus } from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';

export interface CreateStaffData {
  organizationId: string;
  roleId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  passwordHash: string;
  mustChangePass: boolean;
}

export interface UpdateStaffData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  jobTitle?: string;
  roleId?: string;
  profileImage?: string | null;
  status?: StaffStatus;
  passwordHash?: string;
  mustChangePass?: boolean;
}

export interface StaffListOptions {
  page: number;
  pageSize: number;
  search?: string | undefined;
  status?: StaffStatus | undefined;
  roleId?: string | undefined;
  sortBy: 'firstName' | 'lastName' | 'createdAt' | 'lastLoginAt';
  sortOrder: 'asc' | 'desc';
}

const ROLE_SELECT = {
  role: { select: { id: true, name: true, description: true } },
} as const;

const ASSIGNMENT_COUNT_SELECT = {
  _count: { select: { assignments: true } },
} as const;

@Injectable()
export class StaffRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.staff.findFirst({
      where: { id, deletedAt: null },
      include: { ...ROLE_SELECT },
    });
  }

  findByIdWithCounts(id: string) {
    return this.prisma.staff.findFirst({
      where: { id, deletedAt: null },
      include: { ...ROLE_SELECT, ...ASSIGNMENT_COUNT_SELECT },
    });
  }

  findByEmail(organizationId: string, email: string) {
    return this.prisma.staff.findFirst({ where: { organizationId, email, deletedAt: null } });
  }

  async list(organizationId: string, opts: StaffListOptions): Promise<[unknown[], number]> {
    const { page, pageSize, search, status, roleId, sortBy, sortOrder } = opts;

    const where: Prisma.StaffWhereInput = {
      organizationId,
      deletedAt: null,
      ...(status ? { status } : {}),
      ...(roleId ? { roleId } : {}),
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.StaffOrderByWithRelationInput =
      sortBy === 'firstName' || sortBy === 'lastName'
        ? { [sortBy]: sortOrder }
        : sortBy === 'lastLoginAt'
          ? { lastLoginAt: sortOrder }
          : { createdAt: sortOrder };

    const [data, total] = await Promise.all([
      this.prisma.staff.findMany({
        where,
        include: { ...ROLE_SELECT, ...ASSIGNMENT_COUNT_SELECT },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.staff.count({ where }),
    ]);

    return [data, total];
  }

  create(data: CreateStaffData) {
    return this.prisma.staff.create({
      data,
      include: ROLE_SELECT,
    });
  }

  update(id: string, data: UpdateStaffData) {
    return this.prisma.staff.update({
      where: { id },
      data,
      include: ROLE_SELECT,
    });
  }

  softDelete(id: string) {
    return this.prisma.staff.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'inactive' },
      include: ROLE_SELECT,
    });
  }

  /** Total non-deleted staff in the organization. */
  countByOrganization(organizationId: string): Promise<number> {
    return this.prisma.staff.count({ where: { organizationId, deletedAt: null } });
  }

  /**
   * Per-staff assigned-applicant counts for the dashboard workload widget. Only
   * non-deleted staff and non-deleted assigned applicants are counted. One query
   * with a filtered relation `_count` — no N+1.
   */
  async getWorkload(organizationId: string) {
    const staff = await this.prisma.staff.findMany({
      where: { organizationId, deletedAt: null },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: { select: { id: true, name: true } },
        _count: {
          select: {
            assignments: {
              where: { applicant: { deletedAt: null, organizationId } },
            },
          },
        },
      },
      orderBy: { firstName: 'asc' },
    });

    return staff.map((s) => ({
      staffId: s.id,
      firstName: s.firstName,
      lastName: s.lastName,
      role: s.role.name,
      assignedApplicants: s._count.assignments,
    }));
  }

  /** Count active staff with Super Admin role within the organization. */
  countActiveSuperAdmins(organizationId: string, superAdminRoleId: string): Promise<number> {
    return this.prisma.staff.count({
      where: {
        organizationId,
        roleId: superAdminRoleId,
        status: 'active',
        deletedAt: null,
      },
    });
  }

  /** Find the Super Admin role for an organization (by convention: name = 'Super Admin'). */
  findSuperAdminRole(organizationId: string) {
    return this.prisma.role.findFirst({
      where: { organizationId, name: 'Super Admin', deletedAt: null },
      select: { id: true, name: true },
    });
  }

  /** List all roles available in the organization. */
  listRoles(organizationId: string) {
    return this.prisma.role.findMany({
      where: { organizationId, deletedAt: null },
      select: { id: true, name: true, description: true },
      orderBy: { name: 'asc' },
    });
  }

  /** Return applicants assigned to a staff member (paginated). */
  async listAssignedApplicants(
    staffId: string,
    organizationId: string,
    page: number,
    pageSize: number,
  ) {
    const where: Prisma.ApplicantWhereInput = {
      organizationId,
      deletedAt: null,
      assignments: { some: { staffId } },
    };

    const [data, total] = await Promise.all([
      this.prisma.applicant.findMany({
        where,
        select: {
          id: true,
          applicantNumber: true,
          firstName: true,
          lastName: true,
          email: true,
          status: true,
          createdAt: true,
          assignments: {
            where: { staffId },
            select: { isPrimary: true, assignedAt: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.applicant.count({ where }),
    ]);

    return { data, total };
  }

  /**
   * Atomically replace all assignments for a staff member with the given list.
   * Existing assignments are deleted and new ones created inside a transaction.
   */
  async replaceAssignments(
    staffId: string,
    organizationId: string,
    applicantIds: string[],
    assignedBy: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      await tx.applicantAssignment.deleteMany({
        where: { staffId, organizationId },
      });

      if (applicantIds.length > 0) {
        await tx.applicantAssignment.createMany({
          data: applicantIds.map((applicantId, i) => ({
            organizationId,
            applicantId,
            staffId,
            assignedBy,
            isPrimary: i === 0,
          })),
        });
      }
    });
  }
}
