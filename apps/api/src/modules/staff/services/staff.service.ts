import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { StaffRepository } from '../repositories/staff.repository';

import type { CreateStaffDto } from '../dto/create-staff.dto';
import type { UpdateStaffDto } from '../dto/update-staff.dto';
import type { Staff } from '@prisma/client';

import { PasswordService } from '@/providers/password/password.service';

const DEFAULT_TEMP_PASSWORD = 'ChangeMe@123456!';

@Injectable()
export class StaffService {
  constructor(
    private readonly staffRepo: StaffRepository,
    private readonly passwordService: PasswordService,
  ) {}

  async getMe(staffId: string): Promise<Staff> {
    const staff = await this.staffRepo.findById(staffId);
    if (!staff) throw new NotFoundException('Staff not found');
    return staff;
  }

  async getById(staffId: string, organizationId: string): Promise<Staff> {
    const staff = await this.staffRepo.findById(staffId);
    if (!staff || staff.organizationId !== organizationId) {
      throw new NotFoundException('Staff not found');
    }
    return staff;
  }

  async list(
    organizationId: string,
    page: number,
    pageSize: number,
  ): Promise<{ data: Staff[]; total: number; page: number; pageSize: number }> {
    const capped = Math.min(pageSize, 100);
    const [data, total] = await this.staffRepo.findByOrganization(organizationId, {
      page,
      pageSize: capped,
    });
    return { data, total, page, pageSize: capped };
  }

  async create(dto: CreateStaffDto, organizationId: string): Promise<Staff> {
    const existing = await this.staffRepo.findByEmail(organizationId, dto.email);
    if (existing) throw new ConflictException('A staff member with this email already exists');

    const passwordHash = await this.passwordService.hash(DEFAULT_TEMP_PASSWORD);

    return this.staffRepo.create({
      organizationId,
      roleId: dto.roleId,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
      ...(dto.jobTitle !== undefined ? { jobTitle: dto.jobTitle } : {}),
      passwordHash,
      mustChangePass: true,
    });
  }

  async update(staffId: string, organizationId: string, dto: UpdateStaffDto): Promise<Staff> {
    const staff = await this.staffRepo.findById(staffId);
    if (!staff || staff.organizationId !== organizationId) {
      throw new NotFoundException('Staff not found');
    }
    return this.staffRepo.update(staffId, dto);
  }

  async delete(staffId: string, organizationId: string): Promise<void> {
    const staff = await this.staffRepo.findById(staffId);
    if (!staff || staff.organizationId !== organizationId) {
      throw new NotFoundException('Staff not found');
    }
    await this.staffRepo.softDelete(staffId);
  }
}
