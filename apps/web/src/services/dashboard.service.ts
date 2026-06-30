import { type ApiResponse, apiClient } from './api-client';

export interface DashboardStats {
  totalApplicants: number;
  pendingReview: number;
  approvedThisMonth: number;
  missingDocuments: number;
}

export interface WorkflowStage {
  label: string;
  count: number;
  percentage: number;
}

export interface DashboardSummary {
  stats: DashboardStats;
  workflowStages: WorkflowStage[];
}

// ---------- mock ----------
const MOCK_SUMMARY: DashboardSummary = {
  stats: {
    totalApplicants: 247,
    pendingReview: 34,
    approvedThisMonth: 89,
    missingDocuments: 18,
  },
  workflowStages: [
    { label: 'New Applicants', count: 42, percentage: 17 },
    { label: 'Documents Pending', count: 78, percentage: 32 },
    { label: 'Under Review', count: 34, percentage: 14 },
    { label: 'Completed', count: 93, percentage: 38 },
  ],
};

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ---------- service ----------
export const dashboardService = {
  async getSummary(): Promise<ApiResponse<DashboardSummary>> {
    if (process.env.NODE_ENV === 'development') {
      await delay(300);
      return { success: true, message: 'OK', data: MOCK_SUMMARY };
    }
    return apiClient.get<ApiResponse<DashboardSummary>>('/dashboard/summary');
  },
};
