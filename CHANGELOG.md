# CHANGELOG

## Phase 0 – Foundation Fixes (v0.5.1)

### Fixed

- Auth migrated to HttpOnly cookies — JWT strategy reads `access_token` cookie; login/refresh/logout set/clear cookies server-side; no tokens in response body or localStorage
- `auth.controller.spec.ts` updated to match cookie-based controller signatures
- `auth-provider.tsx` bootstraps from `/auth/me` instead of sessionStorage
- `applicant.delete` permission renamed to `applicant.archive` in seed (matches controller)
- `exactOptionalPropertyTypes` build error in applicant.service.ts mock (optional fields use conditional spreads)
- Import order lint errors auto-fixed across auth module files

---

## Sprint 6.3

### Added

- Applicant React Query hooks
- End-to-end Applicant API integration
- Server-side search
- Server-side pagination
- Server-side filtering
- URL-synchronized table state
- Loading skeletons
- Empty state handling
- Error state handling

### Notes

- Applicant mock data still active behind `env.isDev` gate; backend API integration scaffolded but not yet end-to-end verified

### Improved

- Query cache invalidation
- Applicant profile loading
- Browser refresh state persistence
