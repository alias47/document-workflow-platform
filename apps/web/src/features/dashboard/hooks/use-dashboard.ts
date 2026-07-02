'use client';

import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-keys';
import { dashboardService } from '@/services/dashboard.service';

const STALE_TIME_MS = 60_000;

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard.summary(),
    queryFn: () => dashboardService.getDashboard(),
    staleTime: STALE_TIME_MS,
  });
}
