'use client';

import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-keys';
import { type SearchParams, searchService } from '@/services/search.service';

const MIN_QUERY_LENGTH = 1;

/**
 * React Query hook for global search. Enabled only when the query string
 * meets the minimum length so typing a single character avoids a useless
 * full-table scan.
 */
export function useSearch(params: SearchParams) {
  const enabled = params.q.trim().length >= MIN_QUERY_LENGTH;

  return useQuery({
    queryKey: queryKeys.search.results(params as unknown as Record<string, unknown>),
    queryFn: () => searchService.search(params),
    enabled,
    staleTime: 30_000,
  });
}
