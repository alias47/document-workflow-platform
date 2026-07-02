import type { PaginatedResponse, PaginationMeta } from '@/types/api';

import { http } from '@/lib/http';

export interface ActivityActor {
  id: string;
  firstName: string;
  lastName: string;
}

export interface Activity {
  id: string;
  applicantId: string;
  type: string;
  title: string;
  description: string | null;
  actor: ActivityActor | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface ActivityPage {
  data: Activity[];
  meta: PaginationMeta;
}

export interface ActivityListParams {
  page?: number;
  pageSize?: number;
}

function buildQueryString(params: ActivityListParams): string {
  const qs = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, String(v)]),
  ).toString();
  return qs ? `?${qs}` : '';
}

export const activityService = {
  async list(applicantId: string, params: ActivityListParams = {}): Promise<ActivityPage> {
    const res = await http.get<PaginatedResponse<Activity>>(
      `/applicants/${applicantId}/activity${buildQueryString(params)}`,
    );
    return { data: res.data.data, meta: res.data.meta };
  },
};
