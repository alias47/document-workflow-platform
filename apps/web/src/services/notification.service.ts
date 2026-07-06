import type { Notification, NotificationListParams } from '@/features/notifications/types';
import type { ApiResponse, PaginatedResponse } from '@/types/api';

import { http } from '@/lib/http';

export const notificationService = {
  async list(params: NotificationListParams = {}): Promise<PaginatedResponse<Notification>> {
    const res = await http.get<PaginatedResponse<Notification>>('/notifications', { params });
    return res.data;
  },

  async getById(id: string): Promise<Notification> {
    const res = await http.get<ApiResponse<Notification>>(`/notifications/${id}`);
    return res.data.data;
  },

  async retry(id: string): Promise<Notification> {
    const res = await http.post<ApiResponse<Notification>>(`/notifications/${id}/retry`, {});
    return res.data.data;
  },
};
