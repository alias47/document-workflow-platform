# 05_DATABASE_DESIGN.md

# Database Design

**Project:** Document Workflow Platform

**Version:** 1.0

**Status:** Draft

**Last Updated:** June 2026

---

# 1. Purpose

This document defines the database architecture for the Document Workflow Platform.

It describes the relational database design, entity relationships, constraints, indexing strategy, naming conventions, and implementation guidelines.

This document serves as the primary reference for:

- PostgreSQL database implementation
- Prisma ORM schema
- Backend development
- API development
- Future database migrations

The database design follows PostgreSQL best practices and is independent of any ORM implementation.

---

# 2. Database Goals

The database is designed to achieve the following objectives.

## Simplicity

The schema should remain easy to understand and maintain.

Tables should represent business entities.

Business logic should remain inside the application layer.

---

## Performance

The database should support fast querying through proper normalization and indexing.

Frequently accessed data should be optimized for read performance.

---

## Scalability

Although the MVP supports a single organization, the schema is designed for future multi-tenant SaaS deployment.

No redesign should be required when onboarding additional organizations.

---

## Security

Sensitive information must be stored securely.

Passwords are never stored in plain text.

Uploaded documents are never publicly accessible.

Audit information must be preserved.

---

## Maintainability

The schema should remain easy to extend.

Adding new features should require adding new tables rather than modifying existing structures whenever possible.

---

# 3. Database Technology

The platform uses the following technologies.

| Component | Technology |
|-----------|------------|
| Database | PostgreSQL |
| ORM | Prisma |
| Migrations | Prisma Migrate |
| UUID Generation | PostgreSQL UUID |
| Development | Docker PostgreSQL |
| Pilot | Managed PostgreSQL |
| Production | PostgreSQL Cluster |

---

# 4. Design Principles

The database follows these principles.

## Normalize Business Data

Business entities should be normalized to reduce duplication and improve consistency.

---

## Configuration Over Hardcoding

Workflow stages, document requirements, terminology, and branding should be configurable through database records rather than application code.

---

## Soft Delete

Business records should never be permanently deleted.

Instead they should be archived.

---

## Auditability

Every important change should be traceable.

Creation, updates, and deletions should always be recorded.

---

## Multi-Tenant Ready

Every business entity belongs to exactly one Organization.

---

## UUID First

Every table uses UUID primary keys.

No auto-increment IDs should be used.

---

# 5. Naming Conventions

The following conventions apply to every table.

## Tables

Use plural snake_case.

Examples

organizations

staff

staff_accounts

roles

permissions

applicants

documents

tasks

notifications

---

## Columns

Use snake_case.

Examples

organization_id

created_at

updated_at

first_name

last_login_at

document_type_id

---

## Primary Keys

Every table uses

id

UUID

---

## Foreign Keys

Always reference using

entity_id

Examples

organization_id

staff_id

applicant_id

document_id

role_id

---

## Timestamps

created_at

updated_at

deleted_at

---

## User Tracking

created_by

updated_by

deleted_by

---

# 6. UUID Strategy

All primary keys use UUID.

Advantages

- Globally unique
- Better security
- Easier replication
- Suitable for distributed systems
- Mobile friendly
- Future microservices ready

Example

organization.id

staff.id

applicant.id

document.id

---

# 7. Multi-Tenant Strategy

Although the MVP serves one organization, every business entity belongs to an Organization.

Examples

Organization
│
├── Staff
├── Applicants
├── Documents
├── Workflow Templates
├── Tasks
├── Notes
└── Notifications

Every table includes

organization_id

except global lookup tables.

This architecture prevents cross-organization data access.

---

# 8. Soft Delete Strategy

Business records are never permanently deleted.

Instead every major table contains

deleted_at

deleted_by

Soft delete applies to

- Applicants
- Staff
- Documents
- Notes
- Tasks
- Workflow Templates

Permanent deletion should only occur through controlled maintenance operations.

---

# 9. Audit Fields

Every business table contains

id

created_at

created_by

updated_at

updated_by

deleted_at

deleted_by

Benefits

- Complete change history
- Easier debugging
- Better reporting
- Regulatory compliance
- Future audit capabilities

---

# 10. High-Level Entity Relationship Diagram (ERD)

