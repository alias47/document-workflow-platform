import type {
  DashboardActivity,
  DashboardResponse,
  DashboardSummaryResponse,
  StaffWorkloadItem,
} from '@/features/dashboard/types/dashboard.types';
import type { ApiResponse } from '@/types/api';

import { http } from '@/lib/http';

export const dashboardService = {
  async getDashboard(): Promise<DashboardResponse> {
    const res = await http.get<ApiResponse<DashboardResponse>>('/dashboard');
    return res.data.data;
  },

  async getSummary(): Promise<DashboardSummaryResponse> {
    const res = await http.get<ApiResponse<DashboardSummaryResponse>>('/dashboard/summary');
    return res.data.data;
  },

  async getActivity(): Promise<DashboardActivity[]> {
    const res = await http.get<ApiResponse<DashboardActivity[]>>('/dashboard/activity');
    return res.data.data;
  },

  async getWorkload(): Promise<StaffWorkloadItem[]> {
    const res = await http.get<ApiResponse<StaffWorkloadItem[]>>('/dashboard/workload');
    return res.data.data;
  },
};
