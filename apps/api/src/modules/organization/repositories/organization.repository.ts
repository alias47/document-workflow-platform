import { Injectable } from '@nestjs/common';

import type { PrismaService } from '@/prisma/prisma.service';
import type { Organization } from '@prisma/client';

export interface UpdateOrganizationData {
  name?: string;
  legalName?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  country?: string;
  timezone?: string;
}

@Injectable()
export class OrganizationRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<Organization | null> {
    return this.prisma.organization.findFirst({ where: { id, deletedAt: null } });
  }

  update(id: string, data: UpdateOrganizationData): Promise<Organization> {
    return this.prisma.organization.update({ where: { id }, data });
  }
}