```text
Organization
│
├── Staff
│     │
│     ├── StaffAccount
│     ├── Role
│     │      │
│     │      └── Permission
│     │
│     └── ApplicantAssignment
│
├── Applicant
│     │
│     ├── ApplicantAccount
│     ├── Workflow
│     ├── Document
│     ├── Note
│     ├── Task
│     ├── Timeline
│     └── AuditLog
│
├── WorkflowTemplate
│     └── WorkflowTemplateStage
│
├── DocumentRequirement
│
├── DocumentType
│
├── OrganizationConfiguration
│
└── Notification
```

---

# 11. Database Standards

Every table in the platform must follow these standards.

## Required Fields

Every business table should include:

- id (UUID)
- organization_id (where applicable)
- created_at
- created_by
- updated_at
- updated_by
- deleted_at
- deleted_by

---

## Foreign Keys

Every relationship must use foreign key constraints.

No orphan records should exist.

---

## Constraints

All required fields must be marked NOT NULL unless explicitly optional.

Unique constraints should be used wherever duplicate business records are not allowed.

---

## Indexes

Indexes should be created for:

- Foreign keys
- Email addresses
- Applicant numbers
- Workflow status
- Document status
- Task status
- Created dates

Composite indexes should be added for frequently queried combinations.

---

## Storage Strategy

The database stores metadata only.

Actual files are stored through the Storage Provider.

The database stores:

- storage_provider
- bucket
- storage_key
- file_name
- mime_type
- checksum
- file_size

The application generates signed download URLs when files are requested.

---

# 12. Identity & Access Tables

This section defines the tables responsible for authentication, authorization, and organization management.

---

# 12.1 organizations

## Purpose

Stores organizations (tenants) using the platform.

An Organization represents a consultancy, recruitment agency, immigration firm, or any future business using the system.

Every business record belongs to exactly one Organization.

---

## Columns

| Column | Type | Nullable | Description |
|---------|------|----------|-------------|
| id | UUID | No | Primary Key |
| name | VARCHAR(255) | No | Display Name |
| legal_name | VARCHAR(255) | Yes | Registered Name |
| slug | VARCHAR(100) | No | Unique URL Identifier |
| industry | VARCHAR(100) | No | Industry Type |
| email | VARCHAR(255) | Yes | Contact Email |
| phone | VARCHAR(50) | Yes | Contact Phone |
| website | VARCHAR(255) | Yes | Website |
| timezone | VARCHAR(100) | No | Default Timezone |
| country | VARCHAR(100) | No | Country |
| status | VARCHAR(30) | No | Active / Suspended |
| created_at | TIMESTAMP | No | Creation Date |
| created_by | UUID | Yes | Staff ID |
| updated_at | TIMESTAMP | Yes | Last Update |
| updated_by | UUID | Yes | Staff ID |
| deleted_at | TIMESTAMP | Yes | Soft Delete |
| deleted_by | UUID | Yes | Staff ID |

---

## Constraints

Primary Key

- id

Unique

- slug

---

## Relationships

Organization has many:

- Staff
- Applicants
- Workflow Templates
- Document Types
- Notifications

---

## Indexes

- slug
- status
- country

---

# 12.2 staff

## Purpose

Stores internal employees.

Examples

- Consultant
- Recruiter
- Administrator
- HR Officer

Authentication is stored separately.

---

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| organization_id | UUID |
| role_id | UUID |
| first_name | VARCHAR(100) |
| last_name | VARCHAR(100) |
| job_title | VARCHAR(100) |
| phone | VARCHAR(50) |
| profile_image | TEXT |
| status | VARCHAR(30) |
| last_login_at | TIMESTAMP |
| created_at | TIMESTAMP |
| created_by | UUID |
| updated_at | TIMESTAMP |
| updated_by | UUID |
| deleted_at | TIMESTAMP |
| deleted_by | UUID |

---

## Relationships

Belongs To

- Organization
- Role

Has One

- Staff Account

Has Many

- Applicant Assignments
- Tasks
- Notes

---

## Indexes

- organization_id
- role_id
- status

---

# 12.3 staff_accounts

## Purpose

Stores Staff authentication.

Separating authentication from business information improves security and allows future SSO integration.

---

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| staff_id | UUID |
| email | VARCHAR(255) |
| password_hash | TEXT |
| account_status | VARCHAR(30) |
| email_verified | BOOLEAN |
| failed_login_attempts | INTEGER |
| last_login_at | TIMESTAMP |
| password_changed_at | TIMESTAMP |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Constraints

Unique

- email

Unique

- staff_id

---

## Relationships

Belongs To

- Staff

---

## Indexes

