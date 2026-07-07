import type { ApiResponse } from '@/types/api';

import { http } from '@/lib/http';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface StaffUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  organizationId: string;
  /** Permission strings granted to this user (e.g. 'applicant.view'). */
  permissions: string[];
}

export interface LoginResponseData {
  staff: StaffUser;
  mustChangePassword: boolean;
}

// All HTTP communication for auth lives here. Components never call axios.
// Authentication is cookie-based (HttpOnly); no token is read or stored in JS.
export const authService = {
  async login(credentials: LoginCredentials): Promise<ApiResponse<LoginResponseData>> {
    const res = await http.post<ApiResponse<LoginResponseData>>('/auth/login', credentials);
    return res.data;
  },

  async logout(): Promise<void> {
    await http.post('/auth/logout', {});
  },

  async refreshToken(): Promise<ApiResponse<null>> {
    const res = await http.post<ApiResponse<null>>('/auth/refresh', {});
    return res.data;
  },

  async me(): Promise<ApiResponse<StaffUser>> {
    const res = await http.get<ApiResponse<StaffUser>>('/auth/me');
    return res.data;
  },

  async forgotPassword(email: string): Promise<ApiResponse<null>> {
    const res = await http.post<ApiResponse<null>>('/auth/forgot-password', { email });
    return res.data;
  },

  async resetPassword(token: string, password: string): Promise<ApiResponse<null>> {
    const res = await http.post<ApiResponse<null>>('/auth/reset-password', { token, password });
    return res.data;
  },
};
