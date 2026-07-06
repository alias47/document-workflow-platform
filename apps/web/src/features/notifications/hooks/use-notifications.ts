'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { NotificationListParams } from '../types';

import { queryKeys } from '@/lib/query-keys';
import { notificationService } from '@/services/notification.service';

export function useNotifications(params: NotificationListParams = {}) {
  return useQuery({
    queryKey: queryKeys.notifications.list(params as Record<string, unknown>),
    queryFn: () => notificationService.list(params),
  });
}

export function useNotification(id: string) {
  return useQuery({
    queryKey: queryKeys.notifications.detail(id),
    queryFn: () => notificationService.getById(id),
    enabled: Boolean(id),
  });
}

export function useRetryNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.retry(id),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.notifications.detail(updated.id), updated);
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.lists() });
    },
  });
}