- email
- account_status

---

# 12.4 roles

## Purpose

Defines Staff roles.

Examples

- Administrator
- Consultant
- Recruiter
- Read Only

---

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| organization_id | UUID |
| name | VARCHAR(100) |
| description | TEXT |
| is_system | BOOLEAN |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Constraints

Unique

organization_id + name

---

## Relationships

Belongs To

- Organization

Has Many

- Staff

Has Many

- Role Permissions

---

## Indexes

- organization_id
- name

---

# 12.5 permissions

## Purpose

Defines individual permissions.

Permissions are shared across all Organizations.

---

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| name | VARCHAR(150) |
| category | VARCHAR(100) |
| description | TEXT |

---

## Example Records

Applicant

- applicant.create
- applicant.update
- applicant.archive

Document

- document.upload
- document.review
- document.approve

Workflow

- workflow.update

Settings

- settings.manage

Reports

- reports.export

---

## Constraints

Unique

name

---

## Indexes

- category

---

# 12.6 role_permissions

## Purpose

Many-to-Many relationship between Roles and Permissions.

A Role may contain many Permissions.

A Permission may belong to many Roles.

---

## Columns

| Column | Type |
|---------|------|
| role_id | UUID |
| permission_id | UUID |
| created_at | TIMESTAMP |

---

## Constraints

Composite Primary Key

(role_id, permission_id)

---

## Relationships

Belongs To

- Role
- Permission

---

# Identity Relationship Diagram

```text
Organization
      │
      │
      ▼
    Staff
      │
      ▼
StaffAccount

      │
      ▼
    Role
      │
      ▼
RolePermission
      │
      ▼
 Permission
```

---

# Design Notes

Authentication is completely separated from Staff information.

Roles are Organization-specific.

Permissions are global.

Role Permissions provide a flexible RBAC implementation.

The design supports future Single Sign-On (SSO), OAuth, and enterprise identity providers without changing the business schema.

# 13. Applicant Management Tables

This section defines the database tables responsible for managing applicants and their portal access.

---

# 13.1 applicants

## Purpose

Stores applicant profile information.

Applicants are created by Staff members.

Applicants cannot self-register.

Every Applicant belongs to one Organization.

---

## Columns

| Column | Type | Nullable | Description |
|---------|------|----------|-------------|
| id | UUID | No | Primary Key |
| organization_id | UUID | No | Organization |
| applicant_number | VARCHAR(50) | No | Unique Applicant Number |
| first_name | VARCHAR(100) | No | First Name |
| middle_name | VARCHAR(100) | Yes | Middle Name |
| last_name | VARCHAR(100) | No | Last Name |
| gender | VARCHAR(20) | Yes | Gender |
| date_of_birth | DATE | Yes | Date of Birth |
| nationality | VARCHAR(100) | Yes | Nationality |
| email | VARCHAR(255) | Yes | Contact Email |
| phone | VARCHAR(50) | Yes | Contact Phone |
| address | TEXT | Yes | Address |
| city | VARCHAR(100) | Yes | City |
| country | VARCHAR(100) | Yes | Country |
| status | VARCHAR(30) | No | Applicant Status |
| created_at | TIMESTAMP | No | Created At |
| created_by | UUID | Yes | Staff |
| updated_at | TIMESTAMP | Yes | Updated At |
| updated_by | UUID | Yes | Staff |
| deleted_at | TIMESTAMP | Yes | Soft Delete |
| deleted_by | UUID | Yes | Staff |

---

## Constraints

Primary Key

- id

Unique

- applicant_number
- organization_id + email (nullable)

---

## Relationships

Belongs To

- Organization

Has One

- Applicant Account
- Workflow

Has Many

- Documents
- Tasks
- Notes
- Timeline Entries
- Audit Logs
- Applicant Assignments

---

## Suggested Indexes

- organization_id
- applicant_number
- status
- last_name
- email

---

# 13.2 applicant_accounts

## Purpose

Stores portal authentication for Applicants.

Accounts are created by Staff.

Applicants activate their account using an invitation email.

Authentication is separated from Applicant profile information.

---

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| applicant_id | UUID |
| email | VARCHAR(255) |
| password_hash | TEXT |
| invitation_token | TEXT |
| invitation_expires_at | TIMESTAMP |
| activated_at | TIMESTAMP |
| account_status | VARCHAR(30) |
| failed_login_attempts | INTEGER |
| last_login_at | TIMESTAMP |
| password_changed_at | TIMESTAMP |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Account Status

