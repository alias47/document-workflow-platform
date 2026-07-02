import type {
  AssignApplicantsData,
  AssignedApplicant,
  CreateStaffData,
  Staff,
  StaffListParams,
  StaffRole,
  UpdateStaffData,
  UpdateStaffStatusData,
} from '../types/staff.types';
import type { ApiResponse, PaginatedResponse } from '@/types/api';

import { http } from '@/lib/http';

function buildQueryString(params: StaffListParams): string {
  const qs = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null)
      .map(([k, v]) => [k, String(v)]),
  ).toString();
  return qs ? `?${qs}` : '';
}

export const staffService = {
  async list(params: StaffListParams = {}): Promise<PaginatedResponse<Staff>> {
    const res = await http.get<PaginatedResponse<Staff>>(`/staff${buildQueryString(params)}`);
    return res.data;
  },

  async getById(id: string): Promise<ApiResponse<Staff>> {
    const res = await http.get<ApiResponse<Staff>>(`/staff/${id}`);
    return res.data;
  },

  async getMe(): Promise<ApiResponse<Staff>> {
    const res = await http.get<ApiResponse<Staff>>('/staff/me');
    return res.data;
  },

  async create(data: CreateStaffData): Promise<ApiResponse<Staff>> {
    const res = await http.post<ApiResponse<Staff>>('/staff', data);
    return res.data;
  },

  async update(id: string, data: UpdateStaffData): Promise<ApiResponse<Staff>> {
    const res = await http.patch<ApiResponse<Staff>>(`/staff/${id}`, data);
    return res.data;
  },

  async updateStatus(id: string, data: UpdateStaffStatusData): Promise<ApiResponse<Staff>> {
    const res = await http.patch<ApiResponse<Staff>>(`/staff/${id}/status`, data);
    return res.data;
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    const res = await http.delete<ApiResponse<null>>(`/staff/${id}`);
    return res.data;
  },

  async listApplicants(
    id: string,
    page = 1,
    pageSize = 25,
  ): Promise<PaginatedResponse<AssignedApplicant>> {
    const res = await http.get<PaginatedResponse<AssignedApplicant>>(
      `/staff/${id}/applicants?page=${page}&pageSize=${pageSize}`,
    );
    return res.data;
  },

  async assignApplicants(id: string, data: AssignApplicantsData): Promise<ApiResponse<null>> {
    const res = await http.patch<ApiResponse<null>>(`/staff/${id}/applicants`, data);
    return res.data;
  },

  async listRoles(): Promise<ApiResponse<StaffRole[]>> {
    const res = await http.get<ApiResponse<StaffRole[]>>('/staff/roles');
    return res.data;
  },
};
