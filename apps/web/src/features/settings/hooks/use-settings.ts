'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { UpdateSettingsData } from '../types';

import { queryKeys } from '@/lib/query-keys';
import { settingsService } from '@/services/settings.service';

export function useSettings() {
  return useQuery({
    queryKey: queryKeys.settings.detail(),
    queryFn: () => settingsService.getSettings(),
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateSettingsData) => settingsService.updateSettings(data),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.settings.detail(), updated);
    },
  });
}

export function useUploadLogo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => settingsService.uploadLogo(file),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.settings.detail(), updated);
    },
  });
}

export function useRemoveLogo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => settingsService.removeLogo(),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.settings.detail(), updated);
    },
  });
}
