# Sprint 11.5 — Dashboard & Analytics

Project: Document Workflow Platform

Sprint: 11.5

Status: Ready for Implementation

---

# 1. Sprint Goal

Implement a centralized operational dashboard that provides real-time insights into the organization's workload, applicant pipeline, document completion, workflow progress, recent activities, and personal tasks.

The dashboard serves as the landing page after login and should aggregate information from existing modules without introducing duplicated business logic.

This sprint is read-only and introduces no workflow mutations.

---

# 2. Objectives

Implement:

• Dashboard module
• Dashboard summary API
• Recent activity widget
• My Tasks widget
• Applicant status overview
• Document completion overview
• Workflow distribution overview
• Staff workload overview
• Dashboard frontend
• Dashboard widgets
• Charts
• Loading states
• Error states
• Empty states

---

# 3. Architecture

Create a new DashboardModule.

DashboardModule is an aggregation layer.

DashboardService must not directly access Prisma repositories for business data.

Instead it should consume existing services.

ApplicantService

TaskService

WorkflowService

ActivityService

DocumentService

UserService

This prevents duplicated business logic.

---

# 4. Database Changes

None.

Dashboard reads existing data only.

No schema changes.

No migrations.

---

# 5. Backend Structure

dashboard/

    controllers/

        dashboard.controller.ts

    services/

        dashboard.service.ts

    dto/

        dashboard-summary.dto.ts

    dashboard.module.ts

No repositories should be created unless absolutely necessary for lightweight aggregate queries that cannot reasonably belong to existing modules.

---

# 6. API Endpoints

GET /dashboard/summary

Returns

• KPI cards
• Applicant summary
• Document summary
• Workflow summary

Permission

dashboard.view

---

GET /dashboard/activity

Returns

Recent activity feed

Permission

dashboard.view

---

GET /dashboard/my-tasks

Returns

Assigned tasks

Permission

dashboard.view

---

GET /dashboard/workload

Returns

Staff workload

Permission

dashboard.workload.view

Manager/Admin only.

---

# 7. Dashboard Summary

Return

totalApplicants

activeApplicants

completedApplicants

pendingDocuments

completedDocuments

activeWorkflows

completedWorkflows

overdueTasks

dueTodayTasks

dueThisWeekTasks

totalStaff

---

# 8. Applicant Status Widget

Return counts grouped by workflow stage.

Example

Inquiry

Registered

Documents Pending

Ready For Submission

Submitted

Approved

Completed

Stage names must come from the workflow system.

Do not hardcode stage names.

---

# 9. Document Completion Widget

Return

Fully Complete

Incomplete

Average Completion %

Awaiting Upload

Missing Documents

---

# 10. Workflow Widget

Return

Applicants grouped by current workflow stage.

Frontend displays:

Bar Chart

Pie Chart

Future widgets can reuse this endpoint.

---

# 11. Recent Activity Widget

Reuse Activity module.

Return latest 20 activities.

Newest first.

Include

Activity Type

Title

Description

Timestamp

Actor

Target

No pagination.

---

# 12. My Tasks Widget

Reuse Task module.

Return

Assigned Tasks

Due Date

Priority

Status

Sort

Overdue

Due Today

Due Soon

Maximum 20.

---

# 13. Staff Workload Widget

Visible only to

Managers

Administrators

Return

Staff Name

Assigned Applicants

Open Tasks

Completed Tasks

Overdue Tasks

Current Workload %

---

# 14. RBAC

dashboard.view

dashboard.workload.view

Organization isolation required.

Regular staff cannot access workload endpoint.

---

# 15. Audit

Dashboard views are read-only.

No audit events.

No activity events.

---

# 16. Notifications

None.

Dashboard consumes existing information only.

---

# 17. Frontend

Create

features/dashboard/

components/

hooks/

types/

services/

Widgets

DashboardHeader

KPICards

ApplicantStatusChart

WorkflowChart

DocumentCompletionCard

ActivityFeed

MyTasksWidget

StaffWorkloadTable

DashboardSkeleton

DashboardError

DashboardEmpty

---

# 18. Dashboard Page

Dashboard becomes

app/(dashboard)/page.tsx

Layout

---

Header

---

KPI Cards

---

Applicant Status

Workflow Distribution

---

Document Completion

My Tasks

---

Recent Activity

---

Staff Workload (RBAC)

---

Responsive

Desktop

2–4 column layout

Tablet

2 columns

Mobile

Single column

---

# 19. Charts

Use the existing chart library already adopted by the frontend.

Charts required

Applicant Status

Workflow Distribution

No custom visualization library.

---

# 20. Error Handling

Return standardized API responses.

Gracefully handle

No applicants

No tasks

No activities

No workflows

Frontend must show empty states.

---

# 21. Security

Authenticated users only.

Organization-scoped queries.

RBAC enforced.

No cross-organization aggregation.

No sensitive information exposed.

---

# 22. Performance

Dashboard should complete within acceptable response times under normal organization sizes.

Aggregate queries should avoid N+1 issues.

Use parallel service calls where appropriate.

Do not introduce caching during MVP.

---

# 23. Testing

Backend

Controller tests

Service tests

RBAC tests

Summary calculation tests

Workload tests

Frontend

Component rendering

Loading state

Empty state

Error state

Hook tests

---

# 24. Acceptance Criteria

✓ Dashboard is landing page

✓ KPI cards visible

✓ Activity feed visible

✓ My Tasks visible

✓ Applicant summary visible

✓ Workflow chart visible

✓ Document completion visible

✓ Staff workload visible for managers only

✓ Organization isolation enforced

✓ Responsive layout

✓ Tests passing

✓ No duplicated business logic

✓ No Prisma business queries inside DashboardService

✓ Production-ready
