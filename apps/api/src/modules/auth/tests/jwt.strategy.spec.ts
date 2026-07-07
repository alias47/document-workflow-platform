import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';

import { AuthRepository, type StaffWithOrgStatus } from '../repositories/auth.repository';
import { JwtStrategy } from '../strategies/jwt.strategy';

import type { JwtPayload } from '../interfaces/jwt-payload.interface';

const ORG_ID = 'org-uuid-1';
const STAFF_ID = 'staff-uuid-1';

const basePayload: JwtPayload = {
  sub: STAFF_ID,
  email: 'admin@test.com',
  organizationId: ORG_ID,
  role: 'Admin',
  permissions: ['staff.view'],
};

const activeStaff: StaffWithOrgStatus = {
  id: STAFF_ID,
  organizationId: ORG_ID,
  email: 'admin@test.com',
  firstName: 'Admin',
  lastName: 'User',
  phone: null,
  jobTitle: null,
  profileImage: null,
  status: 'active',
  passwordHash: 'x',
  lastLoginAt: null,
  failedAttempts: 0,
  lockedUntil: null,
  mustChangePass: false,
  passwordChangedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  roleId: 'role-1',
  role: { id: 'role-1', name: 'Admin' },
  organization: { id: ORG_ID, isActive: true, deletedAt: null },
} as StaffWithOrgStatus;

const staffWithPerms = {
  ...activeStaff,
  role: { name: 'Admin', permissions: [{ permission: { action: 'staff.view' } }] },
};

describe('JwtStrategy (Sprint 12.1 per-request re-validation)', () => {
  let strategy: JwtStrategy;
  let authRepo: jest.Mocked<AuthRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue({ secret: 'test-secret' }) },
        },
        {
          provide: AuthRepository,
          useValue: {
            findStaffForValidation: jest.fn(),
            findStaffById: jest.fn(),
          },
        },
      ],
    }).compile();

    strategy = module.get(JwtStrategy);
    authRepo = module.get(AuthRepository) as jest.Mocked<AuthRepository>;
    authRepo.findStaffForValidation.mockResolvedValue(activeStaff);
    authRepo.findStaffById.mockResolvedValue(staffWithPerms as never);
  });

  it('accepts an active staff member in an active org and rebuilds permissions from DB', async () => {
    const result = await strategy.validate(basePayload);
    expect(result.sub).toBe(STAFF_ID);
    expect(result.permissions).toEqual(['staff.view']);
  });

  it('rejects when the payload has no subject', async () => {
    await expect(strategy.validate({ ...basePayload, sub: '' })).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rejects a deleted / non-existent staff member', async () => {
    authRepo.findStaffForValidation.mockResolvedValue(null);
    await expect(strategy.validate(basePayload)).rejects.toThrow(UnauthorizedException);
  });

  it('rejects a deactivated staff member', async () => {
    authRepo.findStaffForValidation.mockResolvedValue({ ...activeStaff, status: 'inactive' });
    await expect(strategy.validate(basePayload)).rejects.toThrow(UnauthorizedException);
  });

  it('rejects when the organization is disabled', async () => {
    authRepo.findStaffForValidation.mockResolvedValue({
      ...activeStaff,
      organization: { id: ORG_ID, isActive: false, deletedAt: null },
    });
    await expect(strategy.validate(basePayload)).rejects.toThrow(UnauthorizedException);
  });

  it('rejects when the organization is soft-deleted', async () => {
    authRepo.findStaffForValidation.mockResolvedValue({
      ...activeStaff,
      organization: { id: ORG_ID, isActive: true, deletedAt: new Date() },
    });
    await expect(strategy.validate(basePayload)).rejects.toThrow(UnauthorizedException);
  });

  it('reflects a current role change rather than the stale token role', async () => {
    authRepo.findStaffForValidation.mockResolvedValue({
      ...activeStaff,
      role: { id: 'role-2', name: 'Consultant' },
    });
    const result = await strategy.validate(basePayload);
    expect(result.role).toBe('Consultant');
  });
});
