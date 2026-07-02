import type { DashboardResponse } from '@/features/dashboard/types/dashboard.types';
import type { ApiResponse } from '@/types/api';

import { http } from '@/lib/http';

export const dashboardService = {
  async getDashboard(): Promise<DashboardResponse> {
    const res = await http.get<ApiResponse<DashboardResponse>>('/dashboard');
    return res.data.data;
  },
};
