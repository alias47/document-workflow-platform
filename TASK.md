# Sprint 9.2 — Dashboard Frontend Integration

## Objective

Replace the existing static/mock dashboard with a fully functional dashboard connected to the Dashboard Backend implemented in Sprint 9.1.

Do not modify any backend code unless required to fix a genuine integration bug.

---

# 1. Service Layer

Create:

apps/web/src/services/dashboard.service.ts

Implement:

- getDashboard()

GET /dashboard

Return typed response matching backend.

Use the shared HTTP client.

No direct axios usage.

---

# 2. Types

Create:

apps/web/src/features/dashboard/types/dashboard.types.ts

Include:

DashboardSummary

RecentApplicant

RecentActivity

ApplicantSummary

DocumentSummary

DashboardResponse

Match backend exactly.

---

# 3. React Query

Create:

apps/web/src/features/dashboard/hooks/use-dashboard.ts

Requirements:

- useDashboard()

Query Key:

dashboard.summary()

Stale Time:

60 seconds

Retry:

Default project behavior

---

# 4. Query Keys

Update:

apps/web/src/lib/query-keys.ts

Add:

dashboard.summary()

---

# 5. Dashboard Components

Replace every mock dashboard component.

Create or update:

DashboardSummaryCards.tsx

RecentApplicants.tsx

RecentActivities.tsx

ApplicantStatusChart.tsx

DocumentStatusChart.tsx

DashboardSkeleton.tsx

DashboardError.tsx

DashboardEmpty.tsx

Use existing UI styling.

Do not redesign.

---

# 6. Summary Cards

Display:

Total Applicants

Active Applicants

Archived Applicants

Total Documents

Pending Documents

Verified Documents

Rejected Documents

Values must come from API.

No hardcoded numbers.

---

# 7. Recent Applicants

Display:

Applicant name

Email

Country

Current status

Created date

Maximum:

10 applicants

Clicking a row opens applicant profile.

Newest first.

---

# 8. Recent Activities

Display:

Activity icon

Activity title

Description

Actor

Timestamp

Maximum:

15 activities

Newest first.

---

# 9. Applicant Summary

Display:

Active

Archived

Visualize using the existing chart component if available.

Otherwise create a simple chart.

No external chart libraries.

---

# 10. Document Summary

Display:

Pending

Verified

Rejected

Expired

Use existing chart style.

---

# 11. Dashboard Page

Replace mock implementation.

Use:

useDashboard()

Loading

Error

Empty

Success

states.

---

# 12. Loading State

Show:

DashboardSkeleton

No layout shift.

---

# 13. Error State

Show:

DashboardError

Retry button must refetch query.

---

# 14. Empty State

Show DashboardEmpty if:

No applicants

AND

No documents

---

# 15. Business Rules

Dashboard is read-only.

Never mutate data.

Never poll automatically.

Use React Query caching only.

---

# 16. API Contract

Consume:

GET /dashboard

Do not transform backend field names.

Frontend types must match backend DTOs exactly.

---

# 17. Tests

Add tests for:

dashboard.service

useDashboard

Summary cards rendering

Recent applicants

Recent activities

Loading state

Error state

Empty state

Success state

---

# 18. Validation

Must pass:

pnpm lint

pnpm type-check

pnpm build

Dashboard loads using real backend.

No mock data remains.

---

# 19. Completion Report

Provide:

1. Sprint Completion Report

2. Files Created

3. Files Modified

4. Components Created

5. Hooks Created

6. Services Created

7. Business Rules Implemented

8. Tests Added

9. Validation Results

10. Documentation Inconsistencies

11. TASK.md Completion Confirmation

Do not commit any code.