- Pending Invitation
- Active
- Suspended
- Locked

---

## Constraints

Unique

- applicant_id
- email

---

## Relationships

Belongs To

- Applicant

---

## Suggested Indexes

- email
- account_status
- invitation_token

---

# 13.3 applicant_assignments

## Purpose

Tracks which Staff members are responsible for managing Applicants.

Assignments are stored separately to support reassignment history and multiple Staff collaboration.

---

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| organization_id | UUID |
| applicant_id | UUID |
| staff_id | UUID |
| assigned_by | UUID |
| assigned_at | TIMESTAMP |
| is_primary | BOOLEAN |
| created_at | TIMESTAMP |

---

## Relationships

Belongs To

- Applicant
- Staff
- Organization

---

## Business Rules

- Every Applicant must have one Primary Staff member.
- Additional Staff members may also be assigned.
- Assignment history should never be deleted.

---

## Suggested Indexes

- applicant_id
- staff_id
- organization_id

---

# Applicant Relationship Diagram

```text
Organization
      │
      ▼
 Applicant
      │
      ├──────────────┐
      │              │
      ▼              ▼
ApplicantAccount   ApplicantAssignment
                       │
                       ▼
                     Staff
```

---

# Design Notes

Applicants are business entities.

Authentication is stored separately.

Assignments are flexible and support future collaboration.

Applicants never create accounts themselves.

Staff control applicant onboarding.

Applicant records remain even if portal access is disabled.

# 14. Workflow Management Tables

This section defines the tables responsible for managing applicant workflows.

The platform uses reusable Workflow Templates that are copied into an Applicant's Workflow when the Applicant is created.

This ensures Organizations can update future workflows without affecting Applicants already in progress.

---

# 14.1 workflow_templates

## Purpose

Defines reusable workflow templates for an Organization.

Each Organization may have multiple workflow templates depending on its business processes.

Examples

Education Consultancy

- Undergraduate Admission
- Master's Admission
- Australia Visa Process

Recruitment Agency

- Local Recruitment
- Overseas Recruitment

---

## Columns

| Column | Type | Nullable | Description |
|---------|------|----------|-------------|
| id | UUID | No | Primary Key |
| organization_id | UUID | No | Organization |
| name | VARCHAR(150) | No | Template Name |
| description | TEXT | Yes | Description |
| industry_id | UUID | Yes | Industry Reference |
| is_default | BOOLEAN | No | Default Template |
| is_active | BOOLEAN | No | Active Status |
| created_at | TIMESTAMP | No | Created At |
| created_by | UUID | Yes | Staff |
| updated_at | TIMESTAMP | Yes | Updated At |
| updated_by | UUID | Yes | Staff |
| deleted_at | TIMESTAMP | Yes | Soft Delete |
| deleted_by | UUID | Yes | Staff |

---

## Constraints

Primary Key

- id

Unique

- organization_id + name

---

## Relationships

Belongs To

- Organization

Has Many

- Workflow Template Stages

---

## Suggested Indexes

- organization_id
- is_default
- is_active

---

# 14.2 workflow_template_stages

## Purpose

Defines the ordered stages belonging to a Workflow Template.

---

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| workflow_template_id | UUID |
| stage_name | VARCHAR(150) |
| stage_order | INTEGER |
| description | TEXT |
| estimated_days | INTEGER |
| is_required | BOOLEAN |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Stage order must be unique within a template.
- Templates must contain at least one stage.
- Stage order cannot contain gaps.

---

## Relationships

Belongs To

- Workflow Template

---

## Suggested Indexes

- workflow_template_id
- stage_order

---

# 14.3 workflows

## Purpose

Represents an Applicant's active workflow.

When an Applicant is created, the selected Workflow Template is copied into this Workflow.

Future changes to the template will not affect existing Applicant workflows.

---

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| organization_id | UUID |
| applicant_id | UUID |
| workflow_template_id | UUID |
| current_stage_id | UUID |
| status | VARCHAR(30) |
| progress_percentage | DECIMAL(5,2) |
| started_at | TIMESTAMP |
| completed_at | TIMESTAMP |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Workflow Status

- Not Started
- In Progress
- On Hold
- Completed
- Cancelled

---

## Relationships

Belongs To

- Organization
- Applicant
- Workflow Template

Has Many

- Workflow Stages

---

## Suggested Indexes

- applicant_id
- organization_id
- status

---

# 14.4 workflow_stages

