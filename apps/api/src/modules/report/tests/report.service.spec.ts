import { Test, TestingModule } from '@nestjs/testing';

import { ReportRepository } from '../repositories/report.repository';
import { ReportService } from '../services/report.service';

import { AuditService } from '@/modules/audit/services/audit.service';
import { ExportService } from '@/modules/export/services/export.service';

const ORG_ID = 'org-uuid';
const STAFF_ID = 'staff-uuid';

const mockBuffer = Buffer.from('mock-export');

const mockExportResult = { buffer: mockBuffer, mimeType: 'text/csv', filename: 'report.csv' };

const mockReportRepo = {
  getApplicantReport: jest.fn(),
  getApplicantReportAll: jest.fn(),
  getDocumentReport: jest.fn(),
  getDocumentReportAll: jest.fn(),
  getWorkflowReport: jest.fn(),
  getStaffWorkloadReport: jest.fn(),
  getStaffWorkloadReportAll: jest.fn(),
};

const mockExportService = {
  generate: jest.fn().mockResolvedValue(mockExportResult),
  validateFormat: jest.fn(),
};

const mockAuditService = {
  log: jest.fn().mockResolvedValue(undefined),
};

const makeApplicant = (overrides = {}) => ({
  id: 'a1',
  firstName: 'Alice',
  lastName: 'Smith',
  email: 'alice@example.com',
  phone: '+1234567890',
  country: 'Nepal',
  status: 'active',
  createdAt: new Date('2026-01-01'),
  assignments: [{ staff: { firstName: 'Bob', lastName: 'Jones' } }],
  workflow: { currentStage: { name: 'Applied' } },
  ...overrides,
});

