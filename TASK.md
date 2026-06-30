# TASK.md

# Sprint 6.1 – Applicant Database & Domain

## Objective

Implement the Applicant domain models in Prisma according to the project documentation.

This sprint focuses only on the database layer.

No API or frontend changes.

---

## Read Before Starting

- CLAUDE.md
- docs/04_DOMAIN_MODEL.md
- docs/05_DATABASE_DESIGN.md
- docs/08_BACKEND_ARCHITECTURE.md

---

## Scope

### Applicant Models

Implement only the models required for Applicant management.

Expected models (verify against documentation):

- Applicant
- ApplicantAssignment
- ApplicantTimeline
- ApplicantNote
- ApplicantTag (if documented)

Create all relationships.

---

### Applicant Fields

Implement documented fields such as:

- UUID id
- organizationId
- applicantNumber
- firstName
- lastName
- email
- phone
- status
- currentStage
- assignedStaffId
- createdById
- createdAt
- updatedAt
- deletedAt

Do not invent fields. Follow the documentation.

---

### Relationships

Connect:

- Organization
- Staff (creator)
- Staff (assigned)
- Timeline
- Notes

Use proper foreign keys and indexes.

---

### Enums

Implement documented enums only, for example:

- ApplicantStatus
- WorkflowStage

Do not create extra enums unless specified.

---

### Migrations

Generate Prisma migration.

Verify migration applies successfully.

---

### Seed

Update seed data with:

- Sample applicants
- Assignments
- Timeline entries

Use realistic development data.

---

### Validation

Verify:

- Prisma schema validates
- Migration succeeds
- Prisma client generates
- Seed executes successfully

---

## Out of Scope

Do NOT implement:

- Controllers
- Services
- DTOs
- API endpoints
- React Query
- Frontend integration
- File uploads
- Workflow engine

Database only.
