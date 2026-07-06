'use client';

import { useQuery } from '@tanstack/react-query';

import { HttpError } from '@/lib/http';
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

export function useDashboardSummary() {
  return useQuery({
    queryKey: queryKeys.dashboard.analytics(),
    queryFn: () => dashboardService.getSummary(),
    staleTime: STALE_TIME_MS,
  });
}

export function useDashboardActivity() {
  return useQuery({
    queryKey: queryKeys.dashboard.activity(),
    queryFn: () => dashboardService.getActivity(),
    staleTime: STALE_TIME_MS,
  });
}

/**
 * Staff workload feed. Gated server-side by `dashboard.workload.view`; a 403 is
 * the expected response for non-manager staff, so we never retry it and the page
 * hides the widget when {@link isForbidden} is true (cosmetic — the backend is
 * the authority).
 */
export function useDashboardWorkload() {
  const query = useQuery({
    queryKey: queryKeys.dashboard.workload(),
    queryFn: () => dashboardService.getWorkload(),
    staleTime: STALE_TIME_MS,
    retry: (failureCount, error) => {
      if (error instanceof HttpError && error.status === 403) return false;
      return failureCount < 2;
    },
  });

  const isForbidden = query.error instanceof HttpError && query.error.status === 403;

  return { ...query, isForbidden };
}
