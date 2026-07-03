import type { SystemSettings, UpdateSettingsData } from '@/features/settings/types';
import type { ApiResponse } from '@/types/api';

import { http } from '@/lib/http';

export const settingsService = {
  async getSettings(): Promise<SystemSettings> {
    const res = await http.get<ApiResponse<SystemSettings>>('/settings');
    return res.data.data;
  },

  async updateSettings(data: UpdateSettingsData): Promise<SystemSettings> {
    const res = await http.patch<ApiResponse<SystemSettings>>('/settings', data);
    return res.data.data;
  },

  async uploadLogo(file: File): Promise<SystemSettings> {
    const form = new FormData();
    form.append('logo', file);
    const res = await http.patch<ApiResponse<SystemSettings>>('/settings/logo', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  async removeLogo(): Promise<SystemSettings> {
    const res = await http.delete<ApiResponse<SystemSettings>>('/settings/logo');
    return res.data.data;
  },
};
