export type ExportFormat = 'csv' | 'xlsx' | 'pdf';

export interface ApplicantReportRow {
  name: string;
  email: string;
  phone: string;
  consultant: string;
  workflowStage: string;
  status: string;
  country: string;
  createdAt: string;
}

export interface DocumentReportRow {
  applicant: string;
  email: string;
  totalRequirements: number;
  uploaded: number;
  approved: number;
  rejected: number;
  pending: number;
  completionPercent: string;
}

export interface WorkflowReportRow {
  stageId: string;
  stageName: string;
  color: string | null;
  order: number;
  applicantCount: number;
}

export interface StaffWorkloadRow {
  name: string;
  role: string;
  activeApplicants: number;
  completedApplicants: number;
}

export interface ReportFilters {
  search?: string | undefined;
  consultantId?: string | undefined;
  workflowStageId?: string | undefined;
  status?: string | undefined;
  country?: string | undefined;
  intake?: string | undefined;
  startDate?: string | undefined;
  endDate?: string | undefined;
  sort?: 'newest' | 'oldest' | 'name' | undefined;
  roleId?: string | undefined;
  page?: number | undefined;
  pageSize?: number | undefined;
  [key: string]: unknown;
}
