'use client';

import { useInfiniteQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-keys';
import { type ActivityPage, activityService } from '@/services/activity.service';

const PAGE_SIZE = 20;

/**
 * Paginated applicant activity log (newest first). Uses an infinite query so
 * the UI can append pages via a "Load more" control without refetching prior
 * pages.
 */
export function useActivity(applicantId: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.activity.byApplicant(applicantId),
    queryFn: ({ pageParam }) =>
      activityService.list(applicantId, { page: pageParam, pageSize: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: ActivityPage) => {
      const { page, totalPages } = lastPage.meta;
      return page < totalPages ? page + 1 : undefined;
    },
    enabled: Boolean(applicantId),
  });
}
