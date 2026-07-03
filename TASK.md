# Sprint 10.3 — Applicant Portal (MVP)

---

# 1. Objective

Build the complete Applicant Portal for the MVP.

Applicants must be able to securely log into the system and manage only their own information.

The applicant portal must be completely isolated from the staff portal.

Applicants must never have access to staff functionality.

---

# 2. Scope

This sprint includes:

- Applicant authentication
- Applicant dashboard
- Applicant profile
- Applicant document requirements
- Applicant document upload
- Applicant document status tracking
- Applicant password change
- Applicant logout

This sprint does NOT include:

- Notifications
- Email
- Chat
- Notes
- Activity Log
- Workflow management
- Staff management
- Organization settings

---

# 3. Backend

## 3.1 Applicant Authentication

Implement applicant authentication independent from staff authentication.

Endpoints

POST /applicant-auth/login

POST /applicant-auth/logout

GET /applicant-auth/me

POST /applicant-auth/change-password

Requirements

- HttpOnly cookie authentication
- Same JWT strategy used by staff
- Separate ApplicantAuthModule
- ApplicantJwtGuard
- Applicant permissions are not RBAC based
- Applicant only accesses their own data

---

## 3.2 Applicant Dashboard Endpoint

Create

GET /applicant/dashboard

Return

- applicant profile summary
- assigned consultant
- current workflow stage
- required document count
- uploaded document count
- approved document count
- pending document count
- rejected document count

---

## 3.3 Applicant Profile

GET /applicant/profile

PATCH /applicant/profile

Editable fields

- phone
- address
- emergency contact
- profile image

Non editable

- name
- email
- organization
- consultant
- workflow

---

## 3.4 Applicant Documents

Applicant can retrieve only their own requirements.

GET

/applicant/document-requirements

Return

- requirement
- status
- uploaded document
- rejection reason
- completedAt

---

## 3.5 Applicant Upload

POST

/applicant/documents/upload

Rules

Applicant may upload only

- their own requirement

Applicant cannot upload

- for another applicant
- archived requirement
- approved requirement

Upload automatically updates

Pending

↓

Uploaded

---

## 3.6 Password Change

POST

/applicant-auth/change-password

Validation

Current password required

New password confirmation required

Minimum password policy follows existing auth module

---

## 3.7 Logout

Clear cookies.

---

# 4. Frontend

Create

features/applicant-portal/

Structure

services/

hooks/

components/

types/

pages/

---

# 5. Applicant Login

Create

/applicant/login

Features

Email

Password

Remember me

Forgot password placeholder

Validation

Loading

Error state

Redirect when authenticated

---

# 6. Applicant Dashboard

Create

/applicant

Dashboard cards

Required Documents

Uploaded

Approved

Rejected

Pending

Current Workflow Stage

Assigned Consultant

Recent required documents

---

# 7. Applicant Profile

Create

/applicant/profile

Editable

Phone

Address

Emergency Contact

Profile image

Read only

Name

Email

Organization

Assigned Consultant

Workflow Stage

---

# 8. Applicant Documents

Create

/applicant/documents

Show

Requirement

Required badge

Status badge

Upload button

Uploaded filename

Upload date

Approval status

Rejection reason

Completed date

Sorting

Pending first

Uploaded

Rejected

Approved

---

# 9. Upload Dialog

Upload directly against a requirement.

No free-form uploads.

Validation

Allowed file types

Maximum size

Drag & drop

Browse

Progress indicator

Success

Failure

---

# 10. Shared Components

Create

ApplicantDashboardCards

ApplicantDocumentCard

ApplicantDocumentList

ApplicantProfileCard

ApplicantUploadDialog

ApplicantSidebar

ApplicantHeader

ApplicantEmptyState

ApplicantSkeleton

ApplicantError

---

# 11. Business Rules

Applicant only accesses own data.

Applicant never supplies applicantId.

Backend derives applicant from JWT.

Applicant cannot approve documents.

Applicant cannot reject documents.

Applicant cannot modify requirements.

Applicant cannot edit workflow.

Applicant cannot view notes.

Applicant cannot view activity.

Applicant cannot upload to completed requirements.

Applicant cannot upload archived requirements.

Organization isolation enforced.

---

# 12. Security

Separate ApplicantJwtGuard.

Separate applicant authentication cookies.

Server validates ownership.

No IDOR vulnerabilities.

No organization leakage.

All uploads ownership validated.

---

# 13. Tests

Backend

Repository

Service

Controller

Authentication

Ownership validation

Upload validation

Frontend

Skip if no frontend testing framework exists.

Document the limitation.

---

# 14. Validation

Must pass

pnpm lint

pnpm type-check

pnpm build

pnpm test

No warnings.

No failing tests.

---

# 15. Documentation Inconsistencies

Document every inconsistency discovered.

Do not silently change existing behavior.

---

# 16. TASK Completion

At completion provide

Sprint Completion Report

Files Created

Files Modified

Endpoints

Business Rules

Validation

Documentation Inconsistencies

TASK.md Completion Confirmation

Do not commit.
