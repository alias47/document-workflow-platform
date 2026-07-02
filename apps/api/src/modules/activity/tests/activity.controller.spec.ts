import { Test, type TestingModule } from '@nestjs/testing';

import { ActivityController } from '../controllers/activity.controller';
import { ActivityService } from '../services/activity.service';

import type { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';

import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

const ORG = 'org-1';
const APPLICANT = 'app-1';
const STAFF = 'staff-1';

const jwtUser: JwtPayload = {
  sub: STAFF,
  email: 'jane@example.com',
  organizationId: ORG,
  role: 'consultant',
  permissions: ['applicant.view'],
};

const listResult = {
  data: [{ id: 'act-1', type: 'note.created', title: 'Note added' }],
  meta: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 },
};

describe('ActivityController', () => {
  let controller: ActivityController;
  let service: jest.Mocked<ActivityService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivityController],
      providers: [{ provide: ActivityService, useValue: { listByApplicant: jest.fn() } }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(ActivityController);
    service = module.get(ActivityService);
  });

  it('returns a paginated activity envelope', async () => {
    service.listByApplicant.mockResolvedValue(listResult as never);

    const result = await controller.list(jwtUser, APPLICANT, { page: 1, pageSize: 20 });

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(result.meta.totalItems).toBe(1);
    expect(service.listByApplicant).toHaveBeenCalledWith(APPLICANT, ORG, { page: 1, pageSize: 20 });
  });
});