## Purpose

Stores the actual progress of an Applicant through each Workflow Stage.

Unlike Template Stages, these records change as the Applicant progresses.

---

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| workflow_id | UUID |
| workflow_template_stage_id | UUID |
| stage_name | VARCHAR(150) |
| stage_order | INTEGER |
| status | VARCHAR(30) |
| assigned_staff_id | UUID |
| started_at | TIMESTAMP |
| completed_at | TIMESTAMP |
| notes | TEXT |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Stage Status

- Pending
- Active
- Completed
- Skipped

---

## Relationships

Belongs To

- Workflow
- Workflow Template Stage

Assigned To

- Staff

---

## Business Rules

- Only one stage may be Active at a time.
- Stages are completed in sequence.
- Skipped stages are recorded for audit purposes.
- Completed stages become read-only.

---

## Suggested Indexes

- workflow_id
- assigned_staff_id
- status

---

# Workflow Relationship Diagram

```text
Organization
      │
      ▼
WorkflowTemplate
      │
      ▼
WorkflowTemplateStage
      │
      ▼
Applicant
      │
      ▼
Workflow
      │
      ▼
WorkflowStage
```

---

# Workflow Lifecycle

Workflow Template

↓

Applicant Created

↓

Workflow Created

↓

Workflow Stages Copied

↓

Stage 1 Activated

↓

Stage Completed

↓

Next Stage Activated

↓

Workflow Completed

---

# Design Notes

Workflow Templates remain reusable.

Applicant Workflows are independent copies.

Organizations can modify templates without affecting existing Applicants.

Workflow progress is tracked at the stage level, enabling accurate reporting, dashboards, notifications, and audit history.

# 15. Document Management Tables

This section defines the database tables responsible for document management.

The platform stores document metadata in the database while physical files are stored using the configured Storage Provider.

This design supports:

- Local Development Storage
- Cloudflare R2
- AWS S3
- Azure Blob Storage
- Google Cloud Storage

without changing the database schema.

---

# 15.1 document_types

## Purpose

Defines reusable document categories.

Document Types are shared across Organizations and represent generic document classifications.

Examples

- Passport
- National ID
- Academic Transcript
- Resume
- Medical Certificate
- Bank Statement

Organizations determine which Document Types are required through Document Requirements.

---

## Columns

| Column | Type | Nullable | Description |
|---------|------|----------|-------------|
| id | UUID | No | Primary Key |
| code | VARCHAR(50) | No | Unique System Code |
| name | VARCHAR(150) | No | Display Name |
| description | TEXT | Yes | Description |
| category | VARCHAR(100) | Yes | Document Category |
| created_at | TIMESTAMP | No | Created At |
| updated_at | TIMESTAMP | Yes | Updated At |

---

## Constraints

Primary Key

- id

Unique

- code

---

## Relationships

Referenced By

- Document Requirements
- Documents

---

## Suggested Indexes

- code
- category

---

# 15.2 document_requirements

## Purpose

Defines which documents an Organization requires for a specific Workflow Template.

This makes document collection configurable without changing application code.

---

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| organization_id | UUID |
| workflow_template_id | UUID |
| document_type_id | UUID |
| display_name | VARCHAR(150) |
| is_required | BOOLEAN |
| requires_review | BOOLEAN |
| allows_multiple | BOOLEAN |
| max_file_size_mb | INTEGER |
| allowed_file_types | JSONB |
| expires | BOOLEAN |
| display_order | INTEGER |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Example

Passport

Required

PDF, JPG, PNG

Maximum 10 MB

Review Required

Expires = Yes

---

## Relationships

Belongs To

- Organization
- Workflow Template
- Document Type

---

## Suggested Indexes

- organization_id
- workflow_template_id
- document_type_id

---

# 15.3 documents

## Purpose

Represents a logical document belonging to an Applicant.

A Document is independent of the uploaded file.

Uploaded files are stored as Document Versions.

Example

Passport

↓

Version 1

↓

Version 2

↓

Version 3

Current Version = 3

---

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| organization_id | UUID |
| applicant_id | UUID |
| document_requirement_id | UUID |
| current_version_id | UUID |
| status | VARCHAR(30) |
| reviewed_by | UUID |
| reviewed_at | TIMESTAMP |
| rejection_reason | TEXT |
| expires_at | TIMESTAMP |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |
| deleted_at | TIMESTAMP |

---

## Document Status

