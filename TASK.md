# Sprint 11.2 — Email & Notification System

## Goal

Implement a centralized notification system for both staff and applicants.

The MVP will support email notifications only. The architecture must allow additional notification channels (SMS, Push, WhatsApp, etc.) in future without changing business modules.

Business modules must never send emails directly. Every module communicates only with NotificationService.

---

# 11.2.1 Notification Architecture

Create

NotificationModule

NotificationService

NotificationRepository

NotificationController

EmailProvider interface

LocalEmailProvider implementation

Future providers (SMTP, SES, SendGrid, Mailgun) must only require replacing the provider binding.

---

# 11.2.2 Notification Templates

Create reusable notification templates.

Templates

- Staff Welcome
- Applicant Portal Invitation
- Applicant Password Reset
- Staff Password Reset
- Document Uploaded
- Document Approved
- Document Rejected
- New Document Requirement Assigned
- Applicant Assigned To Staff
- Applicant Workflow Stage Changed

Templates must support variable interpolation.

Example

{{applicantName}}

{{consultancyName}}

{{documentName}}

{{staffName}}

{{portalUrl}}

---

# 11.2.3 Email Queue

Implement asynchronous notification processing.

Requirements

Notification records are created immediately.

Email sending happens asynchronously.

Failed sends are retried.

Store

- queued
- processing
- sent
- failed

Record

- createdAt
- processedAt
- retryCount
- errorMessage

Business requests must never wait for email delivery.

---

# 11.2.4 Notification Triggers

Integrate NotificationService into existing modules.

Applicant

- Portal account created
- Password reset

Documents

- Approved
- Rejected
- New requirement assigned

Workflow

- Stage changed

Staff

- Staff account created

Settings

- Enable / disable outgoing email

---

# 11.2.5 Backend

Create

NotificationModule

Repository

Service

Controller

DTOs

Response DTOs

Queue service

Provider interface

---

# 11.2.6 API

GET /notifications

GET /notifications/:id

POST /notifications/:id/retry

Only Super Admin may access notification history.

---

# 11.2.7 Frontend

Create

features/notifications

services/notification.service.ts

hooks/use-notifications.ts

Components

- NotificationTable
- NotificationStatusBadge
- NotificationFilters
- NotificationDetailsDialog
- RetryNotificationDialog
- NotificationSkeleton
- NotificationError
- NotificationPageClient

Create

/settings/notifications

---

# 11.2.8 Business Rules

Business modules never send email directly.

Only NotificationService communicates with EmailProvider.

Email failures never fail business transactions.

Notification history is immutable.

Retry increments retryCount.

Maximum retry count = 5.

Organization isolation enforced.

Respect System Settings "Email Enabled".

---

# 11.2.9 Security

RBAC enforced.

No sensitive information stored in notification payloads.

Email addresses validated.

Prevent duplicate sends caused by retries.

Audit retry operations.

---

# 11.2.10 Tests

Repository

Service

Controller

Queue

Provider

Authorization

Retry logic

Failure handling

---

# 11.2.11 Quality Gates

pnpm lint

pnpm type-check

pnpm build

Backend tests

---

# 11.2.12 Sprint Completion Report

Provide:

1. Sprint Completion Report

2. Files Created

3. Files Modified

4. Database Changes

5. API Endpoints

6. Business Rules Implemented

7. Frontend Components

8. Tests Added

9. Validation Results

10. Documentation Inconsistencies

11. TASK.md Completion Confirmation

Do not commit any code.
