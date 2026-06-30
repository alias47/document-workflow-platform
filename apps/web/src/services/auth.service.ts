import { type ApiResponse, apiClient } from './api-client';

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

export interface AuthTokens {
  accessToken: string;
}

// ---------- mock data ----------
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
export const authService = {
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: StaffUser }>> {
    if (process.env.NODE_ENV === 'development') {
      await delay(MOCK_DELAY);
      if (credentials.email === 'demo@example.com' && credentials.password === 'password') {
        return { success: true, message: 'Login successful', data: { user: MOCK_USER } };
      }
      if (credentials.email && credentials.password) {
        return { success: true, message: 'Login successful', data: { user: MOCK_USER } };
      }
      throw new Error('Invalid credentials');
    }
    return apiClient.post<ApiResponse<{ user: StaffUser }>>('/auth/login', credentials);
  },

  async logout(): Promise<void> {
    if (process.env.NODE_ENV === 'development') {
      await delay(200);
      return;
    }
    await apiClient.post('/auth/logout', {});
  },

  async refreshToken(): Promise<ApiResponse<AuthTokens>> {
    if (process.env.NODE_ENV === 'development') {
      await delay(200);
      return { success: true, message: 'Token refreshed', data: { accessToken: 'mock-token' } };
    }
    return apiClient.post<ApiResponse<AuthTokens>>('/auth/refresh', {});
  },

  async forgotPassword(email: string): Promise<ApiResponse<null>> {
    if (process.env.NODE_ENV === 'development') {
      await delay(MOCK_DELAY);
      return { success: true, message: 'Reset link sent', data: null };
    }
    return apiClient.post<ApiResponse<null>>('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, password: string): Promise<ApiResponse<null>> {
    if (process.env.NODE_ENV === 'development') {
      await delay(MOCK_DELAY);
      return { success: true, message: 'Password changed', data: null };
    }
    return apiClient.post<ApiResponse<null>>('/auth/reset-password', { token, password });
  },
};