- Missing
- Requested
- Uploaded
- Under Review
- Approved
- Rejected
- Expired

---

## Relationships

Belongs To

- Organization
- Applicant
- Document Requirement

Has Many

- Document Versions

---

## Business Rules

- Every Document belongs to one Applicant.
- Every Document follows one Requirement.
- Every replacement creates a new Version.
- Approved documents become read-only until replaced.
- Rejected documents require a replacement upload.

---

## Suggested Indexes

- applicant_id
- status
- reviewed_by

---

# 15.4 document_versions

## Purpose

Stores every uploaded file.

Files are immutable.

Replacing a file creates a new version instead of overwriting the existing one.

---

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| document_id | UUID |
| version_number | INTEGER |
| original_filename | VARCHAR(255) |
| storage_provider | VARCHAR(50) |
| bucket | VARCHAR(150) |
| storage_key | TEXT |
| mime_type | VARCHAR(100) |
| file_size | BIGINT |
| checksum | VARCHAR(255) |
| uploaded_by_staff_id | UUID |
| uploaded_by_applicant | BOOLEAN |
| uploaded_at | TIMESTAMP |

---

## Storage Provider Examples

Development

- local

Pilot

- cloudflare-r2

Production

- aws-s3

Future

- azure-blob
- google-cloud-storage

---

## Relationships

Belongs To

- Document

---

## Business Rules

- Files cannot be modified.
- New uploads always create new versions.
- Previous versions remain available for audit.
- The latest version becomes the current version.

---

## Suggested Indexes

- document_id
- version_number
- checksum

---

# Document Relationship Diagram

```text
Organization
      │
      ▼
WorkflowTemplate
      │
      ▼
DocumentRequirement
      │
      ▼
Applicant
      │
      ▼
Document
      │
      ▼
DocumentVersion
```

---

# Document Upload Lifecycle

Document Requirement Created

↓

Applicant Created

↓

Required Documents Generated

↓

Applicant Uploads File

↓

Document Version Created

↓

Staff Reviews

↓

Approved / Rejected

↓

Replacement Upload (if required)

↓

New Version Created

---

# Storage Strategy

The database never stores public URLs.

Instead, only metadata is stored.

Example

storage_provider

bucket

storage_key

checksum

mime_type

file_size

The backend generates temporary signed URLs whenever downloads are requested.

This approach provides:

- Improved Security
- Cloud Independence
- Better Performance
- Easier Migration
- Reduced Vendor Lock-In

---

# Design Notes

Document metadata and physical storage are intentionally separated.

Versioning preserves complete upload history.

Organizations configure requirements instead of hardcoding document lists.

The storage abstraction allows seamless migration between Local Storage, Cloudflare R2, AWS S3, Azure Blob Storage, and Google Cloud Storage without changing the database schema.

# 16. Operational Tables

This section defines the operational tables that support daily platform activities, collaboration, auditing, notifications, and organization configuration.

---

# 16.1 notes

## Purpose

Stores internal notes related to an Applicant.

Notes are only visible to Staff.

Applicants cannot view internal notes.

---

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| organization_id | UUID |
| applicant_id | UUID |
| created_by | UUID |
| note | TEXT |
| is_pinned | BOOLEAN |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |
| deleted_at | TIMESTAMP |

---

## Relationships

Belongs To

- Organization
- Applicant
- Staff

---

## Suggested Indexes

- applicant_id
- created_by
- created_at

---

# 16.2 tasks

## Purpose

Represents actionable work assigned to Staff.

Tasks improve collaboration and ensure Applicants progress through the workflow.

---

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| organization_id | UUID |
| applicant_id | UUID |
| assigned_to | UUID |
| created_by | UUID |
| title | VARCHAR(255) |
| description | TEXT |
| priority | VARCHAR(30) |
| status | VARCHAR(30) |
| due_date | TIMESTAMP |
| completed_at | TIMESTAMP |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |
| deleted_at | TIMESTAMP |

---

## Task Priority

- Low
- Medium
- High
- Critical

---

## Task Status

- Pending
- In Progress
- Completed
- Cancelled

---

## Relationships

Belongs To

- Organization
- Applicant
- Staff

---

## Suggested Indexes

- assigned_to
- applicant_id
- status
- due_date

---

# 16.3 timeline_entries

## Purpose

Provides a chronological history of important Applicant activities.

Timeline entries are generated automatically by the system and may also be added manually by Staff.

