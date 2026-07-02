import { Test, type TestingModule } from '@nestjs/testing';

import { DashboardRepository, type DashboardData } from '../repositories/dashboard.repository';
import { DashboardService } from '../services/dashboard.service';

const ORG = 'org-1';

const populatedData: DashboardData = {
  applicantStatusCounts: [
    { status: 'active', count: 7 },
    { status: 'inactive', count: 2 },
    { status: 'archived', count: 3 },
  ],
  documentStatusCounts: [
    { status: 'pending', count: 4 },
    { status: 'verified', count: 6 },
    { status: 'rejected', count: 1 },
    { status: 'expired', count: 2 },
  ],
  recentApplicants: [
    {
      id: 'app-1',
      applicantNumber: 'APP-2026-0001',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      status: 'active',
      createdAt: new Date('2026-06-01'),
    },
  ],
  recentActivities: [
    {
      id: 'act-1',
      applicantId: 'app-1',
      type: 'note.created',
      title: 'Note added',
      description: null,
      createdAt: new Date('2026-06-02'),
      actor: { id: 'staff-1', firstName: 'Admin', lastName: 'User' },
    },
  ],
};

const emptyData: DashboardData = {
  applicantStatusCounts: [],
  documentStatusCounts: [],
  recentApplicants: [],
  recentActivities: [],
};

describe('DashboardService', () => {
  let service: DashboardService;
  let repo: jest.Mocked<DashboardRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: DashboardRepository, useValue: { getDashboardData: jest.fn() } },
      ],
    }).compile();

    service = module.get(DashboardService);
    repo = module.get(DashboardRepository);
  });

  describe('aggregation', () => {
    it('derives summary totals and per-status counts from the raw data', async () => {
      repo.getDashboardData.mockResolvedValue(populatedData);

      const result = await service.getDashboard(ORG);

      expect(result.summary).toEqual({
        totalApplicants: 12,
        activeApplicants: 7,
        archivedApplicants: 3,
        totalDocuments: 13,
        pendingDocuments: 4,
        verifiedDocuments: 6,
        rejectedDocuments: 1,
      });
    });

    it('builds applicant and document summaries', async () => {
      repo.getDashboardData.mockResolvedValue(populatedData);

      const result = await service.getDashboard(ORG);

      expect(result.applicantSummary).toEqual({ active: 7, archived: 3 });
      expect(result.documentSummary).toEqual({
        pending: 4,
        verified: 6,
        rejected: 1,
        expired: 2,
      });
    });

    it('passes through recent applicants and activities unchanged', async () => {
      repo.getDashboardData.mockResolvedValue(populatedData);

      const result = await service.getDashboard(ORG);

      expect(result.recentApplicants).toBe(populatedData.recentApplicants);
      expect(result.recentActivities).toBe(populatedData.recentActivities);
    });
  });

  describe('organization isolation', () => {
    it('forwards the caller organizationId to the repository', async () => {
      repo.getDashboardData.mockResolvedValue(emptyData);

      await service.getDashboard(ORG);

      expect(repo.getDashboardData).toHaveBeenCalledWith(ORG);
    });
  });

  describe('empty organization', () => {
    it('returns zeroed summaries and empty lists', async () => {
      repo.getDashboardData.mockResolvedValue(emptyData);

      const result = await service.getDashboard(ORG);

      expect(result.summary).toEqual({
        totalApplicants: 0,
        activeApplicants: 0,
        archivedApplicants: 0,
        totalDocuments: 0,
        pendingDocuments: 0,
        verifiedDocuments: 0,
        rejectedDocuments: 0,
      });
      expect(result.applicantSummary).toEqual({ active: 0, archived: 0 });
      expect(result.documentSummary).toEqual({ pending: 0, verified: 0, rejected: 0, expired: 0 });
      expect(result.recentApplicants).toEqual([]);
      expect(result.recentActivities).toEqual([]);
    });
  });
});
