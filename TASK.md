# Sprint 8.3 – Applicant Notes

## Goal

Implement an internal Notes system for applicants.

Notes allow consultants and staff to record private information about an applicant. Notes are never visible to applicants and are intended for internal collaboration.

This sprint includes both backend and frontend implementation.

---

# Database

Create ApplicantNote model.

Fields:

- id
- organizationId
- applicantId
- authorId
- content
- createdAt
- updatedAt
- deletedAt
- createdBy
- updatedBy
- deletedBy

Relationships

Organization

Applicant

Staff (author)

Soft delete.

Organization isolation.

---

# Backend

Create NotesModule.

Create

- NotesController
- NotesService
- NotesRepository

DTOs

- CreateApplicantNoteDto
- UpdateApplicantNoteDto
- ApplicantNoteResponseDto

Permissions

notes.view

notes.create

notes.update

notes.archive

---

# API

GET

/applicants/:id/notes

POST

/applicants/:id/notes

PATCH

/notes/:id

DELETE

/notes/:id

---

# Business Rules

Only staff members can access notes.

Applicants never see notes.

Notes belong to one applicant.

Soft delete.

Every create/update/delete generates an AuditLog entry.

---

# Frontend

Replace Timeline tab with Notes.

Create

services/note.service.ts

hooks/use-notes.ts

ApplicantNotes.tsx

CreateNoteDialog.tsx

EditNoteDialog.tsx

DeleteNoteDialog.tsx

Features

Reverse chronological order

Author

Created date

Updated indicator

Loading skeleton

Empty state

Error state

Retry button

Optimistic updates

Confirmation before delete

---

# Validation

Content required

Maximum 5000 characters

Trim whitespace

Reject empty notes

---

# Tests

Repository

Service

Controller

Frontend hooks

Validation

---

# Validation

Run

pnpm lint

pnpm type-check

pnpm build

All tests pass.

---

# Out of Scope

Mentions

Attachments

Rich text editor

Pin notes

Categories

Search inside notes

Version history