---

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| organization_id | UUID |
| applicant_id | UUID |
| event_type | VARCHAR(100) |
| title | VARCHAR(255) |
| description | TEXT |
| performed_by | UUID |
| created_at | TIMESTAMP |

---

## Example Events

- Applicant Created
- Invitation Sent
- Account Activated
- Passport Uploaded
- Document Approved
- Workflow Updated
- Task Completed

---

## Relationships

Belongs To

- Organization
- Applicant

---

## Suggested Indexes

- applicant_id
- event_type
- created_at

---

# 16.4 audit_logs

## Purpose

Stores security-sensitive system events.

Audit Logs support compliance, troubleshooting, and security investigations.

Unlike Timeline entries, Audit Logs are never visible to Applicants.

---

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| organization_id | UUID |
| user_type | VARCHAR(30) |
| user_id | UUID |
| action | VARCHAR(150) |
| entity_type | VARCHAR(100) |
| entity_id | UUID |
| old_values | JSONB |
| new_values | JSONB |
| ip_address | VARCHAR(100) |
| user_agent | TEXT |
| created_at | TIMESTAMP |

---

## Example Actions

- Login
- Password Changed
- Applicant Updated
- Document Deleted
- Role Updated
- Permission Modified

---

## Relationships

References

- Organization
- Staff
- Applicant

---

## Suggested Indexes

- user_id
- entity_type
- entity_id
- created_at

---

# 16.5 notifications

## Purpose

Stores notifications delivered to Staff and Applicants.

The notification system currently supports in-app notifications and is designed for future expansion to email, push notifications, SMS, and WhatsApp.

---

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| organization_id | UUID |
| recipient_type | VARCHAR(30) |
| recipient_id | UUID |
| notification_type | VARCHAR(100) |
| title | VARCHAR(255) |
| message | TEXT |
| is_read | BOOLEAN |
| read_at | TIMESTAMP |
| created_at | TIMESTAMP |

---

## Notification Types

Staff

- Applicant Assigned
- Document Uploaded
- Task Due
- Workflow Updated

Applicant

- Invitation Sent
- Document Requested
- Document Approved
- Document Rejected
- Workflow Updated

---

## Suggested Indexes

- recipient_id
- recipient_type
- is_read
- created_at

---

# 16.6 organization_configurations

## Purpose

Stores configurable settings for each Organization.

Instead of creating multiple configuration tables, settings are grouped into a single record using JSONB fields.

This allows new configuration options to be added without requiring database schema changes.

---

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| organization_id | UUID |
| branding | JSONB |
| terminology | JSONB |
| portal | JSONB |
| workflow | JSONB |
| documents | JSONB |
| notifications | JSONB |
| feature_flags | JSONB |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Branding JSON Example

```json
{
  "organizationName": "ABC Consultancy",
  "primaryColor": "#2563EB",
  "secondaryColor": "#0F172A",
  "logo": "/logos/logo.png",
  "favicon": "/logos/favicon.ico"
}
```

---

## Terminology JSON Example

```json
{
  "applicant": "Student",
  "staff": "Consultant",
  "workflow": "Admission Process",
  "document": "Student Document"
}
```

---

## Portal JSON Example

```json
{
  "allowPasswordReset": true,
  "allowProfileEdit": true,
  "sessionTimeout": 30
}
```

---

## Feature Flags Example

```json
{
  "enableMessaging": false,
  "enablePayments": false,
  "enableAppointments": false,
  "enableAI": false
}
```

---

## Relationships

Belongs To

- Organization

---

## Suggested Indexes

- organization_id

---

# Operational Relationship Diagram

```text
Organization
│
├── Notes
├── Tasks
├── Timeline Entries
├── Audit Logs
├── Notifications
└── Organization Configuration
```

---

# Design Notes

Operational tables are intentionally separated from business entities.

Timeline entries provide a business history for Applicants.

Audit Logs provide immutable security records.

Notifications support both Staff and Applicants.

Organization Configuration enables a flexible white-label platform without requiring frequent schema changes.

# 17. Relationships & Foreign Keys

This section defines the relationships between the core database tables.

Referential integrity is enforced using foreign key constraints.

Business records should never become orphaned.

---

# Organization Relationships

organizations

↓

staff

↓

applicants

↓

workflow_templates

↓

document_requirements

↓

documents

↓

tasks

↓

notes

↓

notifications

↓

organization_configurations

Every business entity belongs to one Organization.

---

# Staff Relationships

staff

↓

staff_accounts

↓

roles

