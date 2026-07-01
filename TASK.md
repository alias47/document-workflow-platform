# Sprint 8.1 – Workflow Domain (Database & Backend)

## Goal

Introduce the Applicant Workflow domain.

This sprint establishes the workflow engine at the database and backend layers only.

No frontend changes.

---

## Scope

### Database

Create:

- WorkflowStage
- ApplicantWorkflow
- WorkflowHistory

WorkflowStage stores the master list of stages.

ApplicantWorkflow stores the applicant's current workflow state.

WorkflowHistory stores immutable transition history.

---

## Relationships

Organization
└── WorkflowStage[]

Applicant
├── ApplicantWorkflow (1:1)
└── WorkflowHistory[]

Staff
└── WorkflowHistory.changedBy

---

## WorkflowStage

Fields

- id
- organizationId
- name
- description
- color
- icon
- order
- isDefault
- isFinal

Audit fields

Soft delete

Indexes

---

## ApplicantWorkflow

Fields

- id
- organizationId
- applicantId
- currentStageId
- enteredStageAt
- expectedCompletionDate
- notes

Audit fields

Soft delete

One workflow per applicant.

---

## WorkflowHistory

Immutable log.

Fields

- id
- organizationId
- applicantId
- fromStageId
- toStageId
- changedBy
- changedAt
- comment

No updates.

Append only.

---

## Backend

Create

Workflow Module

Repository

Service

Controller

DTOs

---

## Endpoints

GET /workflow/stages

POST /workflow/stages

PATCH /workflow/stages/:id

DELETE /workflow/stages/:id

GET /workflow/:applicantId

PATCH /workflow/:applicantId

GET /workflow/:applicantId/history

---

## Business Rules

Every applicant has exactly one current workflow.

Changing stage must

- update ApplicantWorkflow
- insert WorkflowHistory
- create AuditLog

inside one transaction.

Default stage automatically assigned to newly created applicants.

Cannot move to deleted stages.

Cannot delete a stage currently used by applicants.

---

## Permissions

workflow.view

workflow.create

workflow.update

workflow.archive

---

## Seed

Create default workflow stages

1. New Inquiry
2. Documents Pending
3. Documents Verified
4. Offer Issued
5. Offer Accepted
6. Visa Processing
7. Visa Approved
8. Enrolled
9. Closed

Grant permissions to Admin.

Consultant receives

workflow.view

workflow.update

---

## Tests

Repository

Service

Controller

Transaction tests

Validation tests

---

## Validation

Run

pnpm lint

pnpm type-check

pnpm build

All tests must pass.

---

## Out of Scope

Kanban UI

Drag & Drop

Workflow dashboard

Analytics

Automation

Notifications
