import { Injectable } from '@nestjs/common';

import type { Organization, Prisma } from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';

export type SettingsUpdateData = Prisma.OrganizationUpdateInput;

@Injectable()
export class SystemSettingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<Organization | null> {
    return this.prisma.organization.findFirst({ where: { id, deletedAt: null } });
  }

  update(id: string, data: SettingsUpdateData): Promise<Organization> {
    return this.prisma.organization.update({ where: { id }, data });
  }
}
