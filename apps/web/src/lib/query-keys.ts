/**
 * Centralized TanStack Query keys.
 *
 * Every query/mutation key in the app is derived from this factory — never
 * hardcode an array key at a call site. Hierarchical keys make targeted cache
 * invalidation simple (e.g. invalidate `queryKeys.applicants.lists()` after a
 * create without touching individual detail entries).
 */

export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    me: () => [...queryKeys.auth.all, 'me'] as const,
  },

  applicants: {
    all: ['applicants'] as const,
    lists: () => [...queryKeys.applicants.all, 'list'] as const,
    list: (params: Record<string, unknown>) => [...queryKeys.applicants.lists(), params] as const,
    details: () => [...queryKeys.applicants.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.applicants.details(), id] as const,
  },

  documents: {
    all: ['documents'] as const,
    lists: () => [...queryKeys.documents.all, 'list'] as const,
    list: (params: Record<string, unknown>) => [...queryKeys.documents.lists(), params] as const,
    details: () => [...queryKeys.documents.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.documents.details(), id] as const,
  },

  workflow: {
    all: ['workflow'] as const,
    lists: () => [...queryKeys.workflow.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.workflow.all, 'detail', id] as const,
  },

  notifications: {
    all: ['notifications'] as const,
    lists: () => [...queryKeys.notifications.all, 'list'] as const,
  },

  search: {
    all: ['search'] as const,
    results: (params: Record<string, unknown>) => [...queryKeys.search.all, params] as const,
  },

  notes: {
    all: ['notes'] as const,
    byApplicant: (applicantId: string) =>
      [...queryKeys.notes.all, 'applicant', applicantId] as const,
  },

  dashboard: {
    all: ['dashboard'] as const,
    summary: () => [...queryKeys.dashboard.all, 'summary'] as const,
  },
} as const;