describe('ReportService', () => {
  let service: ReportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportService,
        { provide: ReportRepository, useValue: mockReportRepo },
        { provide: ExportService, useValue: mockExportService },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();

    service = module.get(ReportService);
    jest.clearAllMocks();
    mockExportService.generate.mockResolvedValue(mockExportResult);
    mockAuditService.log.mockResolvedValue(undefined);
  });

  describe('getApplicantReport', () => {
    it('returns paginated rows with correct meta', async () => {
      mockReportRepo.getApplicantReport.mockResolvedValue({
        data: [makeApplicant()],
        total: 1,
      });

      const result = await service.getApplicantReport(ORG_ID, { page: 1, pageSize: 25 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.totalItems).toBe(1);
      expect(result.meta.totalPages).toBe(1);
    });

    it('maps applicant to report row correctly', async () => {
      mockReportRepo.getApplicantReport.mockResolvedValue({
        data: [makeApplicant()],
        total: 1,
      });

      const result = await service.getApplicantReport(ORG_ID, { page: 1, pageSize: 25 });

      expect(result.data[0]).toMatchObject({
        name: 'Alice Smith',
        email: 'alice@example.com',
        consultant: 'Bob Jones',
        workflowStage: 'Applied',
        country: 'Nepal',
        status: 'active',
      });
    });

    it('handles applicants with no workflow and no assignment', async () => {
      mockReportRepo.getApplicantReport.mockResolvedValue({
        data: [makeApplicant({ workflow: null, assignments: [] })],
        total: 1,
      });

      const result = await service.getApplicantReport(ORG_ID, { page: 1, pageSize: 25 });

      expect(result.data[0]?.workflowStage).toBe('');
      expect(result.data[0]?.consultant).toBe('');
    });
  });

  describe('exportApplicantReport', () => {
    it('calls auditService.log with correct action', async () => {
      mockReportRepo.getApplicantReportAll.mockResolvedValue({ data: [makeApplicant()], total: 1 });

      await service.exportApplicantReport(ORG_ID, {}, 'csv', STAFF_ID);

      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'report.export.applicants', organizationId: ORG_ID }),
      );
    });

    it('delegates to ExportService with correct columns', async () => {
      mockReportRepo.getApplicantReportAll.mockResolvedValue({ data: [makeApplicant()], total: 1 });

      await service.exportApplicantReport(ORG_ID, {}, 'csv', STAFF_ID);

      expect(mockExportService.generate).toHaveBeenCalledWith(
        'csv',
        expect.objectContaining({ title: 'Applicant Report' }),
      );
    });

    it('validates format before generating', async () => {
      mockReportRepo.getApplicantReportAll.mockResolvedValue({ data: [], total: 0 });

      await service.exportApplicantReport(ORG_ID, {}, 'csv', STAFF_ID);

      expect(mockExportService.validateFormat).toHaveBeenCalledWith('csv');
    });
  });

  describe('getDocumentReport', () => {
    it('computes document stats from requirement statuses', async () => {
      const reqs = [
        { status: 'approved' },
        { status: 'approved' },
        { status: 'rejected' },
        { status: 'pending' },
        { status: 'uploaded' },
      ];
      mockReportRepo.getDocumentReport.mockResolvedValue({
        data: [
          { firstName: 'Alice', lastName: 'Smith', email: 'a@b.com', documentRequirements: reqs },
        ],
        total: 1,
      });

      const result = await service.getDocumentReport(ORG_ID, { page: 1, pageSize: 25 });

      expect(result.data[0]).toMatchObject({
        totalRequirements: 5,
        approved: 2,
        rejected: 1,
        pending: 1,
        uploaded: 1,
        completionPercent: '40%',
      });
    });

    it('shows 0% completion for applicant with no requirements', async () => {
      mockReportRepo.getDocumentReport.mockResolvedValue({
        data: [{ firstName: 'Alice', lastName: 'Smith', email: null, documentRequirements: [] }],
        total: 1,
      });

      const result = await service.getDocumentReport(ORG_ID, { page: 1, pageSize: 25 });

      expect(result.data[0]?.completionPercent).toBe('0%');
    });
  });

  describe('exportDocumentReport', () => {
    it('audits with report.export.documents', async () => {
      mockReportRepo.getDocumentReportAll.mockResolvedValue({ data: [], total: 0 });

      await service.exportDocumentReport(ORG_ID, {}, 'xlsx', STAFF_ID);

      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'report.export.documents' }),
      );
    });
  });

  describe('getWorkflowReport', () => {
    it('returns workflow distribution', async () => {
      mockReportRepo.getWorkflowReport.mockResolvedValue([
        { stageId: 's1', stageName: 'Applied', applicantCount: 5 },
      ]);

      const result = await service.getWorkflowReport(ORG_ID);

      expect(result.data).toHaveLength(1);
      expect(result.data[0]?.applicantCount).toBe(5);
    });
  });

  describe('exportWorkflowReport', () => {
    it('audits with report.export.workflow', async () => {
      mockReportRepo.getWorkflowReport.mockResolvedValue([]);

      await service.exportWorkflowReport(ORG_ID, 'pdf', STAFF_ID);

      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'report.export.workflow' }),
      );
    });
  });

  describe('getStaffWorkloadReport', () => {
    it('computes active and completed counts', async () => {
      const staffMember = {
        firstName: 'Bob',
        lastName: 'Jones',
        role: { name: 'Consultant' },
        assignments: [
          { applicant: { status: 'active' } },
          { applicant: { status: 'active' } },
          { applicant: { status: 'archived' } },
        ],
      };
      mockReportRepo.getStaffWorkloadReport.mockResolvedValue({ data: [staffMember], total: 1 });

      const result = await service.getStaffWorkloadReport(ORG_ID, { page: 1, pageSize: 25 });

      expect(result.data[0]).toMatchObject({
        name: 'Bob Jones',
        role: 'Consultant',
        activeApplicants: 2,
        completedApplicants: 1,
      });
    });
  });

  describe('exportStaffWorkloadReport', () => {
    it('audits with report.export.staff_workload', async () => {
      mockReportRepo.getStaffWorkloadReportAll.mockResolvedValue({ data: [], total: 0 });

      await service.exportStaffWorkloadReport(ORG_ID, {}, 'csv', STAFF_ID);

      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'report.export.staff_workload' }),
      );
    });
  });
});
