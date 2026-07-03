import type {
  ApplicantDashboard,
  ApplicantDocumentRequirement,
  ApplicantPortalProfile,
  ApplicantProfile,
  UpdateApplicantProfileData,
} from '../types';
import type { ApiResponse } from '@/types/api';

import { http } from '@/lib/http';

export const applicantPortalService = {
  async login(data: { email: string; password: string }) {
    const res = await http.post<
      ApiResponse<{ mustChangePassword: boolean; profile: ApplicantPortalProfile }>
    >('/applicant-auth/login', data);
    return res.data.data;
  },

  async logout() {
    await http.post('/applicant-auth/logout');
  },

  async refresh() {
    await http.post('/applicant-auth/refresh');
  },

  async getMe() {
    const res = await http.get<ApiResponse<ApplicantPortalProfile>>('/applicant-auth/me');
    return res.data.data;
  },

  async changePassword(data: { currentPassword: string; newPassword: string }) {
    await http.post('/applicant-auth/change-password', data);
  },

  async getDashboard() {
    const res = await http.get<ApiResponse<ApplicantDashboard>>('/applicant/dashboard');
    return res.data.data;
  },

  async getProfile() {
    const res = await http.get<ApiResponse<ApplicantProfile>>('/applicant/profile');
    return res.data.data;
  },

  async updateProfile(data: UpdateApplicantProfileData) {
    const res = await http.patch<ApiResponse<ApplicantProfile>>('/applicant/profile', data);
    return res.data.data;
  },

  async getDocumentRequirements() {
    const res = await http.get<ApiResponse<ApplicantDocumentRequirement[]>>(
      '/applicant/document-requirements',
    );
    return res.data.data;
  },

  async uploadDocument(requirementId: string, file: File) {
    const form = new FormData();
    form.append('file', file);
    const res = await http.post<ApiResponse<{ id: string }>>(
      `/applicant/documents/upload?requirementId=${requirementId}`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return res.data.data;
  },
};
