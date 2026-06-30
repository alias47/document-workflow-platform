import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { StaffRepository } from '../repositories/staff.repository';
import { StaffService } from '../services/staff.service';

import type { CreateStaffDto } from '../dto/create-staff.dto';
import type { Staff } from '@prisma/client';

import { PasswordService } from '@/providers/password/password.service';

const ORG_ID = 'org-uuid-001';
const STAFF_ID = 'staff-uuid-001';

const mockStaff: Staff = {
  id: STAFF_ID,
  organizationId: ORG_ID,
  roleId: 'role-uuid-001',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: null,
  jobTitle: 'Consultant',
  profileImage: null,
  status: 'active',
  passwordHash: '$argon2id$hashed',
  lastLoginAt: null,
  failedAttempts: 0,
  lockedUntil: null,
  mustChangePass: true,
  passwordChangedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

describe('StaffService', () => {
  let service: StaffService;
  let staffRepo: jest.Mocked<StaffRepository>;
  let passwordService: jest.Mocked<PasswordService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaffService,
        {
          provide: StaffRepository,
          useValue: {
            findById: jest.fn(),
            findByEmail: jest.fn(),
            findByOrganization: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
          } satisfies Partial<Record<keyof StaffRepository, jest.Mock>>,
        },
        {
          provide: PasswordService,
          useValue: { hash: jest.fn().mockResolvedValue('$argon2id$hashed') },
        },
      ],
    }).compile();

    service = module.get(StaffService);
    staffRepo = module.get(StaffRepository) as jest.Mocked<StaffRepository>;
    passwordService = module.get(PasswordService) as jest.Mocked<PasswordService>;
  });

  describe('getMe', () => {
    it('returns staff when found', async () => {
      staffRepo.findById.mockResolvedValue(mockStaff);

      const result = await service.getMe(STAFF_ID);

      expect(result).toEqual(mockStaff);
    });

    it('throws NotFoundException when staff not found', async () => {
      staffRepo.findById.mockResolvedValue(null);

      await expect(service.getMe(STAFF_ID)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getById', () => {
    it('returns staff belonging to organization', async () => {
      staffRepo.findById.mockResolvedValue(mockStaff);

      const result = await service.getById(STAFF_ID, ORG_ID);

      expect(result.id).toBe(STAFF_ID);
    });

    it('throws NotFoundException when staff belongs to different org', async () => {
      const otherOrgStaff = { ...mockStaff, organizationId: 'other-org' };
      staffRepo.findById.mockResolvedValue(otherOrgStaff);

      await expect(service.getById(STAFF_ID, ORG_ID)).rejects.toThrow(NotFoundException);
    });
  });

  describe('list', () => {
    it('returns paginated staff list', async () => {
      staffRepo.findByOrganization.mockResolvedValue([[mockStaff], 1]);

      const result = await service.list(ORG_ID, 1, 25);

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('caps pageSize at 100', async () => {
      staffRepo.findByOrganization.mockResolvedValue([[], 0]);

      await service.list(ORG_ID, 1, 500);

      expect(staffRepo.findByOrganization).toHaveBeenCalledWith(ORG_ID, { page: 1, pageSize: 100 });
    });
  });

  describe('create', () => {
    const dto: CreateStaffDto = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      roleId: 'role-uuid-001',
    };

    it('creates staff with hashed temp password', async () => {
      staffRepo.findByEmail.mockResolvedValue(null);
      staffRepo.create.mockResolvedValue({ ...mockStaff, email: dto.email });

      const result = await service.create(dto, ORG_ID);

      expect(passwordService.hash).toHaveBeenCalled();
      expect(staffRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId: ORG_ID,
          email: dto.email,
          mustChangePass: true,
        }),
      );
      expect(result.email).toBe(dto.email);
    });

    it('throws ConflictException when email already in use', async () => {
      staffRepo.findByEmail.mockResolvedValue(mockStaff);

      await expect(service.create(dto, ORG_ID)).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('updates staff and returns updated record', async () => {
      const updated = { ...mockStaff, jobTitle: 'Senior Consultant' };
      staffRepo.findById.mockResolvedValue(mockStaff);
      staffRepo.update.mockResolvedValue(updated);

      const result = await service.update(STAFF_ID, ORG_ID, { jobTitle: 'Senior Consultant' });

      expect(result.jobTitle).toBe('Senior Consultant');
    });

    it('throws NotFoundException when staff not found', async () => {
      staffRepo.findById.mockResolvedValue(null);

      await expect(service.update(STAFF_ID, ORG_ID, {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('soft-deletes staff', async () => {
      staffRepo.findById.mockResolvedValue(mockStaff);
      staffRepo.softDelete.mockResolvedValue({ ...mockStaff, deletedAt: new Date() });

      await service.delete(STAFF_ID, ORG_ID);

      expect(staffRepo.softDelete).toHaveBeenCalledWith(STAFF_ID);
    });

    it('throws NotFoundException when staff not found', async () => {
      staffRepo.findById.mockResolvedValue(null);

      await expect(service.delete(STAFF_ID, ORG_ID)).rejects.toThrow(NotFoundException);
    });
  });
});
