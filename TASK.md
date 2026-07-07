# Sprint 12.2 — Authorization & RBAC Hardening

**Project:** Document Workflow Platform

**Sprint:** 12.2

**Status:** Ready for Implementation

---

# 1. Sprint Goal

Strengthen the authorization system by resolving all critical RBAC inconsistencies identified during the Authentication & Authorization Audit.

This sprint focuses on ensuring every protected resource is correctly secured, every permission is valid, and backend and frontend authorization remain consistent.

No new business features should be introduced.

---

# 2. Objectives

Implement:

- Complete authorization audit
- Endpoint permission verification
- RBAC consistency improvements
- Permission seed validation
- Frontend route protection improvements
- Navigation authorization consistency
- Authorization regression tests

---

# 3. Scope

This sprint applies to:

- RBAC
- Permission Guards
- Role Guards
- Controller authorization
- Route protection
- Middleware
- Navigation authorization
- Permission seeds

This sprint does **not** include:

- New roles
- Super Admin implementation
- Manager implementation
- Sidebar redesign
- Dashboard redesign
- New UI
- New business features

---

# 4. Authorization Audit

Review every controller in the backend.

For every endpoint verify:

- Authentication Guard
- Permission Guard
- Role Guard (if applicable)
- Public decorator usage
- Organization isolation
- Ownership validation (where required)

Every protected endpoint must explicitly define its authorization requirements.

No endpoint should rely on implicit access.

---

# 5. Permission Audit

Review every permission used throughout the project.

Verify:

- Permission exists in seed data
- Permission is assigned to the correct roles
- Permission naming follows project conventions
- Permission is not duplicated
- Permission is actually used

Examples include but are not limited to:

- dashboard.view
- dashboard.workload.view
- report.view
- report.export
- applicant.view
- applicant.create
- applicant.update
- applicant.delete
- document.*
- workflow.*
- notification.*
- settings.*
- search.*
- audit.*

Document any orphaned permissions or missing permissions.

---

# 6. Role Consistency

Review every role reference in the backend.

Verify:

- Every referenced role actually exists
- No unreachable role decorators remain
- Role checks are consistent
- Permission checks remain the primary authorization mechanism

If invalid role references are discovered, replace them with the appropriate permission-based authorization while preserving existing business behavior.

Do not introduce new roles during this sprint.

---

# 7. Invitation Authorization

Review every invitation endpoint.

Including:

Staff Invitations

- Send Invitation
- Resend Invitation
- Revoke Invitation

Applicant Invitations

- Send Invitation
- Resend Invitation
- Revoke Invitation

Verify only authorized users may perform these actions.

Unauthorized authenticated users must receive HTTP 403.

---

# 8. Settings Authorization

Review every Settings endpoint.

Verify:

- Read permissions
- Update permissions
- Notification settings
- Document requirement settings
- Organization settings

Ensure settings cannot become unreachable because of invalid role decorators.

Use permission-based authorization where appropriate.

---

# 9. Reports Authorization

Review every reporting endpoint.

Verify:

- report.view
- report.export

Ensure:

- Permissions exist
- Permissions are seeded
- Permissions are assigned
- Authorized users can successfully access reports
- Unauthorized users receive HTTP 403

---

# 10. Dashboard Authorization

Review dashboard permissions.

Verify:

- dashboard.view
- dashboard.workload.view

Ensure workload endpoints remain restricted while general dashboard access functions correctly.

---

# 11. Frontend Route Protection

Review frontend route protection.

Verify:

Protected Staff Routes

- /dashboard
- /applicants
- /staff
- /workflow
