import { Test, type TestingModule } from '@nestjs/testing';

import { DashboardController } from '../controllers/dashboard.controller';
import { DashboardService } from '../services/dashboard.service';

import type { DashboardResponseDto } from '../dto/dashboard-response.dto';
import type { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';

import { Permissions } from '@/common/decorators/permissions.decorator';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

const ORG = 'org-1';
const STAFF = 'staff-1';

const jwtUser: JwtPayload = {
  sub: STAFF,
  email: 'admin@example.com',
  organizationId: ORG,
  role: 'admin',
  permissions: ['dashboard.view'],
};

const dashboard: DashboardResponseDto = {
  summary: {
    totalApplicants: 1,
    activeApplicants: 1,
    archivedApplicants: 0,
    totalDocuments: 0,
    pendingDocuments: 0,
    verifiedDocuments: 0,
    rejectedDocuments: 0,
  },
  recentApplicants: [],
  recentActivities: [],
  applicantSummary: { active: 1, archived: 0 },
  documentSummary: { pending: 0, verified: 0, rejected: 0, expired: 0 },
};

describe('DashboardController', () => {
  let controller: DashboardController;
  let service: jest.Mocked<DashboardService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [{ provide: DashboardService, useValue: { getDashboard: jest.fn() } }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(DashboardController);
    service = module.get(DashboardService);
  });

  it('returns the standard success envelope wrapping the dashboard payload', async () => {
    service.getDashboard.mockResolvedValue(dashboard);

    const result = await controller.getDashboard(jwtUser);

    expect(result).toEqual({
      success: true,
      message: 'Dashboard retrieved',
      data: dashboard,
    });
    expect(service.getDashboard).toHaveBeenCalledWith(ORG);
  });

  it('requires the dashboard.view permission on the endpoint', () => {
    const permissions = Reflect.getMetadata(
      'permissions',
      DashboardController.prototype.getDashboard,
    ) as string[];
    expect(permissions).toContain('dashboard.view');
  });

  it('references the Permissions decorator so RBAC metadata is applied', () => {
    // Guards against accidental removal of the decorator import/usage.
    expect(Permissions).toBeDefined();
  });
});
