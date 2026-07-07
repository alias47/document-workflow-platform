import { BadRequestException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';

import { ReportController } from '../controllers/report.controller';
import { ReportService } from '../services/report.service';

import { PERMISSIONS_KEY } from '@/common/decorators/permissions.decorator';

const ORG_ID = 'org-uuid';
const STAFF_ID = 'staff-uuid';

const mockUser = {
  organizationId: ORG_ID,
  sub: STAFF_ID,
  permissions: ['report.view', 'report.export'],
};

const mockBuffer = Buffer.from('export-data');
const mockExportResult = { buffer: mockBuffer, mimeType: 'text/csv', filename: 'report.csv' };

const mockPaginated = {
  data: [{ name: 'Alice', email: 'a@b.com' }],
  meta: { page: 1, pageSize: 25, totalItems: 1, totalPages: 1 },
};

const mockReportService = {
  getApplicantReport: jest.fn().mockResolvedValue(mockPaginated),
  exportApplicantReport: jest.fn().mockResolvedValue(mockExportResult),
  getDocumentReport: jest.fn().mockResolvedValue(mockPaginated),
  exportDocumentReport: jest.fn().mockResolvedValue(mockExportResult),
  getWorkflowReport: jest.fn().mockResolvedValue({ data: [] }),
  exportWorkflowReport: jest.fn().mockResolvedValue(mockExportResult),
  getStaffWorkloadReport: jest.fn().mockResolvedValue(mockPaginated),
  exportStaffWorkloadReport: jest.fn().mockResolvedValue(mockExportResult),
};

function makeRes(): Response {
  return {
    set: jest.fn(),
    send: jest.fn(),
  } as unknown as Response;
}

describe('ReportController', () => {
  let controller: ReportController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportController],
      providers: [{ provide: ReportService, useValue: mockReportService }],
    }).compile();

    controller = module.get(ReportController);
    jest.clearAllMocks();
    mockReportService.exportApplicantReport.mockResolvedValue(mockExportResult);
    mockReportService.exportDocumentReport.mockResolvedValue(mockExportResult);
    mockReportService.exportWorkflowReport.mockResolvedValue(mockExportResult);
    mockReportService.exportStaffWorkloadReport.mockResolvedValue(mockExportResult);
  });

  describe('getApplicantReport', () => {
    it('returns success envelope with data and meta', async () => {
      const result = await controller.getApplicantReport(mockUser as never, {} as never);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.meta).toBeDefined();
    });

    it('passes organizationId to service', async () => {
      await controller.getApplicantReport(mockUser as never, {} as never);
      expect(mockReportService.getApplicantReport).toHaveBeenCalledWith(ORG_ID, expect.any(Object));
    });
  });

  describe('exportApplicantReport', () => {
    it('sets Content-Disposition and sends buffer', async () => {
      const res = makeRes();
      await controller.exportApplicantReport(mockUser as never, { format: 'csv' } as never, res);

      expect(res.set).toHaveBeenCalledWith(
        expect.objectContaining({ 'Content-Disposition': expect.stringContaining('attachment') }),
      );
      expect(res.send).toHaveBeenCalledWith(mockBuffer);
    });

    it('propagates service errors', async () => {
      mockReportService.exportApplicantReport.mockRejectedValueOnce(
        new BadRequestException('Too many rows'),
      );
      const res = makeRes();

      await expect(
        controller.exportApplicantReport(mockUser as never, { format: 'csv' } as never, res),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getDocumentReport', () => {
    it('returns success envelope', async () => {
      const result = await controller.getDocumentReport(mockUser as never, {} as never);
      expect(result.success).toBe(true);
    });
  });

  describe('exportDocumentReport', () => {
    it('streams buffer to response', async () => {
      const res = makeRes();
      await controller.exportDocumentReport(mockUser as never, { format: 'xlsx' } as never, res);

      expect(res.send).toHaveBeenCalledWith(mockBuffer);
    });
  });

  describe('getWorkflowReport', () => {
    it('returns success envelope', async () => {
      const result = await controller.getWorkflowReport(mockUser as never);
      expect(result.success).toBe(true);
    });
  });

  describe('exportWorkflowReport', () => {
    it('streams buffer to response', async () => {
      const res = makeRes();
      await controller.exportWorkflowReport(mockUser as never, { format: 'pdf' } as never, res);
      expect(res.send).toHaveBeenCalledWith(mockBuffer);
    });
  });

  describe('getStaffWorkloadReport', () => {
    it('returns success envelope', async () => {
      const result = await controller.getStaffWorkloadReport(mockUser as never, {} as never);
      expect(result.success).toBe(true);
    });
  });

  describe('exportStaffWorkloadReport', () => {
    it('streams buffer to response', async () => {
      const res = makeRes();
      await controller.exportStaffWorkloadReport(
        mockUser as never,
        { format: 'csv' } as never,
        res,
      );
      expect(res.send).toHaveBeenCalledWith(mockBuffer);
    });
  });

  // Sprint 12.2: report.view / report.export are now seeded permissions. Confirm
  // every view route requires report.view and every export requires report.export.
  describe('authorization', () => {
    const reflector = new Reflector();

    it('gates view routes on report.view', () => {
      for (const handler of [
        controller.getApplicantReport,
        controller.getDocumentReport,
        controller.getWorkflowReport,
        controller.getStaffWorkloadReport,
      ]) {
        expect(reflector.get<string[]>(PERMISSIONS_KEY, handler)).toEqual(['report.view']);
      }
    });

    it('gates export routes on report.export', () => {
      for (const handler of [
        controller.exportApplicantReport,
        controller.exportDocumentReport,
        controller.exportWorkflowReport,
        controller.exportStaffWorkloadReport,
      ]) {
        expect(reflector.get<string[]>(PERMISSIONS_KEY, handler)).toEqual(['report.export']);
      }
    });
  });
});
