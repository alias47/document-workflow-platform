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
    list: (params: Record<string, unknown>) =>
      [...queryKeys.notifications.lists(), params] as const,
    details: () => [...queryKeys.notifications.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.notifications.details(), id] as const,
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

  activity: {
    all: ['activity'] as const,
    byApplicant: (applicantId: string) =>
      [...queryKeys.activity.all, 'applicant', applicantId] as const,
  },

  dashboard: {
    all: ['dashboard'] as const,
    summary: () => [...queryKeys.dashboard.all, 'summary'] as const,
  },

  documentRequirements: {
    all: ['document-requirements'] as const,
    lists: () => [...queryKeys.documentRequirements.all, 'list'] as const,
    list: (params: Record<string, unknown>) =>
      [...queryKeys.documentRequirements.lists(), params] as const,
    details: () => [...queryKeys.documentRequirements.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.documentRequirements.details(), id] as const,
    forApplicant: (applicantId: string) =>
      [...queryKeys.documentRequirements.all, 'applicant', applicantId] as const,
  },

  staff: {
    all: ['staff'] as const,
    lists: () => [...queryKeys.staff.all, 'list'] as const,
    list: (params: Record<string, unknown>) => [...queryKeys.staff.lists(), params] as const,
    details: () => [...queryKeys.staff.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.staff.details(), id] as const,
    applicants: (id: string) => [...queryKeys.staff.all, 'applicants', id] as const,
    roles: () => [...queryKeys.staff.all, 'roles'] as const,
  },

  applicantPortal: {
    all: ['applicant-portal'] as const,
    me: () => [...queryKeys.applicantPortal.all, 'me'] as const,
    dashboard: () => [...queryKeys.applicantPortal.all, 'dashboard'] as const,
    profile: () => [...queryKeys.applicantPortal.all, 'profile'] as const,
    documentRequirements: () =>
      [...queryKeys.applicantPortal.all, 'document-requirements'] as const,
  },

  settings: {
    all: ['settings'] as const,
    detail: () => [...queryKeys.settings.all, 'detail'] as const,
  },

  invitation: {
    all: ['invitation'] as const,
    byApplicant: (applicantId: string) =>
      [...queryKeys.invitation.all, 'applicant', applicantId] as const,
  },
} as const;
