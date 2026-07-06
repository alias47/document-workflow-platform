import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { StaffRepository } from '../repositories/staff.repository';
import { StaffService } from '../services/staff.service';

import type { AssignApplicantsDto } from '../dto/assign-applicants.dto';
import type { CreateStaffDto } from '../dto/create-staff.dto';
import type { UpdateStaffStatusDto } from '../dto/update-staff-status.dto';

import { AuditService } from '@/modules/audit/services/audit.service';
import { NotificationService } from '@/modules/notification/services/notification.service';
import { PasswordService } from '@/providers/password/password.service';

const ORG_ID = 'org-uuid-001';
const STAFF_ID = 'staff-uuid-001';
const ACTOR_ID = 'actor-uuid-001';
const ROLE_ID = 'role-uuid-001';
const SUPER_ADMIN_ROLE_ID = 'super-admin-role-id';

const mockRole = { id: ROLE_ID, name: 'Consultant', description: null };
const superAdminRole = { id: SUPER_ADMIN_ROLE_ID, name: 'Super Admin', description: null };

const mockStaff = {
  id: STAFF_ID,
  organizationId: ORG_ID,
  roleId: ROLE_ID,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: null,
  jobTitle: 'Consultant',
  profileImage: null,
  status: 'active' as const,
  passwordHash: '$argon2id$hashed',
  lastLoginAt: null,
  failedAttempts: 0,
  lockedUntil: null,
  mustChangePass: true,
  passwordChangedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  role: mockRole,
  _count: { assignments: 3 },
};

