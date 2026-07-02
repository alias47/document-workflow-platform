import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { StaffRepository } from '../repositories/staff.repository';

import type { AssignApplicantsDto } from '../dto/assign-applicants.dto';
import type { CreateStaffDto } from '../dto/create-staff.dto';
import type { StaffQueryDto } from '../dto/staff-query.dto';
import type { UpdateStaffStatusDto } from '../dto/update-staff-status.dto';
import type { UpdateStaffDto } from '../dto/update-staff.dto';

import { ACTIVITY_TYPES } from '@/modules/activity/interfaces/activity-type';
import { AuditService } from '@/modules/audit/services/audit.service';
import { PasswordService } from '@/providers/password/password.service';

const DEFAULT_TEMP_PASSWORD = 'ChangeMe@123456!';
const SUPER_ADMIN_ROLE_NAME = 'Super Admin';

type StaffWithExtras = {
  status: string;
  profileImage?: string | null;
  _count?: { assignments?: number };
  [key: string]: unknown;
};

function mapToResponse<T extends StaffWithExtras>(staff: T) {
  const countObj = staff._count;
  return {
    ...staff,
    avatarUrl: staff.profileImage ?? null,
    isActive: staff.status === 'active',
    assignedApplicantCount: countObj?.assignments ?? 0,
  };
}

@Injectable()
export class StaffService {
  constructor(
    private readonly staffRepo: StaffRepository,
    private readonly passwordService: PasswordService,
    private readonly auditService: AuditService,
  ) {}

  async getMe(staffId: string) {
    const staff = await this.staffRepo.findByIdWithCounts(staffId);
    if (!staff) throw new NotFoundException('Staff not found');
    return mapToResponse(staff);
  }

  async getById(staffId: string, organizationId: string) {
    const staff = await this.staffRepo.findByIdWithCounts(staffId);
    if (!staff || staff.organizationId !== organizationId) {
      throw new NotFoundException('Staff not found');
    }
    return mapToResponse(staff);
  }

  async list(organizationId: string, query: StaffQueryDto) {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 25, 100);

    const [data, total] = await this.staffRepo.list(organizationId, {
      page,
      pageSize,
      search: query.search,
      status: query.status,
      roleId: query.roleId,
      sortBy: query.sortBy ?? 'createdAt',
      sortOrder: query.sortOrder ?? 'desc',
    });

