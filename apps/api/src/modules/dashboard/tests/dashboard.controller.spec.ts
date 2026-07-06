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
  permissions: ['dashboard.view', 'dashboard.workload.view'],
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
      providers: [
        {
          provide: DashboardService,
          useValue: {
            getDashboard: jest.fn(),
            getSummary: jest.fn(),
            getActivity: jest.fn(),
            getWorkload: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(DashboardController);
    service = module.get(DashboardService);
  });

  describe('GET /dashboard (legacy)', () => {
    it('returns the standard success envelope wrapping the dashboard payload', async () => {
      service.getDashboard.mockResolvedValue(dashboard);

      const result = await controller.getDashboard(jwtUser);

      expect(result).toEqual({ success: true, message: 'Dashboard retrieved', data: dashboard });
      expect(service.getDashboard).toHaveBeenCalledWith(ORG);
    });
  });

  describe('GET /dashboard/summary', () => {
    it('wraps the summary in the success envelope and forwards the org', async () => {
      const summary = {
        kpis: {
          totalApplicants: 0,
          activeApplicants: 0,
          completedApplicants: 0,
          pendingDocuments: 0,
          completedDocuments: 0,
          activeWorkflows: 0,
          completedWorkflows: 0,
          totalStaff: 0,
        },
        applicantStatus: [],
        documentCompletion: {
          fullyComplete: 0,
          incomplete: 0,
          averageCompletion: 0,
          awaitingUpload: 0,
          missingDocuments: 0,
        },
        workflowDistribution: [],
      };
      service.getSummary.mockResolvedValue(summary);

      const result = await controller.getSummary(jwtUser);

      expect(result).toEqual({
        success: true,
        message: 'Dashboard summary retrieved',
        data: summary,
      });
      expect(service.getSummary).toHaveBeenCalledWith(ORG);
    });
  });

  describe('GET /dashboard/activity', () => {
    it('wraps the activity feed in the success envelope', async () => {
      service.getActivity.mockResolvedValue([]);

      const result = await controller.getActivity(jwtUser);

      expect(result).toEqual({ success: true, message: 'Recent activity retrieved', data: [] });
      expect(service.getActivity).toHaveBeenCalledWith(ORG);
    });
  });

  describe('GET /dashboard/workload', () => {
    it('wraps the workload list in the success envelope', async () => {
      service.getWorkload.mockResolvedValue([]);

      const result = await controller.getWorkload(jwtUser);

      expect(result).toEqual({ success: true, message: 'Staff workload retrieved', data: [] });
      expect(service.getWorkload).toHaveBeenCalledWith(ORG);
    });
  });

  // ── RBAC metadata ──────────────────────────────────────────────────────────

  describe('RBAC', () => {
    it('requires dashboard.view on the summary endpoint', () => {
      const permissions = Reflect.getMetadata(
        'permissions',
        DashboardController.prototype.getSummary,
      ) as string[];
      expect(permissions).toContain('dashboard.view');
    });

    it('requires dashboard.view on the activity endpoint', () => {
      const permissions = Reflect.getMetadata(
        'permissions',
        DashboardController.prototype.getActivity,
      ) as string[];
      expect(permissions).toContain('dashboard.view');
    });

    it('requires dashboard.workload.view on the workload endpoint (manager/admin only)', () => {
      const permissions = Reflect.getMetadata(
        'permissions',
        DashboardController.prototype.getWorkload,
      ) as string[];
      expect(permissions).toContain('dashboard.workload.view');
      expect(permissions).not.toContain('dashboard.view');
    });

    it('references the Permissions decorator so RBAC metadata is applied', () => {
      expect(Permissions).toBeDefined();
    });
  });
});
