import { Test, type TestingModule } from '@nestjs/testing';

import { DashboardRepository } from '../repositories/dashboard.repository';

import { PrismaService } from '@/prisma/prisma.service';

const ORG = 'org-uuid-1';
const STAFF = 'staff-uuid-1';

const mockRecentApplicant = {
  id: 'app-1',
  applicantNumber: 'APP-2026-0001',
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane@example.com',
  status: 'active',
  createdAt: new Date('2026-06-01'),
};

const mockRecentActivity = {
  id: 'act-1',
  applicantId: 'app-1',
  type: 'document.uploaded',
  title: 'Document uploaded',
  description: 'passport.pdf',
  createdAt: new Date('2026-06-02'),
  actor: { id: STAFF, firstName: 'Admin', lastName: 'User' },
};

describe('DashboardRepository', () => {
  let repo: DashboardRepository;
  let prisma: {
    applicant: { groupBy: jest.Mock; findMany: jest.Mock };
    document: { groupBy: jest.Mock };
    applicantActivity: { findMany: jest.Mock };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      applicant: { groupBy: jest.fn(), findMany: jest.fn() },
      document: { groupBy: jest.fn() },
      applicantActivity: { findMany: jest.fn() },
      // Array-form $transaction: resolve the batched query promises together.
      $transaction: jest.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [DashboardRepository, { provide: PrismaService, useValue: prisma }],
    }).compile();

    repo = module.get(DashboardRepository);
  });

  it('scopes every query by organizationId and excludes soft-deleted records', async () => {
    prisma.applicant.groupBy.mockResolvedValue([]);
    prisma.document.groupBy.mockResolvedValue([]);
    prisma.applicant.findMany.mockResolvedValue([]);
    prisma.applicantActivity.findMany.mockResolvedValue([]);

    await repo.getDashboardData(ORG);

    expect(prisma.applicant.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({ where: { organizationId: ORG, deletedAt: null } }),
    );
    expect(prisma.document.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({ where: { organizationId: ORG, deletedAt: null } }),
    );
    expect(prisma.applicant.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { organizationId: ORG, deletedAt: null } }),
    );
    // Activities are append-only (no deletedAt column) — scoped by org only.
    expect(prisma.applicantActivity.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { organizationId: ORG } }),
    );
  });

  it('batches all reads in a single $transaction (no N+1)', async () => {
    prisma.applicant.groupBy.mockResolvedValue([]);
    prisma.document.groupBy.mockResolvedValue([]);
    prisma.applicant.findMany.mockResolvedValue([]);
    prisma.applicantActivity.findMany.mockResolvedValue([]);

    await repo.getDashboardData(ORG);

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it('maps applicant and document status groups into flat status counts', async () => {
    prisma.applicant.groupBy.mockResolvedValue([
      { status: 'active', _count: { status: 5 } },
      { status: 'archived', _count: { status: 2 } },
    ]);
    prisma.document.groupBy.mockResolvedValue([
      { status: 'pending', _count: { status: 3 } },
      { status: 'verified', _count: { status: 4 } },
    ]);
    prisma.applicant.findMany.mockResolvedValue([]);
    prisma.applicantActivity.findMany.mockResolvedValue([]);

    const result = await repo.getDashboardData(ORG);

    expect(result.applicantStatusCounts).toEqual([
      { status: 'active', count: 5 },
      { status: 'archived', count: 2 },
    ]);
    expect(result.documentStatusCounts).toEqual([
      { status: 'pending', count: 3 },
      { status: 'verified', count: 4 },
    ]);
  });

  it('returns recent applicants newest-first, capped at 10', async () => {
    prisma.applicant.groupBy.mockResolvedValue([]);
    prisma.document.groupBy.mockResolvedValue([]);
    prisma.applicant.findMany.mockResolvedValue([mockRecentApplicant]);
    prisma.applicantActivity.findMany.mockResolvedValue([]);

    const result = await repo.getDashboardData(ORG);

    expect(result.recentApplicants).toEqual([mockRecentApplicant]);
    expect(prisma.applicant.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { createdAt: 'desc' }, take: 10 }),
    );
  });

  it('returns recent activities newest-first with actor, capped at 15', async () => {
    prisma.applicant.groupBy.mockResolvedValue([]);
    prisma.document.groupBy.mockResolvedValue([]);
    prisma.applicant.findMany.mockResolvedValue([]);
    prisma.applicantActivity.findMany.mockResolvedValue([mockRecentActivity]);

    const result = await repo.getDashboardData(ORG);

    expect(result.recentActivities).toEqual([mockRecentActivity]);
    expect(prisma.applicantActivity.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { createdAt: 'desc' },
        take: 15,
        select: expect.objectContaining({
          actor: { select: { id: true, firstName: true, lastName: true } },
        }),
      }),
    );
  });
});
