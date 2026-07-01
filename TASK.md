# TASK.md

# Sprint 6.3 – Applicant End-to-End Integration

## Objective

Replace the applicant mock data with the real backend API.

This sprint delivers the first complete feature running from:

PostgreSQL
↓
Prisma
↓
Repository
↓
Service
↓
Controller
↓
HTTP
↓
TanStack Query
↓
React UI

---

## Read First

- CLAUDE.md
- docs/06_API_SPECIFICATION.md
- docs/07_FRONTEND_ARCHITECTURE.md

---

# Scope

## React Query Hooks

Create

src/features/applicants/hooks/

Implement:

useApplicants()

useApplicant()

useCreateApplicant()

useUpdateApplicant()

useArchiveApplicant()

Use the shared services created in Sprint 6.2.5.

Never call axios directly.

---

## Applicant List

Replace mock data.

Connect

GET /applicants

Implement:

- search
- pagination
- status filter
- assigned staff filter
- sorting

Everything should be server-driven.

---

## Applicant Profile

Replace

getApplicantById()

with

GET /applicants/:id

---

## Loading States

Use loading skeletons.

No layout shift.

---

## Empty States

When no applicants exist:

Show the designed empty state.

---

## Error States

Gracefully handle:

401

403

404

500

No browser crashes.

---

## Cache

Invalidate:

Applicants list

Applicant detail

after

Create

Update

Archive

---

## URL State

Keep

page

search

status

sort

inside URL search params.

Refreshing the page must preserve state.

---

## Remove Mock Data

Delete applicant mock usage from production code.

Keep mock files only if used for Storybook/testing.

---

## Validation

pnpm lint

pnpm type-check

pnpm build

Manual browser verification

---

# Out of Scope

Documents

Workflow

Notifications

Dashboard API

Authentication UI
