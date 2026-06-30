import { Injectable, NotFoundException } from '@nestjs/common';

import { OrganizationRepository } from '../repositories/organization.repository';

import type { UpdateOrganizationDto } from '../dto/update-organization.dto';
import type { Organization } from '@prisma/client';

@Injectable()
export class OrganizationService {
  constructor(private readonly orgRepo: OrganizationRepository) {}

  async getById(id: string): Promise<Organization> {
    const org = await this.orgRepo.findById(id);
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  async update(id: string, dto: UpdateOrganizationDto): Promise<Organization> {
    const org = await this.orgRepo.findById(id);
    if (!org) throw new NotFoundException('Organization not found');
    return this.orgRepo.update(id, dto);
  }
}
