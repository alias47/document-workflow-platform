# TASK.md

# Sprint 6.3 – Applicant Frontend Integration

## Objective

Replace the Applicant mock data with live backend integration.

This sprint connects the completed frontend UI to the Applicant API.

---

## Read Before Starting

- CLAUDE.md
- docs/06_API_SPECIFICATION.md
- docs/07_FRONTEND_ARCHITECTURE.md
- docs/12_UI_UX_GUIDELINES.md
- docs/13_COMPONENT_LIBRARY.md

---

## Scope

### Services

Create an ApplicantService responsible for all HTTP communication.

Implement:

- getApplicants()
- getApplicant()
- createApplicant()
- updateApplicant()
- archiveApplicant()

No Axios calls directly inside React components.

---

### React Query

Implement query hooks.

Required hooks:

- useApplicants
- useApplicant
- useCreateApplicant
- useUpdateApplicant
- useArchiveApplicant

Handle cache invalidation correctly.

---

### Replace Mock Data

Remove all applicant mock usage.

Replace with API data.

No component should import mock applicants anymore.

---

### Applicant List

Connect:

- Search
- Filters
- Pagination
- Sorting

Use backend query parameters.

---

### Applicant Profile

Connect:

- Header
- Details
- Timeline placeholder
- Workflow placeholder
- Documents placeholder

Only Applicant data is live.

---

### UI States

Implement:

- Loading
- Empty
- Error
- Retry

Every page must handle all four states.

---

### Error Handling

Display friendly messages.

Do not expose raw API errors.

---

### Validation

Verify:

- pnpm lint
- pnpm type-check
- pnpm build

---

## Out of Scope

Do NOT implement:

- Documents
- Workflow engine
- Notifications
- Notes
- Timeline backend
- File uploads
