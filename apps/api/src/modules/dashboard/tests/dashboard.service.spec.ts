import { Test, type TestingModule } from '@nestjs/testing';

import { DashboardRepository, type DashboardData } from '../repositories/dashboard.repository';
import { DashboardService } from '../services/dashboard.service';

import { ActivityService } from '@/modules/activity/services/activity.service';
import { ApplicantService } from '@/modules/applicant/services/applicant.service';
import { DocumentService } from '@/modules/document/services/document.service';
import { DocumentRequirementService } from '@/modules/document-requirement/services/document-requirement.service';
import { StaffService } from '@/modules/staff/services/staff.service';
import { WorkflowService } from '@/modules/workflow/services/workflow.service';

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
  let applicantService: { countByStatus: jest.Mock };
  let documentService: { countByStatus: jest.Mock };
  let requirementService: { getCompletionSummary: jest.Mock };
  let workflowService: { getStageDistribution: jest.Mock };
  let staffService: { countStaff: jest.Mock; getWorkload: jest.Mock };
  let activityService: { listRecent: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: DashboardRepository, useValue: { getDashboardData: jest.fn() } },
        { provide: ApplicantService, useValue: { countByStatus: jest.fn() } },
        { provide: DocumentService, useValue: { countByStatus: jest.fn() } },
        { provide: DocumentRequirementService, useValue: { getCompletionSummary: jest.fn() } },
        { provide: WorkflowService, useValue: { getStageDistribution: jest.fn() } },
        { provide: StaffService, useValue: { countStaff: jest.fn(), getWorkload: jest.fn() } },
        { provide: ActivityService, useValue: { listRecent: jest.fn() } },
      ],
    }).compile();

    service = module.get(DashboardService);
    repo = module.get(DashboardRepository);
    applicantService = module.get(ApplicantService);
    documentService = module.get(DocumentService);
    requirementService = module.get(DocumentRequirementService);
    workflowService = module.get(WorkflowService);
    staffService = module.get(StaffService);
    activityService = module.get(ActivityService);
  });

  // ── Legacy aggregated dashboard ──────────────────────────────────────────

  describe('getDashboard (legacy)', () => {
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

    it('forwards the caller organizationId to the repository', async () => {
      repo.getDashboardData.mockResolvedValue(emptyData);

      await service.getDashboard(ORG);

      expect(repo.getDashboardData).toHaveBeenCalledWith(ORG);
    });
  });

  // ── Summary ──────────────────────────────────────────────────────────────

  describe('getSummary', () => {
    function primeSummaryMocks() {
      applicantService.countByStatus.mockResolvedValue([
        { status: 'active', count: 7 },
        { status: 'inactive', count: 2 },
        { status: 'archived', count: 3 },
      ]);
      documentService.countByStatus.mockResolvedValue([
        { status: 'pending', count: 4 },
        { status: 'verified', count: 6 },
      ]);
      requirementService.getCompletionSummary.mockResolvedValue({
        fullyComplete: 5,
        incomplete: 3,
        averageCompletion: 62,
        awaitingUpload: 9,
        missingDocuments: 12,
        applicantsWithRequirements: 8,
      });
      workflowService.getStageDistribution.mockResolvedValue([
        {
          stageId: 's1',
          stageName: 'Inquiry',
          color: '#111',
          order: 0,
          isFinal: false,
          applicantCount: 6,
        },
        {
          stageId: 's2',
          stageName: 'Completed',
          color: '#222',
          order: 1,
          isFinal: true,
          applicantCount: 4,
        },
      ]);
      staffService.countStaff.mockResolvedValue(11);
    }

    it('computes KPI cards from parallel service aggregates', async () => {
      primeSummaryMocks();

      const result = await service.getSummary(ORG);

      expect(result.kpis).toEqual({
        totalApplicants: 12,
        activeApplicants: 7,
        completedApplicants: 3, // archived
        pendingDocuments: 4,
        completedDocuments: 6, // verified
        activeWorkflows: 6, // non-final stage
        completedWorkflows: 4, // final stage
        totalStaff: 11,
      });
    });

    it('maps workflow stage distribution (names come from workflow system)', async () => {
      primeSummaryMocks();

      const result = await service.getSummary(ORG);

      expect(result.workflowDistribution).toEqual([
        { stageId: 's1', stageName: 'Inquiry', color: '#111', applicantCount: 6 },
        { stageId: 's2', stageName: 'Completed', color: '#222', applicantCount: 4 },
      ]);
      expect(result.applicantStatus).toHaveLength(2);
    });

    it('passes through the document completion summary', async () => {
      primeSummaryMocks();

      const result = await service.getSummary(ORG);

      expect(result.documentCompletion).toEqual({
        fullyComplete: 5,
        incomplete: 3,
        averageCompletion: 62,
        awaitingUpload: 9,
        missingDocuments: 12,
      });
    });

    it('forwards organizationId to every consumed service', async () => {
      primeSummaryMocks();

      await service.getSummary(ORG);

      expect(applicantService.countByStatus).toHaveBeenCalledWith(ORG);
      expect(documentService.countByStatus).toHaveBeenCalledWith(ORG);
      expect(requirementService.getCompletionSummary).toHaveBeenCalledWith(ORG);
      expect(workflowService.getStageDistribution).toHaveBeenCalledWith(ORG);
      expect(staffService.countStaff).toHaveBeenCalledWith(ORG);
    });

    it('returns zeroed KPIs for an empty organization', async () => {
      applicantService.countByStatus.mockResolvedValue([]);
      documentService.countByStatus.mockResolvedValue([]);
      requirementService.getCompletionSummary.mockResolvedValue({
        fullyComplete: 0,
        incomplete: 0,
        averageCompletion: 0,
        awaitingUpload: 0,
        missingDocuments: 0,
        applicantsWithRequirements: 0,
      });
      workflowService.getStageDistribution.mockResolvedValue([]);
      staffService.countStaff.mockResolvedValue(0);

      const result = await service.getSummary(ORG);

      expect(result.kpis).toEqual({
        totalApplicants: 0,
        activeApplicants: 0,
        completedApplicants: 0,
        pendingDocuments: 0,
        completedDocuments: 0,
        activeWorkflows: 0,
        completedWorkflows: 0,
        totalStaff: 0,
      });
      expect(result.workflowDistribution).toEqual([]);
    });
  });

  // ── Activity ─────────────────────────────────────────────────────────────

  describe('getActivity', () => {
    it('maps activities including actor and target, capped at 20', async () => {
      activityService.listRecent.mockResolvedValue([
        {
          id: 'act-1',
          type: 'document.uploaded',
          title: 'Uploaded passport',
          description: 'desc',
          createdAt: new Date('2026-06-02'),
          actor: { id: 'staff-1', firstName: 'Ada', lastName: 'Lovelace' },
          applicant: { id: 'app-1', firstName: 'Jane', lastName: 'Smith' },
        },
      ]);

      const result = await service.getActivity(ORG);

      expect(activityService.listRecent).toHaveBeenCalledWith(ORG, 20);
      expect(result[0]).toEqual({
        id: 'act-1',
        type: 'document.uploaded',
        title: 'Uploaded passport',
        description: 'desc',
        createdAt: new Date('2026-06-02'),
        actor: { id: 'staff-1', firstName: 'Ada', lastName: 'Lovelace' },
        target: { id: 'app-1', firstName: 'Jane', lastName: 'Smith' },
      });
    });

    it('tolerates a null actor', async () => {
      activityService.listRecent.mockResolvedValue([
        {
          id: 'act-2',
          type: 'system.event',
          title: 'System',
          description: null,
          createdAt: new Date('2026-06-03'),
          actor: null,
          applicant: { id: 'app-2', firstName: 'Bob', lastName: 'Jones' },
        },
      ]);

      const result = await service.getActivity(ORG);

      expect(result[0]?.actor).toBeNull();
      expect(result[0]?.target).toEqual({ id: 'app-2', firstName: 'Bob', lastName: 'Jones' });
    });

    it('returns an empty array when there is no activity', async () => {
      activityService.listRecent.mockResolvedValue([]);

      const result = await service.getActivity(ORG);

      expect(result).toEqual([]);
    });
  });

  // ── Workload ─────────────────────────────────────────────────────────────

  describe('getWorkload', () => {
    it('delegates to StaffService with organization scope', async () => {
      const workload = [
        {
          staffId: 's1',
          name: 'Ada Lovelace',
          role: 'Admin',
          assignedApplicants: 4,
          workloadPercent: 100,
        },
      ];
      staffService.getWorkload.mockResolvedValue(workload);

      const result = await service.getWorkload(ORG);

      expect(staffService.getWorkload).toHaveBeenCalledWith(ORG);
      expect(result).toBe(workload);
    });
  });
});
