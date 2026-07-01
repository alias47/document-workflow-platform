# TASK.md

## Current Sprint

Sprint 6.4 – Applicant CRUD UI

## Objective

Complete the Applicant module by implementing the remaining frontend CRUD functionality and connecting it to the existing backend APIs.

## Scope

### Create Applicant

- Build `/applicants/new`
- Reusable ApplicantForm component
- React Hook Form
- Client-side validation
- Connect to POST /applicants
- Success redirect
- Error handling

### Edit Applicant

- Build `/applicants/[id]/edit`
- Load applicant from backend
- Reuse ApplicantForm
- Connect to PATCH /applicants/:id
- Success redirect
- Error handling

### Archive Applicant

- Confirmation dialog
- Connect to DELETE /applicants/:id
- Refresh React Query cache
- Redirect back to Applicants list

### UX

- Loading states
- Disabled buttons while submitting
- Success & error toasts
- Unsaved changes warning
- Empty/error states where applicable

### Validation

- Match backend DTO validation
- Required fields
- Email validation
- Date validation
- Maximum lengths

### Quality Requirements

- No mock data added
- No backend modifications
- No Prisma changes
- No design changes
- Reuse existing components
- Keep architecture consistent

## Definition of Done

- Applicant Create works
- Applicant Edit works
- Applicant Archive works
- Query cache invalidates correctly
- Navigation flows correctly
- Build succeeds
- Lint passes
- Type check passes
