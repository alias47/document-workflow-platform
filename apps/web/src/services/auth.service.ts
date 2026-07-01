import type { ApiResponse } from '@/types/api';

import { env } from '@/lib/env';
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
}

export interface LoginResponseData {
  staff: StaffUser;
  mustChangePassword: boolean;
}

// ---------- mock data (used until the backend is wired to the UI) ----------
const MOCK_USER: StaffUser = {
  id: 'staff-1',
  email: 'sarah@example.com',
  firstName: 'Sarah',
  lastName: 'Mitchell',
  role: 'admin',
  organizationId: 'org-1',
};

const MOCK_DELAY = 400;
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ---------- service ----------
// All HTTP communication for auth lives here. Components never call axios.
export const authService = {
  async login(credentials: LoginCredentials): Promise<ApiResponse<LoginResponseData>> {
    if (env.isDev) {
      await delay(MOCK_DELAY);
      if (credentials.email && credentials.password) {
        return {
          success: true,
          message: 'Login successful',
          data: { staff: MOCK_USER, mustChangePassword: false },
        };
      }
      throw new Error('Invalid credentials');
    }
    const res = await http.post<ApiResponse<LoginResponseData>>('/auth/login', credentials);
    return res.data;
  },

  async logout(): Promise<void> {
    if (env.isDev) {
      await delay(200);
      return;
    }
    await http.post('/auth/logout', {});
  },

  async refreshToken(): Promise<ApiResponse<null>> {
    if (env.isDev) {
      await delay(200);
      return { success: true, message: 'Token refreshed', data: null };
    }
    const res = await http.post<ApiResponse<null>>('/auth/refresh', {});
    return res.data;
  },

  async me(): Promise<ApiResponse<StaffUser>> {
    if (env.isDev) {
      await delay(200);
      return { success: true, message: 'OK', data: MOCK_USER };
    }
    const res = await http.get<ApiResponse<StaffUser>>('/auth/me');
    return res.data;
  },

  async forgotPassword(email: string): Promise<ApiResponse<null>> {
    if (env.isDev) {
      await delay(MOCK_DELAY);
      return { success: true, message: 'Reset link sent', data: null };
    }
    const res = await http.post<ApiResponse<null>>('/auth/forgot-password', { email });
    return res.data;
  },

  async resetPassword(token: string, password: string): Promise<ApiResponse<null>> {
    if (env.isDev) {
      await delay(MOCK_DELAY);
      return { success: true, message: 'Password changed', data: null };
    }
    const res = await http.post<ApiResponse<null>>('/auth/reset-password', { token, password });
    return res.data;
  },
};
