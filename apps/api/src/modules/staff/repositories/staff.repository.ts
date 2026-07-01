import { Injectable } from '@nestjs/common';

import type { Staff } from '@prisma/client';

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
}

@Injectable()
export class StaffRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<Staff | null> {
    return this.prisma.staff.findFirst({ where: { id, deletedAt: null } });
  }

  findByEmail(organizationId: string, email: string): Promise<Staff | null> {
    return this.prisma.staff.findFirst({ where: { organizationId, email, deletedAt: null } });
  }

  findByOrganization(
    organizationId: string,
    opts: { page: number; pageSize: number },
  ): Promise<[Staff[], number]> {
    const { page, pageSize } = opts;
    return Promise.all([
      this.prisma.staff.findMany({
        where: { organizationId, deletedAt: null },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.staff.count({ where: { organizationId, deletedAt: null } }),
    ]);
  }

  create(data: CreateStaffData): Promise<Staff> {
    return this.prisma.staff.create({ data });
  }

  update(id: string, data: UpdateStaffData): Promise<Staff> {
    return this.prisma.staff.update({ where: { id }, data });
  }

  softDelete(id: string): Promise<Staff> {
    return this.prisma.staff.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'inactive' },
    });
  }
}