describe('StaffService', () => {
  let service: StaffService;
  let staffRepo: jest.Mocked<StaffRepository>;
  let passwordService: jest.Mocked<PasswordService>;
  let auditService: jest.Mocked<AuditService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaffService,
        {
          provide: StaffRepository,
          useValue: {
            findById: jest.fn(),
            findByIdWithCounts: jest.fn(),
            findByEmail: jest.fn(),
            list: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
            countActiveSuperAdmins: jest.fn(),
            findSuperAdminRole: jest.fn(),
            listRoles: jest.fn(),
            listAssignedApplicants: jest.fn(),
            replaceAssignments: jest.fn(),
            countByOrganization: jest.fn(),
            getWorkload: jest.fn(),
          } satisfies Partial<Record<keyof StaffRepository, jest.Mock>>,
        },
        {
          provide: PasswordService,
          useValue: { hash: jest.fn().mockResolvedValue('$argon2id$hashed') },
        },
        {
          provide: AuditService,
          useValue: { log: jest.fn().mockResolvedValue(undefined) },
        },
        {
          provide: NotificationService,
          useValue: { notify: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    service = module.get(StaffService);
    staffRepo = module.get(StaffRepository) as jest.Mocked<StaffRepository>;
    passwordService = module.get(PasswordService) as jest.Mocked<PasswordService>;
    auditService = module.get(AuditService) as jest.Mocked<AuditService>;
  });

  describe('getMe', () => {
    it('returns staff with counts when found', async () => {
      staffRepo.findByIdWithCounts.mockResolvedValue(mockStaff);
      const result = await service.getMe(STAFF_ID);
      expect(result.id).toBe(STAFF_ID);
      expect(result.assignedApplicantCount).toBe(3);
      expect(result.isActive).toBe(true);
    });

    it('throws NotFoundException when staff not found', async () => {
      staffRepo.findByIdWithCounts.mockResolvedValue(null);
      await expect(service.getMe(STAFF_ID)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getById', () => {
    it('returns staff belonging to organization', async () => {
      staffRepo.findByIdWithCounts.mockResolvedValue(mockStaff);
      const result = await service.getById(STAFF_ID, ORG_ID);
      expect((result as { id: string }).id).toBe(STAFF_ID);
    });

    it('throws NotFoundException when staff belongs to different org', async () => {
      staffRepo.findByIdWithCounts.mockResolvedValue({
        ...mockStaff,
        organizationId: 'other-org',
      });
      await expect(service.getById(STAFF_ID, ORG_ID)).rejects.toThrow(NotFoundException);
    });
  });

  describe('list', () => {
    it('returns paginated staff list', async () => {
      staffRepo.list.mockResolvedValue([[mockStaff], 1]);
      const result = await service.list(ORG_ID, { page: 1, pageSize: 25 });
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('caps pageSize at 100', async () => {
      staffRepo.list.mockResolvedValue([[], 0]);
      await service.list(ORG_ID, { page: 1, pageSize: 500 });
      expect(staffRepo.list).toHaveBeenCalledWith(
        ORG_ID,
        expect.objectContaining({ pageSize: 100 }),
      );
    });
  });

  describe('create', () => {
    const dto: CreateStaffDto = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      roleId: ROLE_ID,
    };

    it('creates staff with hashed temp password when no password given', async () => {
      staffRepo.findByEmail.mockResolvedValue(null);
      staffRepo.create.mockResolvedValue({ ...mockStaff, email: dto.email });
      await service.create(dto, ORG_ID, ACTOR_ID);
      expect(passwordService.hash).toHaveBeenCalledWith('ChangeMe@123456!');
      expect(auditService.log).toHaveBeenCalled();
    });

    it('uses provided password when given', async () => {
      staffRepo.findByEmail.mockResolvedValue(null);
      staffRepo.create.mockResolvedValue(mockStaff);
      await service.create({ ...dto, password: 'Custom@Pass1!' }, ORG_ID, ACTOR_ID);
      expect(passwordService.hash).toHaveBeenCalledWith('Custom@Pass1!');
    });

    it('throws ConflictException when email already in use', async () => {
      staffRepo.findByEmail.mockResolvedValue(mockStaff);
      await expect(service.create(dto, ORG_ID, ACTOR_ID)).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('updates staff and returns updated record', async () => {
      const updated = { ...mockStaff, jobTitle: 'Senior Consultant' };
      staffRepo.findById.mockResolvedValue(mockStaff);
      staffRepo.update.mockResolvedValue(updated);
      const result = await service.update(
        STAFF_ID,
        ORG_ID,
        { jobTitle: 'Senior Consultant' },
        ACTOR_ID,
      );
      expect((result as { jobTitle: string | null }).jobTitle).toBe('Senior Consultant');
      expect(auditService.log).toHaveBeenCalled();
    });

    it('throws NotFoundException when staff not found', async () => {
      staffRepo.findById.mockResolvedValue(null);
      await expect(service.update(STAFF_ID, ORG_ID, {}, ACTOR_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateStatus', () => {
    it('throws ForbiddenException when deactivating yourself', async () => {
      const dto: UpdateStaffStatusDto = { status: 'inactive' };
      await expect(service.updateStatus(ACTOR_ID, ORG_ID, dto, ACTOR_ID)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('throws ForbiddenException when deactivating last Super Admin', async () => {
      const superAdminStaff = { ...mockStaff, roleId: SUPER_ADMIN_ROLE_ID };
      staffRepo.findById.mockResolvedValue(superAdminStaff);
      staffRepo.findSuperAdminRole.mockResolvedValue(superAdminRole);
      staffRepo.countActiveSuperAdmins.mockResolvedValue(1);
      const dto: UpdateStaffStatusDto = { status: 'inactive' };
      await expect(service.updateStatus(STAFF_ID, ORG_ID, dto, ACTOR_ID)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('activates staff successfully', async () => {
      staffRepo.findById.mockResolvedValue({ ...mockStaff, status: 'inactive' });
      staffRepo.findSuperAdminRole.mockResolvedValue(null);
      staffRepo.update.mockResolvedValue({ ...mockStaff, status: 'active' });
      const dto: UpdateStaffStatusDto = { status: 'active' };
      const result = await service.updateStatus(STAFF_ID, ORG_ID, dto, ACTOR_ID);
      expect(result.status).toBe('active');
    });
  });

  describe('delete', () => {
    it('soft-deletes staff and logs activity', async () => {
      staffRepo.findById.mockResolvedValue(mockStaff);
      staffRepo.findSuperAdminRole.mockResolvedValue(null);
      staffRepo.softDelete.mockResolvedValue({ ...mockStaff, deletedAt: new Date() });
      await service.delete(STAFF_ID, ORG_ID, ACTOR_ID);
      expect(staffRepo.softDelete).toHaveBeenCalledWith(STAFF_ID);
      expect(auditService.log).toHaveBeenCalled();
    });

    it('throws ForbiddenException when deleting yourself', async () => {
      await expect(service.delete(ACTOR_ID, ORG_ID, ACTOR_ID)).rejects.toThrow(ForbiddenException);
    });

    it('throws ForbiddenException when deleting last Super Admin', async () => {
      const superAdminStaff = { ...mockStaff, roleId: SUPER_ADMIN_ROLE_ID };
      staffRepo.findById.mockResolvedValue(superAdminStaff);
      staffRepo.findSuperAdminRole.mockResolvedValue(superAdminRole);
      staffRepo.countActiveSuperAdmins.mockResolvedValue(1);
      await expect(service.delete(STAFF_ID, ORG_ID, ACTOR_ID)).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFoundException when staff not found', async () => {
      staffRepo.findById.mockResolvedValue(null);
      await expect(service.delete(STAFF_ID, ORG_ID, ACTOR_ID)).rejects.toThrow(NotFoundException);
    });
  });

  describe('assignApplicants', () => {
    it('replaces assignments atomically', async () => {
      staffRepo.findById.mockResolvedValue(mockStaff);
      staffRepo.replaceAssignments.mockResolvedValue(undefined);
      const dto: AssignApplicantsDto = { applicantIds: ['a1', 'a2'] };
      await service.assignApplicants(STAFF_ID, ORG_ID, dto, ACTOR_ID);
      expect(staffRepo.replaceAssignments).toHaveBeenCalledWith(
        STAFF_ID,
        ORG_ID,
        ['a1', 'a2'],
        ACTOR_ID,
      );
      expect(auditService.log).toHaveBeenCalled();
    });

    it('throws BadRequestException when staff is inactive', async () => {
      staffRepo.findById.mockResolvedValue({ ...mockStaff, status: 'inactive' });
      const dto: AssignApplicantsDto = { applicantIds: ['a1'] };
      await expect(service.assignApplicants(STAFF_ID, ORG_ID, dto, ACTOR_ID)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('countStaff', () => {
    it('delegates to the repository with the organization id', async () => {
      staffRepo.countByOrganization.mockResolvedValue(9);

      const result = await service.countStaff(ORG_ID);

      expect(result).toBe(9);
      expect(staffRepo.countByOrganization).toHaveBeenCalledWith(ORG_ID);
    });
  });

  describe('getWorkload', () => {
    it('computes workload % as a share of the busiest member', async () => {
      staffRepo.getWorkload.mockResolvedValue([
        {
          staffId: 's1',
          firstName: 'Ada',
          lastName: 'Lovelace',
          role: 'Admin',
          assignedApplicants: 8,
        },
        {
          staffId: 's2',
          firstName: 'Bob',
          lastName: 'Jones',
          role: 'Consultant',
          assignedApplicants: 4,
        },
        {
          staffId: 's3',
          firstName: 'Cy',
          lastName: 'Young',
          role: 'Consultant',
          assignedApplicants: 0,
        },
      ]);

      const result = await service.getWorkload(ORG_ID);

      expect(result).toEqual([
        {
          staffId: 's1',
          name: 'Ada Lovelace',
          role: 'Admin',
          assignedApplicants: 8,
          workloadPercent: 100,
        },
        {
          staffId: 's2',
          name: 'Bob Jones',
          role: 'Consultant',
          assignedApplicants: 4,
          workloadPercent: 50,
        },
        {
          staffId: 's3',
          name: 'Cy Young',
          role: 'Consultant',
          assignedApplicants: 0,
          workloadPercent: 0,
        },
      ]);
    });

    it('reports 0% workload for everyone when no applicants are assigned', async () => {
      staffRepo.getWorkload.mockResolvedValue([
        {
          staffId: 's1',
          firstName: 'Ada',
          lastName: 'Lovelace',
          role: 'Admin',
          assignedApplicants: 0,
        },
      ]);

      const result = await service.getWorkload(ORG_ID);

      expect(result[0]?.workloadPercent).toBe(0);
    });

    it('returns an empty list when there is no staff', async () => {
      staffRepo.getWorkload.mockResolvedValue([]);

      const result = await service.getWorkload(ORG_ID);

      expect(result).toEqual([]);
    });
  });
});