    return {
      data: (data as StaffWithExtras[]).map(mapToResponse),
      total,
      page,
      pageSize,
    };
  }

  async listRoles(organizationId: string) {
    return this.staffRepo.listRoles(organizationId);
  }

  async create(dto: CreateStaffDto, organizationId: string, actorId: string) {
    const existing = await this.staffRepo.findByEmail(organizationId, dto.email);
    if (existing) throw new ConflictException('A staff member with this email already exists');

    const plain = dto.password ?? DEFAULT_TEMP_PASSWORD;
    const passwordHash = await this.passwordService.hash(plain);
    const status = dto.isActive === false ? 'inactive' : 'active';

    const staff = await this.staffRepo.create({
      organizationId,
      roleId: dto.roleId,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
      ...(dto.jobTitle !== undefined ? { jobTitle: dto.jobTitle } : {}),
      passwordHash,
      mustChangePass: !dto.password,
      ...(status !== 'active' ? { status: 'inactive' as const } : {}),
    });

    void this.auditService.log({
      organizationId,
      actorId,
      action: ACTIVITY_TYPES.STAFF_CREATED,
      resourceType: 'staff',
      resourceId: staff.id,
      metadata: { email: staff.email, roleId: staff.roleId },
    });

    return mapToResponse(staff);
  }

  async update(staffId: string, organizationId: string, dto: UpdateStaffDto, actorId: string) {
    const staff = await this.staffRepo.findById(staffId);
    if (!staff || staff.organizationId !== organizationId) {
      throw new NotFoundException('Staff not found');
    }

    const prevRoleId = staff.roleId;
    const updateData: Parameters<typeof this.staffRepo.update>[1] = {};

    if (dto.firstName !== undefined) updateData.firstName = dto.firstName;
    if (dto.lastName !== undefined) updateData.lastName = dto.lastName;
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.jobTitle !== undefined) updateData.jobTitle = dto.jobTitle;
    if (dto.roleId !== undefined) updateData.roleId = dto.roleId;
    if ('avatarUrl' in dto) updateData.profileImage = dto.avatarUrl ?? null;
    if (dto.isActive !== undefined) {
      updateData.status = dto.isActive ? 'active' : 'inactive';
    }
    if (dto.password !== undefined) {
      updateData.passwordHash = await this.passwordService.hash(dto.password);
      updateData.mustChangePass = false;
    }

    const updated = await this.staffRepo.update(staffId, updateData);
    const action =
      dto.roleId && dto.roleId !== prevRoleId
        ? ACTIVITY_TYPES.STAFF_ROLE_CHANGED
        : ACTIVITY_TYPES.STAFF_UPDATED;

    void this.auditService.log({
      organizationId,
      actorId,
      action,
      resourceType: 'staff',
      resourceId: staffId,
      metadata:
        dto.roleId && dto.roleId !== prevRoleId
          ? { fromRoleId: prevRoleId, toRoleId: dto.roleId }
          : {},
    });

    return mapToResponse(updated);
  }

  async updateStatus(
    staffId: string,
    organizationId: string,
    dto: UpdateStaffStatusDto,
    actorId: string,
  ) {
    if (staffId === actorId) {
      throw new ForbiddenException('You cannot change your own account status');
    }

    const staff = await this.staffRepo.findById(staffId);
    if (!staff || staff.organizationId !== organizationId) {
      throw new NotFoundException('Staff not found');
    }

    if (dto.status === 'inactive' || dto.status === 'suspended') {
      await this.guardLastSuperAdmin(staffId, organizationId);
    }

    const updated = await this.staffRepo.update(staffId, { status: dto.status });

    const action =
      dto.status === 'active' ? ACTIVITY_TYPES.STAFF_ACTIVATED : ACTIVITY_TYPES.STAFF_DEACTIVATED;

    void this.auditService.log({
      organizationId,
      actorId,
      action,
      resourceType: 'staff',
      resourceId: staffId,
      metadata: { status: dto.status },
    });

    return mapToResponse(updated);
  }

  async delete(staffId: string, organizationId: string, actorId: string) {
    if (staffId === actorId) {
      throw new ForbiddenException('You cannot delete your own account');
    }

    const staff = await this.staffRepo.findById(staffId);
    if (!staff || staff.organizationId !== organizationId) {
      throw new NotFoundException('Staff not found');
    }

    await this.guardLastSuperAdmin(staffId, organizationId);

    await this.staffRepo.softDelete(staffId);

    void this.auditService.log({
      organizationId,
      actorId,
      action: ACTIVITY_TYPES.STAFF_DELETED,
      resourceType: 'staff',
      resourceId: staffId,
      metadata: { email: staff.email },
    });
  }

  async getApplicants(staffId: string, organizationId: string, page: number, pageSize: number) {
    const staff = await this.staffRepo.findById(staffId);
    if (!staff || staff.organizationId !== organizationId) {
      throw new NotFoundException('Staff not found');
    }

    const capped = Math.min(pageSize, 100);
    return this.staffRepo.listAssignedApplicants(staffId, organizationId, page, capped);
  }

  async assignApplicants(
    staffId: string,
    organizationId: string,
    dto: AssignApplicantsDto,
    actorId: string,
  ) {
    const staff = await this.staffRepo.findById(staffId);
    if (!staff || staff.organizationId !== organizationId) {
      throw new NotFoundException('Staff not found');
    }

    if (staff.status !== 'active') {
      throw new BadRequestException('Cannot assign applicants to an inactive staff member');
    }

    await this.staffRepo.replaceAssignments(staffId, organizationId, dto.applicantIds, actorId);

    void this.auditService.log({
      organizationId,
      actorId,
      action: ACTIVITY_TYPES.STAFF_APPLICANTS_REASSIGNED,
      resourceType: 'staff',
      resourceId: staffId,
      metadata: { applicantCount: dto.applicantIds.length },
    });
  }

  /** Throws if removing/deactivating this staff member would leave no active Super Admin. */
  private async guardLastSuperAdmin(staffId: string, organizationId: string) {
    const superAdminRole = await this.staffRepo.findSuperAdminRole(organizationId);
    if (!superAdminRole) return;

    const staff = await this.staffRepo.findById(staffId);
    if (!staff || staff.roleId !== superAdminRole.id) return;

    const count = await this.staffRepo.countActiveSuperAdmins(organizationId, superAdminRole.id);
    if (count <= 1) {
      throw new ForbiddenException(
        `Cannot remove the last active ${SUPER_ADMIN_ROLE_NAME}. Assign another ${SUPER_ADMIN_ROLE_NAME} first.`,
      );
    }
  }
}
