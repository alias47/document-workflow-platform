import { Test, TestingModule } from '@nestjs/testing';

import { ReportRepository } from '../repositories/report.repository';

import { PrismaService } from '@/prisma/prisma.service';

const ORG_ID = 'org-uuid';

const mockPrisma = {
  applicant: {
    findMany: jest.fn(),
    count: jest.fn(),
  },
  workflowStage: {
    findMany: jest.fn(),
  },
  staff: {
    findMany: jest.fn(),
    count: jest.fn(),
  },
};

describe('ReportRepository', () => {
  let repo: ReportRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReportRepository, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    repo = module.get(ReportRepository);
    jest.clearAllMocks();
  });

  describe('getApplicantReport', () => {
    it('queries with organizationId and deletedAt:null', async () => {
      mockPrisma.applicant.findMany.mockResolvedValue([]);
      mockPrisma.applicant.count.mockResolvedValue(0);

      await repo.getApplicantReport(ORG_ID, { page: 1, pageSize: 25 });

      expect(mockPrisma.applicant.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ organizationId: ORG_ID, deletedAt: null }),
        }),
      );
    });

    it('applies search filter using OR conditions', async () => {
      mockPrisma.applicant.findMany.mockResolvedValue([]);
      mockPrisma.applicant.count.mockResolvedValue(0);

      await repo.getApplicantReport(ORG_ID, { search: 'alice', page: 1, pageSize: 25 });

      const call = mockPrisma.applicant.findMany.mock.calls[0]?.[0] as { where: { OR?: unknown } };
      expect(call?.where?.OR).toBeDefined();
    });

    it('applies consultantId filter', async () => {
      mockPrisma.applicant.findMany.mockResolvedValue([]);
      mockPrisma.applicant.count.mockResolvedValue(0);

      await repo.getApplicantReport(ORG_ID, { consultantId: 'staff-id', page: 1, pageSize: 25 });

      const call = mockPrisma.applicant.findMany.mock.calls[0]?.[0] as {
        where: { assignments?: unknown };
      };
      expect(call?.where?.assignments).toBeDefined();
    });

    it('applies status filter', async () => {
      mockPrisma.applicant.findMany.mockResolvedValue([]);
      mockPrisma.applicant.count.mockResolvedValue(0);

      await repo.getApplicantReport(ORG_ID, { status: 'active', page: 1, pageSize: 25 });

      const call = mockPrisma.applicant.findMany.mock.calls[0]?.[0] as {
        where: { status?: unknown };
      };
      expect(call?.where?.status).toBe('active');
    });

    it('orders by newest (createdAt desc) by default', async () => {
      mockPrisma.applicant.findMany.mockResolvedValue([]);
      mockPrisma.applicant.count.mockResolvedValue(0);

      await repo.getApplicantReport(ORG_ID, { page: 1, pageSize: 25 });

      const call = mockPrisma.applicant.findMany.mock.calls[0]?.[0] as { orderBy?: unknown };
      expect(call?.orderBy).toEqual({ createdAt: 'desc' });
    });

    it('orders by oldest when sort=oldest', async () => {
      mockPrisma.applicant.findMany.mockResolvedValue([]);
      mockPrisma.applicant.count.mockResolvedValue(0);

      await repo.getApplicantReport(ORG_ID, { sort: 'oldest', page: 1, pageSize: 25 });

      const call = mockPrisma.applicant.findMany.mock.calls[0]?.[0] as { orderBy?: unknown };
      expect(call?.orderBy).toEqual({ createdAt: 'asc' });
    });

    it('paginates correctly', async () => {
      mockPrisma.applicant.findMany.mockResolvedValue([]);
      mockPrisma.applicant.count.mockResolvedValue(0);

      await repo.getApplicantReport(ORG_ID, { page: 3, pageSize: 10 });

      const call = mockPrisma.applicant.findMany.mock.calls[0]?.[0] as {
        skip?: number;
        take?: number;
      };
      expect(call?.skip).toBe(20);
      expect(call?.take).toBe(10);
    });
  });

  describe('getWorkflowReport', () => {
    it('returns stages with applicant counts', async () => {
      mockPrisma.workflowStage.findMany.mockResolvedValue([
        {
          id: 'stage-1',
          name: 'Applied',
          color: '#blue',
          order: 1,
          currentWorkflows: [{ id: 'wf-1' }, { id: 'wf-2' }],
        },
      ]);

      const result = await repo.getWorkflowReport(ORG_ID);

      expect(result).toHaveLength(1);
      expect(result[0]?.applicantCount).toBe(2);
    });

    it('scopes to organizationId', async () => {
      mockPrisma.workflowStage.findMany.mockResolvedValue([]);

      await repo.getWorkflowReport(ORG_ID);

      expect(mockPrisma.workflowStage.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ organizationId: ORG_ID }),
        }),
      );
    });
  });

  describe('getStaffWorkloadReport', () => {
    it('scopes to organizationId and excludes deleted staff', async () => {
      mockPrisma.staff.findMany.mockResolvedValue([]);
      mockPrisma.staff.count.mockResolvedValue(0);

      await repo.getStaffWorkloadReport(ORG_ID, { page: 1, pageSize: 25 });

      expect(mockPrisma.staff.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ organizationId: ORG_ID, deletedAt: null }),
        }),
      );
    });

    it('filters by roleId', async () => {
      mockPrisma.staff.findMany.mockResolvedValue([]);
      mockPrisma.staff.count.mockResolvedValue(0);

      await repo.getStaffWorkloadReport(ORG_ID, { roleId: 'role-uuid', page: 1, pageSize: 25 });

      const call = mockPrisma.staff.findMany.mock.calls[0]?.[0] as { where: { roleId?: unknown } };
      expect(call?.where?.roleId).toBe('role-uuid');
    });
  });
});
