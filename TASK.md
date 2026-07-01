# TASK.md

## Current Sprint

Sprint 7.1 – Document Domain (Database & Backend API)

---

## Objective

Implement the complete Document domain at the backend layer.

This sprint covers only:

- Prisma models
- Migration
- Seed
- Repository
- Service
- Controller
- DTOs
- Tests

No frontend changes.

No file upload yet.

---

## Scope

### Database

Create the Document domain.

Models

- Document
- DocumentCategory (enum)
- DocumentStatus (enum)

Relationships

Organization
└── Documents

Applicant
└── Documents

Staff
└── Uploaded Documents

---

### Document fields

- id
- organizationId
- applicantId
- uploadedBy
- category
- status
- originalFilename
- storedFilename
- mimeType
- fileSize
- storageKey
- checksum (optional)
- expiresAt (optional)
- verifiedAt (optional)
- verifiedBy (optional)
- verificationNotes (optional)
- createdAt
- updatedAt
- deletedAt
- createdBy
- updatedBy
- deletedBy

---

### Repository

Implement

- findById
- list
- create
- update
- softDelete

---

### Service

Implement

- list
- getById
- create
- update
- archive

Business rules

- Organization isolation
- Soft delete
- Audit logging

---

### Controller

Endpoints

GET /documents

GET /documents/:id

POST /documents

PATCH /documents/:id

DELETE /documents/:id

RBAC

document.view

document.create

document.update

document.archive

---

### DTOs

Create

CreateDocumentDto

UpdateDocumentDto

DocumentResponseDto

DocumentQueryDto

---

### Tests

Repository tests

Service tests

Controller tests

---

## Out of Scope

No Multer

No uploads

No S3

No local storage

No frontend

No React Query

No HTML changes

---

## Validation

- prisma validate
- prisma generate
- migration succeeds
- seed succeeds
- lint passes
- type-check passes
- build passes
- tests pass

---

## Definition of Done

Document backend is production ready.

Upload functionality begins in Sprint 7.2.
