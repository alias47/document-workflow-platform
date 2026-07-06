# Sprint 11.3 — Applicant Invitation & Portal Activation

**Sprint Goal**

Complete the applicant onboarding lifecycle by allowing staff to invite applicants to the portal, applicants to activate their accounts securely, and the system to manage the full invitation lifecycle.

---

# 11.3.1 Objectives

Implement a complete invitation system that:

- Creates portal accounts automatically when an applicant is invited.
- Sends secure invitation emails.
- Allows applicants to activate their account.
- Prevents duplicate or invalid activations.
- Integrates with the Notification System.
- Fully audits every action.
- Keeps the entire process organization isolated.

This completes the Applicant Portal MVP.

---

# 11.3.2 Database

Extend the existing PortalAccount architecture.

## PortalInvitation

Create a new model.

Fields:

- id
- organizationId
- applicantId
- portalAccountId
- tokenHash
- expiresAt
- acceptedAt
- revokedAt
- createdBy
- createdAt

Indexes

- organizationId
- applicantId
- expiresAt

Relations

- Organization
- Applicant
- PortalAccount
- Staff (createdBy)

---

# 11.3.3 Invitation Status

Status is derived.

Pending

- acceptedAt == null
- revokedAt == null
- expiresAt > now()

Accepted

- acceptedAt != null

Expired

- acceptedAt == null
- revokedAt == null
- expiresAt < now()

Revoked

- revokedAt != null

Never store status.

---

# 11.3.4 Backend Module

Create

modules/applicant-invitation/

including

- repository
- service
- controller
- dto
- tests

---

# 11.3.5 Backend API

## Staff

GET /applicants/:id/invitation

Returns

- invitation status
- expiresAt
- acceptedAt
- invitedBy
- createdAt

---

POST /applicants/:id/invitation

Creates

- PortalAccount (if none exists)
- PortalInvitation
- secure token
- hashed token
- notification email

Returns success only.

---

POST /applicants/:id/invitation/resend

Business rules

- old invitation revoked
- new invitation created
- new email sent

---

POST /applicants/:id/invitation/revoke

Immediately invalidates invitation.

---

## Applicant

GET /applicant/activate

Query

token

Returns

- valid
- applicant name
- organization name

Never returns token information.

---

POST /applicant/activate

Body

- token
- password

Validates

- invitation exists
- not expired
- not revoked
- unused
- password policy

Creates password

Marks acceptedAt

Deletes every remaining active invitation

Deletes refresh tokens

Returns success.

---

# 11.3.6 Notification Integration

Reuse NotificationService.

Never send email directly.

Templates

Applicant Invitation

Variables

- applicantName
- organizationName
- activationLink

Invitation Resent

Same template.

---

# 11.3.7 Applicant Portal

Applicant cannot login until

acceptedAt exists
AND
password exists.

---

# 11.3.8 Staff Frontend

Applicant Profile

Add

Portal Account card.

Display

- Invitation Status
- Invited By
- Invitation Date
- Expiration
- Activated Date

Buttons

Send Invitation

Resend Invitation

Revoke Invitation

Copy Invitation Link

Buttons shown only when valid.

Dialogs

Send

Resend

Revoke

Loading

Error

Success

---

# 11.3.9 Applicant Frontend

Create

/applicant/activate

States

Loading

Invalid token

Expired token

Revoked invitation

Already activated

Password form

Activation successful

Password policy identical to staff.

Automatic redirect to login after activation.

---

# 11.3.10 Business Rules

One active invitation per applicant.

Invitation lifetime

7 days.

Resend

creates a completely new token.

Old token immediately invalid.

Tokens stored hashed.

Secure random tokens only.

One-time use.

Applicant email cannot be changed during activation.

Applicant already activated cannot receive activation invitation.

PortalAccount created once only.

Every operation organization scoped.

---

# 11.3.11 Audit

Audit every action.

Examples

invitation.created

invitation.resent

invitation.revoked

invitation.accepted

---

# 11.3.12 Activity

Record applicant activities

Portal Invitation Sent

Portal Invitation Accepted

---

# 11.3.13 Security

Never expose hashed tokens.

Never expose applicant existence from activation endpoint.

Prevent replay attacks.

Validate expiration.

Constant-time hash comparison.

Invalidate refresh sessions after activation.

---

# 11.3.14 Tests

Repository

Service

Controller

Invitation lifecycle

Activation

Expiration

Revocation

Duplicate invite prevention

Duplicate activation prevention

Notification integration

Audit logging

Activity logging

Organization isolation

Security

---

# 11.3.15 Validation

Must pass

pnpm lint

pnpm type-check

pnpm build

pnpm test

---

# 11.3.16 Completion Report

When the sprint is complete, include:

1. Sprint Completion Report
2. Files Created
3. Files Modified
4. Database Changes
5. API Endpoints
6. Frontend Components
7. Business Rules Implemented
8. Notification Templates Added
9. Audit & Activity Events Added
10. Tests Added
11. Validation Results
12. Documentation Inconsistencies
13. TASK.md Completion Confirmation

Do not commit any code.
