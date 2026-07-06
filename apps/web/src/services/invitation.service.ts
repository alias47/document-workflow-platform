import type { InvitationInfo, ValidateTokenResult } from '@/features/applicant-invitation/types';
import type { ApiResponse } from '@/types/api';

import { http } from '@/lib/http';

export const invitationService = {
  async getInvitation(applicantId: string): Promise<ApiResponse<InvitationInfo>> {
    const res = await http.get<ApiResponse<InvitationInfo>>(
      `/applicants/${applicantId}/invitation`,
    );
    return res.data;
  },

  async sendInvitation(applicantId: string): Promise<ApiResponse<null>> {
    const res = await http.post<ApiResponse<null>>(`/applicants/${applicantId}/invitation`, {});
    return res.data;
  },

  async resendInvitation(applicantId: string): Promise<ApiResponse<null>> {
    const res = await http.post<ApiResponse<null>>(
      `/applicants/${applicantId}/invitation/resend`,
      {},
    );
    return res.data;
  },

  async revokeInvitation(applicantId: string): Promise<ApiResponse<null>> {
    const res = await http.post<ApiResponse<null>>(
      `/applicants/${applicantId}/invitation/revoke`,
      {},
    );
    return res.data;
  },

  async validateToken(token: string): Promise<ApiResponse<ValidateTokenResult>> {
    const res = await http.get<ApiResponse<ValidateTokenResult>>(
      `/applicant/activate?token=${encodeURIComponent(token)}`,
    );
    return res.data;
  },

  async activateAccount(token: string, password: string): Promise<ApiResponse<null>> {
    const res = await http.post<ApiResponse<null>>('/applicant/activate', { token, password });
    return res.data;
  },
};