↓

applicant_assignments

↓

tasks

↓

notes

↓

audit_logs

---

# Applicant Relationships

applicants

↓

applicant_accounts

↓

workflows

↓

documents

↓

notes

↓

tasks

↓

timeline_entries

↓

audit_logs

---

# Workflow Relationships

workflow_templates

↓

workflow_template_stages

↓

workflows

↓

workflow_stages

---

# Document Relationships

document_types

↓

document_requirements

↓

documents

↓

document_versions

---

# Foreign Key Strategy

Foreign keys should use the following delete rules.

| Relationship | On Delete |
|--------------|-----------|
| Organization → Staff | RESTRICT |
| Organization → Applicant | RESTRICT |
| Staff → Staff Account | CASCADE |
| Applicant → Applicant Account | CASCADE |
| Applicant → Documents | RESTRICT |
| Document → Versions | CASCADE |
| Workflow → Workflow Stages | CASCADE |
| Role → Role Permissions | CASCADE |

Business records should generally use `RESTRICT`.

Supporting child records may use `CASCADE`.

---

# 18. Constraints

The following constraints apply throughout the database.

---

## Primary Keys

Every table uses:

UUID

---

## Unique Constraints

Examples

Organization

- slug

Staff Account

- email

Applicant

- applicant_number

Role

- organization_id + name

Workflow Template

- organization_id + name

---

## Required Fields

Business-critical fields must be NOT NULL.

Optional data should explicitly allow NULL values.

---

## Check Constraints

Examples

Task Priority

- Low
- Medium
- High
- Critical

Workflow Progress

0 <= progress_percentage <= 100

File Size

Greater than zero

Version Number

Greater than zero

---

# 19. Index Strategy

Indexes improve database performance.

---

## Primary Indexes

Every Primary Key automatically has an index.

---

## Foreign Key Indexes

Create indexes for every foreign key.

Examples

organization_id

staff_id

applicant_id

workflow_id

document_id

role_id

---

## Search Indexes

Applicant

- first_name
- last_name
- applicant_number
- email

Staff

- email
- last_name

Document

- status

Workflow

- status

Task

- due_date

---

## Composite Indexes

Applicant

organization_id + status

Task

assigned_to + status

Workflow

organization_id + status

Document

applicant_id + status

Notification

recipient_id + is_read

---

# 20. Prisma Model Mapping

The database is implemented using Prisma ORM.

Each table maps directly to a Prisma model.

Example

organizations

↓

model Organization

staff

↓

model Staff

documents

↓

model Document

workflow_templates

↓

model WorkflowTemplate

No business logic should exist inside Prisma models.

Business logic belongs to NestJS Services.

---

# 21. Migration Strategy

Database changes should be managed using Prisma Migrate.

Rules

- Every schema change requires a migration.
- Never modify production tables manually.
- Migrations should be version controlled.
- Rollback plans should exist for breaking changes.

Migration order

1. Organizations
2. Roles
3. Permissions
4. Staff
5. Staff Accounts
6. Applicants
7. Applicant Accounts
8. Workflow Templates
9. Workflow Template Stages
10. Workflows
11. Workflow Stages
12. Document Types
13. Document Requirements
14. Documents
15. Document Versions
16. Notes
17. Tasks
18. Timeline Entries
19. Audit Logs
20. Notifications
21. Organization Configurations

---

# 22. Future Database Expansion

The database is designed to support future modules without major schema changes.

Future modules may include:

## Communication

- Messages
- Email Threads
- SMS
- WhatsApp Conversations

---

## Payments

- Invoices
- Payments
- Refunds
- Subscriptions

---

## Scheduling

- Calendar
- Appointments
- Interviews
- Meetings

---

## CRM

- Leads
- Opportunities
- Campaigns

---

## AI

- OCR Results
- AI Recommendations
- AI Workflow Assistant
- Document Classification

---

## Reporting

- Analytics
- KPI Snapshots
- Data Warehouse Integration

---

# 23. Database Summary

The database architecture provides:

- Multi-tenant readiness
- White-label flexibility
- Secure authentication
- Role-Based Access Control (RBAC)
- Configurable workflows
- Configurable document requirements
- Version-controlled documents
- Audit logging
- Timeline tracking
- Notification support
- Cloud-independent file storage
- PostgreSQL best practices
- Prisma compatibility
- Future SaaS scalability

This database design serves as the implementation blueprint for the backend and establishes a stable foundation for future platform growth.