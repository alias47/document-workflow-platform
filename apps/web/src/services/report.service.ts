import type {
  ApplicantReportRow,
  DocumentReportRow,
  ExportFormat,
  ReportFilters,
  StaffWorkloadRow,
  WorkflowReportRow,
} from '@/features/reports/types';
import type { PaginatedResponse } from '@/types/api';

import { http } from '@/lib/http';

function buildParams(filters: ReportFilters): Record<string, string> {
  const params: Record<string, string> = {};
  if (filters.search) params['search'] = filters.search;
  if (filters.consultantId) params['consultantId'] = filters.consultantId;
  if (filters.workflowStageId) params['workflowStageId'] = filters.workflowStageId;
  if (filters.status) params['status'] = filters.status;
  if (filters.country) params['country'] = filters.country;
  if (filters.intake) params['intake'] = filters.intake;
  if (filters.startDate) params['startDate'] = filters.startDate;
  if (filters.endDate) params['endDate'] = filters.endDate;
  if (filters.sort) params['sort'] = filters.sort;
  if (filters.roleId) params['roleId'] = filters.roleId;
  if (filters.page !== null && filters.page !== undefined) params['page'] = String(filters.page);
  if (filters.pageSize !== null && filters.pageSize !== undefined)
    params['pageSize'] = String(filters.pageSize);
  return params;
}

async function downloadExport(url: string, params: Record<string, string>): Promise<void> {
  const query = new URLSearchParams(params).toString();
  const fullUrl = `${http.defaults.baseURL ?? ''}${url}?${query}`;

  const a = document.createElement('a');
  a.href = fullUrl;
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export const reportService = {
  async getApplicantReport(filters: ReportFilters): Promise<PaginatedResponse<ApplicantReportRow>> {
    const res = await http.get<PaginatedResponse<ApplicantReportRow>>('/reports/applicants', {
      params: buildParams(filters),
    });
    return res.data;
  },

  async exportApplicantReport(filters: ReportFilters, format: ExportFormat): Promise<void> {
    await downloadExport('/reports/applicants/export', { ...buildParams(filters), format });
  },

  async getDocumentReport(filters: ReportFilters): Promise<PaginatedResponse<DocumentReportRow>> {
    const res = await http.get<PaginatedResponse<DocumentReportRow>>('/reports/documents', {
      params: buildParams(filters),
    });
    return res.data;
  },

  async exportDocumentReport(filters: ReportFilters, format: ExportFormat): Promise<void> {
    await downloadExport('/reports/documents/export', { ...buildParams(filters), format });
  },

  async getWorkflowReport(): Promise<{ data: WorkflowReportRow[] }> {
    const res = await http.get<{ success: true; message: string; data: WorkflowReportRow[] }>(
      '/reports/workflow',
    );
    return res.data;
  },

  async exportWorkflowReport(format: ExportFormat): Promise<void> {
    await downloadExport('/reports/workflow/export', { format });
  },

  async getStaffWorkloadReport(
    filters: ReportFilters,
  ): Promise<PaginatedResponse<StaffWorkloadRow>> {
    const res = await http.get<PaginatedResponse<StaffWorkloadRow>>('/reports/staff-workload', {
      params: buildParams(filters),
    });
    return res.data;
  },

  async exportStaffWorkloadReport(filters: ReportFilters, format: ExportFormat): Promise<void> {
    await downloadExport('/reports/staff-workload/export', { ...buildParams(filters), format });
  },
};
