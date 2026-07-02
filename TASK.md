# Sprint 10.1 — Staff Management

## Objective

Implement a complete Staff Management module that allows Organization Super Admins to manage organization staff members.

Staff are internal users of the organization.

Every staff member belongs to exactly one organization.

Applicants are assigned to staff members.

The existing authentication and RBAC system must be reused.

Do not create a separate "Super Admin" entity.
Super Admin is a Staff member with the appropriate Role.

---

# 1. Database Review

Review the existing Staff, Role and Permission models.

Reuse existing models whenever possible.

Only create migrations if absolutely required.

If fields are missing, extend the existing Staff model.

Required fields:

- id
- organizationId
- firstName
- lastName
- email
- phone
- avatarUrl (nullable)
- roleId
- isActive
- lastLoginAt (nullable)
- createdAt
- updatedAt
- deletedAt

Applicants must continue referencing assignedStaffId.

Do not break existing relations.

---

# 2. Backend

Create StaffModule if one does not already exist.

Implement:

Repository

Service

Controller

DTOs

Tests

---

# 3. Endpoints

GET /staff

GET /staff/:id

POST /staff

PATCH /staff/:id

PATCH /staff/:id/status

DELETE /staff/:id

GET /staff/:id/applicants

---

# 4. Business Rules

Organization scoped.

Soft delete only.

Email unique within organization.

Cannot delete yourself.

Cannot deactivate yourself.

Cannot delete the last active Super Admin.

Cannot deactivate the last active Super Admin.

Inactive staff cannot login.

Archived staff remain in historical data.

Applicant assignments remain intact.

---

# 5. Applicant Assignment

When creating staff:

No applicants assigned.

When editing:

Allow reassignment.

Provide endpoint:

PATCH /staff/:id/applicants

Accept:

list of applicant IDs.

Update assignments atomically.

Record activity.

---

# 6. Roles

Reuse existing Role system.

Display available roles.

Allow changing role.

Prevent privilege escalation.

Only Super Admin can assign Super Admin.

---

# 7. Search

Support:

name

email

role

status

Sorting:

name

createdAt

lastLoginAt

Pagination required.

---

# 8. Activity Log

Automatically record:

staff.created

staff.updated

staff.deactivated

staff.activated

staff.deleted

staff.role_changed

staff.applicants_reassigned

---

# 9. Dashboard Integration

Dashboard counts should continue working.

No hardcoded values.

---

# 10. Frontend

Create:

features/staff/

Structure:

components/

hooks/

types/

services/

pages/

---

# 11. Staff List

Display:

Avatar

Full name

Email

Phone

Role

Status

Assigned Applicant Count

Last Login

Actions

Search

Pagination

Sorting

Status filter

Role filter

---

# 12. Staff Details

Display:

Profile

Role

Assigned Applicants

Activity Summary

Created Date

Last Login

---

# 13. Create Staff

Fields:

First Name

Last Name

Email

Phone

Role

Password

Confirm Password

Active Status

Validation:

Required

Email

Password rules

Duplicate email

---

# 14. Edit Staff

Editable:

Name

Phone

Avatar

Role

Status

Password reset (optional)

Cannot edit immutable fields.

---

# 15. Applicant Assignment UI

View assigned applicants.

Search applicants.

Assign.

Remove.

Bulk assignment.

Bulk removal.

Confirmation before reassignment.

---

# 16. Delete

Confirmation dialog.

Explain soft delete.

Prevent deleting protected accounts.

---

# 17. Loading States

Skeleton

Buttons

Dialogs

Tables

---

# 18. Empty States

No staff

No applicants

No search results

---

# 19. Error States

Permission denied

Duplicate email

Cannot delete last Super Admin

Network failure

Validation errors

---

# 20. Permissions

Reuse existing RBAC.

Only Super Admin may:

Create staff

Delete staff

Deactivate staff

Assign Super Admin role

Assign applicants

Staff may:

View own profile.

View assigned applicants.

No privilege escalation.

---

# 21. Tests

Repository

Service

Controller

Permission

Assignment

Validation

Frontend hooks

Frontend components

If frontend test infrastructure does not exist, document it instead of introducing one.

---

# 22. Validation

Must pass:

pnpm lint

pnpm type-check

pnpm build

Backend tests.

---

# 23. Completion Report

Provide:

1. Sprint Completion Report

2. Files Created

3. Files Modified

4. Database Changes

5. Backend Endpoints

6. Frontend Components

7. Business Rules

8. Activity Types Added

9. Tests Added

10. Validation Results

11. Documentation Inconsistencies

12. TASK.md Completion Confirmation

Do not commit code.
