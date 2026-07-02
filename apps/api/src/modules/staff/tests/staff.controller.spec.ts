import { Test, type TestingModule } from '@nestjs/testing';

import { StaffController } from '../controllers/staff.controller';
import { StaffService } from '../services/staff.service';

import type { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';

const ORG_ID = 'org-uuid-001';
const STAFF_ID = 'staff-uuid-001';
const ACTOR_ID = 'actor-uuid-001';

const mockUser: JwtPayload = {
  sub: ACTOR_ID,
  email: 'actor@example.com',
  organizationId: ORG_ID,
  role: 'Super Admin',
  permissions: ['staff.view', 'staff.create', 'staff.update', 'staff.delete'],
};

const mockStaffResponse = {
  id: STAFF_ID,
  organizationId: ORG_ID,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: null,
  jobTitle: null,
  avatarUrl: null,
  status: 'active',
  isActive: true,
  role: { id: 'role-1', name: 'Consultant', description: null },
  assignedApplicantCount: 0,
  lastLoginAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('StaffController', () => {
  let controller: StaffController;
  let service: jest.Mocked<StaffService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StaffController],
      providers: [
        {
          provide: StaffService,
          useValue: {
            getMe: jest.fn(),
            getById: jest.fn(),
            list: jest.fn(),
            listRoles: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            updateStatus: jest.fn(),
            delete: jest.fn(),
            getApplicants: jest.fn(),
            assignApplicants: jest.fn(),
          } satisfies Partial<Record<keyof StaffService, jest.Mock>>,
        },
      ],
    }).compile();

    controller = module.get(StaffController);
    service = module.get(StaffService) as jest.Mocked<StaffService>;
  });

  describe('getMe', () => {
    it('returns current user profile', async () => {
      (service.getMe as jest.Mock).mockResolvedValue(mockStaffResponse);
      const result = await controller.getMe(mockUser);
      expect(result.success).toBe(true);
      expect((result.data as typeof mockStaffResponse).id).toBe(STAFF_ID);
    });
  });

  describe('list', () => {
    it('returns paginated staff list with meta', async () => {
      (service.list as jest.Mock).mockResolvedValue({
        data: [mockStaffResponse],
        total: 1,
        page: 1,
        pageSize: 25,
      });
      const result = await controller.list(mockUser, { page: 1, pageSize: 25 });
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.meta?.totalItems).toBe(1);
    });
  });

  describe('create', () => {
    it('returns created staff', async () => {
      (service.create as jest.Mock).mockResolvedValue(mockStaffResponse);
      const dto = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        roleId: 'role-1',
      };
      const result = await controller.create(mockUser, dto);
      expect(result.success).toBe(true);
      expect(service.create).toHaveBeenCalledWith(dto, ORG_ID, ACTOR_ID);
    });
  });

  describe('delete', () => {
    it('calls service delete and returns success', async () => {
      service.delete.mockResolvedValue(undefined);
      const result = await controller.delete(mockUser, STAFF_ID);
      expect(result.success).toBe(true);
      expect(service.delete).toHaveBeenCalledWith(STAFF_ID, ORG_ID, ACTOR_ID);
    });
  });

  describe('assignApplicants', () => {
    it('calls service assignApplicants and returns success', async () => {
      service.assignApplicants.mockResolvedValue(undefined);
      const dto = { applicantIds: ['a1', 'a2'] };
      const result = await controller.assignApplicants(mockUser, STAFF_ID, dto);
      expect(result.success).toBe(true);
      expect(service.assignApplicants).toHaveBeenCalledWith(STAFF_ID, ORG_ID, dto, ACTOR_ID);
    });
  });
});
