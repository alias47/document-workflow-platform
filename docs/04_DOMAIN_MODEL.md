# 04_DOMAIN_MODEL.md

# Domain Model

**Project:** Document Workflow Platform

**Version:** 2.0

**Status:** Draft

**Last Updated:** June 2026

---

# 1. Purpose

This document defines the business domain of the Document Workflow Platform.

It establishes the core entities, relationships, business rules, and terminology used throughout the platform.

This document acts as the single source of truth for:

* Database Design
* Backend Development
* Frontend Development
* API Design
* Authentication
* Authorization
* White-label Configuration
* Future Mobile Applications

Any changes to the business model should be reflected in this document before implementation.

---

# 2. Design Principles

The platform follows these principles:

* Industry-neutral terminology
* White-label ready
* Multi-tenant ready
* Separation of business and authentication
* High cohesion
* Low coupling
* Security by design
* Domain Driven Design (DDD)
* Configuration over customization
* Future SaaS scalability

---

# 3. Core Business Domains

The platform consists of the following domains:

* Organization
* Staff
* Role
* Permission
* Applicant
* Portal Account
* Assignment
* Document
* Document Type
* Document Version
* Workflow
* Workflow Stage
* Note
* Task
* Timeline
* Audit Log
* Notification
* Organization Settings
* Branding Settings
* Workflow Settings
* Document Settings

---

# 4. Domain Overview

```text
Organization
│
├── Staff
│     │
│     ├── Role
│     │      │
│     │      └── Permissions
│     │
│     └── Assigned Applicants
│
├── Applicant
│     │
│     ├── Portal Account
│     ├── Assignment
│     ├── Documents
│     │      │
│     │      ├── Document Type
│     │      └── Document Version
│     │
│     ├── Workflow
│     │      │
│     │      └── Workflow Stage
│     │
│     ├── Notes
│     ├── Tasks
│     ├── Timeline
│     └── Audit Log
│
├── Notifications
│
├── Organization Settings
│
├── Branding Settings
│
├── Workflow Settings
│
└── Document Settings
```

---

# 5. Organization

## Description

Represents a company or organization using the platform.

The backend always treats every customer as an Organization regardless of industry.

Examples include:

* Education Consultancy
* Recruitment Agency
* Immigration Firm
* HR Company
* Training Institute
* Visa Consultancy

---

## Responsibilities

The Organization owns every resource within the platform.

Responsibilities include:

* Staff Management
* Applicant Ownership
* Branding
* Workflow Configuration
* Document Configuration
* Security Policies
* Reporting
* Organization Preferences

---

## Relationships

Organization owns:

* Staff
* Applicants
* Roles
* Workflow Configuration
* Document Types
* Branding
* Settings
* Notifications

---

## Core Attributes

* Organization Name
* Legal Name
* Logo
* Primary Color
* Secondary Color
* Timezone
* Country
* Contact Email
* Contact Phone
* Website
* Industry Type
* Status

---

# 6. Staff

## Description

Represents an internal employee of an Organization.

Staff members are responsible for managing applicants and business operations.

Examples:

* Consultant
* Recruiter
* HR Officer
* Admissions Officer
* Case Manager
* Organization Administrator

---

## Responsibilities

Staff members may:

* Create Applicants
* Update Applicants
* Assign Applicants
* Review Documents
* Approve Documents
* Reject Documents
* Update Workflow
* Add Notes
* Create Tasks
* View Reports
* Communicate with Applicants

Actual permissions depend on the assigned Role.

---

## Relationships

Belongs to:

* Organization

Assigned:

* One Role

May Manage:

* Multiple Applicants

Creates:

* Notes
* Tasks
* Timeline Events

---

## Core Attributes

* First Name
* Last Name
* Email
* Phone Number
* Job Title
* Profile Image
* Status
* Last Login
* Organization ID
* Role ID

---

# 7. Role

## Description

A Role represents a collection of permissions assigned to Staff members.

Roles simplify authorization by grouping permissions rather than assigning them individually.

Examples:

* Organization Administrator
* Consultant
* Recruiter
* HR Officer
* Admissions Officer
* Read Only

---

## Responsibilities

* Define access level
* Group permissions
* Support RBAC
* Simplify authorization

---

## Relationships

Belongs to:

* Organization

Assigned To:

* Staff

Contains:

* Permissions

---

## Examples

Administrator

* Full Access

Consultant

* Applicant Management
* Document Review

Recruiter

* Workflow Updates
* Candidate Review

Read Only

* View Dashboard
* View Applicants

---

# 8. Permission

## Description

A Permission defines a single action that can be performed within the platform.

Permissions are assigned to Roles.

Staff inherit permissions through their assigned Role.

---

## Permission Categories

### Organization

* organization.view
* organization.update

---

### Staff

* staff.create
* staff.update
* staff.delete
* staff.view

---

### Applicant

* applicant.create
* applicant.update
* applicant.archive
* applicant.view

---

### Document

* document.upload
* document.review
* document.approve
* document.reject
* document.download

---

### Workflow

* workflow.update
* workflow.view

---

### Dashboard

* dashboard.view

---

### Settings

* settings.manage

---

### Reports

* reports.view
* reports.export

---

## Design Principles

Permissions should remain:

* Granular
* Reusable
* Extensible

New permissions should be added without changing existing authorization logic.

# 9. Applicant

## Description

An Applicant represents the primary business entity managed by the platform.

The backend always uses the term **Applicant** regardless of industry.

The frontend may display alternative terminology based on organization configuration.

Examples:

* Student
* Candidate
* Client
* Employee
* Patient (Future)

---

## Responsibilities

Applicants can:

* Access the Applicant Portal
* Upload required documents
* Replace documents
* Track workflow progress
* View timeline
* Complete assigned tasks (Future)
* Update limited profile information

Applicants cannot:

* Create accounts themselves
* Manage other applicants
* Access organization settings
* View internal notes

---

## Relationships

Belongs To:

* Organization

Has One:

* Portal Account
* Workflow

Has Many:

* Documents
* Notes (Internal)
* Tasks
* Timeline Entries
* Audit Logs

Assigned To:

* One or More Staff Members

---

## Core Attributes

Personal Information

* First Name
* Last Name
* Date of Birth
* Gender
* Nationality

Contact Information

* Email
* Phone Number
* Address
* Country

Application Information

* Applicant Number
* Current Status
* Assigned Staff
* Created Date
* Updated Date

---

## Business Rules

* Every Applicant belongs to exactly one Organization.
* Every Applicant has exactly one Portal Account.
* Every Applicant has one active Workflow.
* Applicants may have multiple Documents.
* Applicants may be assigned to multiple Staff members in future versions.

---

# 10. Portal Account

## Description

A Portal Account represents the authentication credentials used by an Applicant.

The Applicant entity stores business information.

The Portal Account stores authentication information.

This separation allows business data to exist independently of login credentials.

---

## Responsibilities

* Authentication
* Password Management
* Account Activation
* Password Reset
* Login History
* Session Management

---

## Lifecycle

```text
Staff Creates Applicant
        │
        ▼
Portal Account Created
        │
        ▼
Invitation Email Sent
        │
        ▼
Applicant First Login
        │
        ▼
Password Change Required
        │
        ▼
Active Account
```

---

## Statuses

* Pending
* Invitation Sent
* Invitation Accepted
* Active
* Suspended
* Disabled
* Locked

---

## Core Attributes

* Username (Email)
* Password Hash
* Last Login
* Failed Login Attempts
* Password Changed At
* Invitation Token
* Invitation Expiry
* Account Status

---

## Business Rules

* One Portal Account per Applicant.
* Passwords are stored using Argon2 hashing.
* Temporary passwords must be changed on first login.
* Staff members must never know or retrieve applicant passwords.

---

# 11. Assignment

## Description

Assignments link Applicants with Staff members.

This allows organizations to distribute work across multiple consultants or recruiters.

---

## Responsibilities

* Assign Applicants
* Transfer Ownership
* Support Team Collaboration
* Enable "My Applicants" dashboards

---

## Relationships

Belongs To:

* Applicant
* Staff

---

## Core Attributes

* Applicant ID
* Staff ID
* Assigned By
* Assigned Date
* Assignment Status

---

## Business Rules

* Every Applicant must have at least one assigned Staff member.
* Organization Administrators may reassign applicants.
* Assignment history should be retained.

---

# 12. Note

## Description

A Note represents internal information recorded by Staff.

Notes are never visible to Applicants.

---

## Examples

* Waiting for updated passport.
* IELTS result expected next week.
* Applicant requested extension.
* Documents verified.
* University interview completed.

---

## Responsibilities

* Internal communication
* Collaboration
* Applicant history
* Case management

---

## Relationships

Belongs To:

* Applicant

Created By:

* Staff

---

## Core Attributes

* Title
* Content
* Created By
* Created At
* Updated At

---

## Business Rules

* Applicants cannot access Notes.
* Notes may be edited only by authorized Staff.
* Deleted notes should be soft deleted.

---

# 13. Task

## Description

A Task represents an action assigned to a Staff member regarding an Applicant.

Tasks help consultants manage daily work and deadlines.

---

## Examples

* Call Applicant
* Verify Passport
* Request IELTS Result
* Submit Application
* Book Visa Appointment
* Review Financial Documents

---

## Responsibilities

* Work management
* Follow-up reminders
* Case tracking
* Operational efficiency

---

## Relationships

Belongs To:

* Applicant

Assigned To:

* Staff

Created By:

* Staff

---

## Statuses

* Pending
* In Progress
* Completed
* Cancelled
* Overdue

---

## Priority Levels

* Low
* Medium
* High
* Urgent

---

## Core Attributes

* Title
* Description
* Due Date
* Priority
* Status
* Assigned Staff
* Created By
* Completed At

---

## Business Rules

* Every Task belongs to one Applicant.
* A Task must be assigned to one Staff member.
* Completed Tasks cannot be modified without proper authorization.
* Overdue Tasks should appear on Staff dashboards.

# 14. Document

## Description

A Document represents a file uploaded by an Applicant or Staff as part of the application process.

The platform stores document metadata separately from the physical file.

Actual file storage is handled through the Storage Provider (Local, Cloudflare R2, AWS S3, etc.).

---

## Responsibilities

Documents are responsible for:

* Secure file storage
* Document validation
* Review process
* Approval workflow
* Version management
* Download history

---

## Relationships

Belongs To:

* Applicant
* Document Type

Has Many:

* Document Versions

Referenced By:

* Workflow
* Timeline
* Audit Log

---

## Statuses

* Missing
* Requested
* Uploaded
* Under Review
* Approved
* Rejected
* Expired

---

## Core Attributes

* Document Number
* Applicant ID
* Document Type ID
* Current Version
* Status
* Expiry Date
* Uploaded At
* Reviewed At
* Reviewed By

---

## Business Rules

* Every Document belongs to one Applicant.
* Every Document has one Document Type.
* Every Document may contain multiple versions.
* Only one version can be marked as Current.
* Rejected documents may be replaced.
* Approved documents become read-only.

---

# 15. Document Type

## Description

Document Types define which documents an Organization requires.

Document Types are configurable by each Organization.

This allows different industries to require different document sets without code changes.

---

## Examples

Education Consultancy

* Passport
* Citizenship
* SEE Certificate
* +2 Transcript
* Bachelor Transcript
* IELTS
* Financial Statement

Recruitment Agency

* Passport
* CV
* Employment Certificate
* Police Clearance
* Medical Report

Immigration Firm

* Passport
* Visa Form
* Marriage Certificate
* Bank Statement

---

## Responsibilities

* Define required documents
* Configure validation rules
* Control upload requirements
* Configure expiry policies

---

## Relationships

Belongs To:

* Organization

Referenced By:

* Documents

---

## Core Attributes

* Name
* Description
* Category
* Required
* Allowed File Types
* Maximum File Size
* Expiry Required
* Display Order
* Active Status

---

## Business Rules

* Organizations manage their own Document Types.
* Document Types cannot be deleted while in use.
* Organizations may disable unused Document Types.

---

# 16. Document Version

## Description

Every uploaded replacement creates a new Document Version.

Previous versions are never deleted.

This provides complete history and traceability.

---

## Example

Passport

Version 1

↓

Version 2

↓

Version 3

Current Version = 3

---

## Responsibilities

* Preserve history
* Track file replacements
* Support auditing
* Enable rollback (Future)

---

## Relationships

Belongs To:

* Document

Uploaded By:

* Applicant
* Staff

---

## Core Attributes

* Version Number
* File Name
* Storage Path
* File Size
* MIME Type
* Uploaded By
* Uploaded At

---

## Business Rules

* Files are immutable after upload.
* New uploads create new versions.
* Previous versions remain accessible to authorized Staff.
* Applicants can only access the latest approved version.

---

# 17. Workflow

## Description

A Workflow represents the complete business process an Applicant follows.

Each Organization defines its own workflow.

The backend stores workflows generically while the frontend displays industry-specific labels.

---

## Examples

Education Consultancy

Inquiry

↓

Documents

↓

University Application

↓

Offer Letter

↓

Visa

↓

Departure

Recruitment Agency

Applied

↓

Screening

↓

Interview

↓

Medical

↓

Deployment

---

## Responsibilities

* Track Applicant progress
* Manage Workflow Stages
* Calculate completion
* Support reporting
* Trigger notifications

---

## Relationships

Belongs To:

* Applicant

Contains:

* Workflow Stages

---

## Core Attributes

* Workflow Name
* Current Stage
* Completion Percentage
* Started At
* Completed At
* Status

---

## Workflow Statuses

* Not Started
* In Progress
* On Hold
* Completed
* Cancelled

---

## Business Rules

* Every Applicant has one active Workflow.
* Organizations configure Workflow templates.
* Workflow completion is calculated automatically.

---

# 18. Workflow Stage

## Description

Workflow Stages represent individual steps within a Workflow.

Organizations may customize stages based on their operational process.

---

## Examples

Education Consultancy

* Inquiry
* Document Collection
* Application Submitted
* Offer Received
* Visa Processing
* Departure

Recruitment

* Application Received
* Initial Screening
* Interview
* Employer Approval
* Medical Examination
* Deployment

---

## Responsibilities

* Represent workflow progress
* Control stage order
* Trigger business rules
* Support reporting

---

## Relationships

Belongs To:

* Workflow

---

## Core Attributes

* Name
* Description
* Order
* Status
* Started At
* Completed At

---

## Stage Statuses

* Pending
* Active
* Completed
* Skipped

---

## Business Rules

* Stage order must be sequential.
* Only one stage may be Active at a time.
* Completing a stage automatically activates the next stage.
* Organizations may configure custom stage names and order.

# 19. Timeline

## Description

The Timeline provides a chronological history of significant business events related to an Applicant.

It helps Staff understand the complete journey of an Applicant without viewing multiple modules.

Timeline entries are generated automatically by the system and, where appropriate, manually by Staff.

---

## Responsibilities

The Timeline is responsible for:

- Displaying Applicant history
- Recording important business events
- Improving case visibility
- Supporting collaboration among Staff

---

## Relationships

Belongs To:

- Applicant

References:

- Staff
- Document
- Workflow
- Task

---

## Example Timeline

2026-06-20

Applicant Created

↓

2026-06-20

Portal Invitation Sent

↓

2026-06-22

Applicant Activated Account

↓

2026-06-23

Passport Uploaded

↓

2026-06-24

Passport Approved

↓

2026-06-26

Workflow moved to "University Application"

↓

2026-06-28

Offer Letter Received

---

## Core Attributes

- Applicant
- Event Type
- Event Title
- Event Description
- Created By
- Created At

---

## Business Rules

- Timeline entries cannot be modified.
- Timeline entries are ordered chronologically.
- Important business actions should automatically create timeline entries.

# 20. Audit Log

## Description

The Audit Log records security-sensitive actions performed within the platform.

Unlike the Timeline, Audit Logs focus on compliance, accountability, and system security.

Audit Logs are never visible to Applicants.

---

## Responsibilities

- Security auditing
- Compliance
- User accountability
- Incident investigation

---

## Relationships

References:

- Organization
- Staff
- Applicant

---

## Examples

Administrator logged in

Consultant updated applicant

Recruiter downloaded Passport

Password changed

Role updated

Permission modified

Document deleted

---

## Core Attributes

- User
- Action
- Entity
- Entity ID
- IP Address
- Browser
- Device
- Timestamp

---

## Business Rules

- Audit Logs cannot be edited.
- Audit Logs cannot be deleted.
- Every security-sensitive action should generate an Audit Log.
- Audit Logs should be retained according to Organization policy.

# 21. Notification

## Description

Notifications inform Staff and Applicants about important events occurring within the platform.

Notifications improve communication while reducing manual follow-up.

---

## Notification Types

Staff

- New Applicant Assigned
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

## Delivery Channels

Current MVP

- In-App Notifications

Future

- Email
- Push Notification
- SMS
- WhatsApp

---

## Relationships

Belongs To:

- Staff
- Applicant

---

## Core Attributes

- Title
- Message
- Type
- Read Status
- Created At

# 22. Organization Settings

## Description

Organization Settings store operational preferences for an Organization.

These settings affect platform behavior but not branding.

---

## Examples

- Timezone
- Date Format
- Language
- Currency
- Business Hours
- Working Days

---

## Responsibilities

- Organization preferences
- Regional settings
- Default platform behavior

# 23. Branding Settings

## Description

Branding Settings allow Organizations to customize the appearance of the platform.

This is the foundation of the white-label architecture.

---

## Examples

- Organization Name
- Logo
- Favicon
- Primary Color
- Secondary Color
- Login Background
- Dashboard Banner

---

## Responsibilities

- Brand customization
- White-label support
- Organization identity

# 24. Workflow Settings

## Description

Workflow Settings define how Applicant workflows behave within an Organization.

Organizations may customize stages without changing backend code.

---

## Examples

- Stage Names
- Stage Order
- Default Workflow
- Completion Rules
- Automatic Notifications

---

## Responsibilities

- Configure workflow
- Customize business process
- Enable industry-specific workflows

# 25. Document Settings

## Description

Document Settings configure document management policies.

---

## Examples

- Maximum Upload Size
- Allowed File Types
- Auto Expiration
- Required Documents
- Review Required
- Version Limit

---

## Responsibilities

- Document validation
- Upload policy
- Storage policy

# 26. Entity Relationships

This section describes how the core business entities relate to one another.

---

## Organization

Organization
│
├── Has Many Staff
├── Has Many Applicants
├── Has Many Roles
├── Has Many Document Types
├── Has One Branding Settings
├── Has One Organization Settings
├── Has One Workflow Settings
└── Has One Document Settings

---

## Staff

Staff
│
├── Belongs To Organization
├── Belongs To Role
├── Has Many Applicant Assignments
├── Creates Notes
├── Creates Tasks
├── Generates Audit Logs
└── Receives Notifications

---

## Role

Role
│
├── Belongs To Organization
├── Has Many Staff
└── Has Many Permissions

---

## Applicant

Applicant
│
├── Belongs To Organization
├── Has One Portal Account
├── Has One Workflow
├── Has Many Documents
├── Has Many Notes
├── Has Many Tasks
├── Has Many Timeline Entries
├── Has Many Audit Logs
└── Has Many Staff Assignments

---

## Document

Document
│
├── Belongs To Applicant
├── Belongs To Document Type
└── Has Many Document Versions

---

## Workflow

Workflow
│
├── Belongs To Applicant
└── Has Many Workflow Stages

---

## Task

Task
│
├── Belongs To Applicant
└── Assigned To Staff

---

## Note

Note
│
├── Belongs To Applicant
└── Created By Staff

---

## Notification

Notification
│
└── Belongs To Staff or Applicant

# 27. White-Label Mapping

The backend always uses generic terminology.

Each Organization may configure frontend terminology to match its business.

| Backend Term | Education Consultancy | Recruitment Agency | Immigration Firm |
|--------------|-----------------------|--------------------|------------------|
| Applicant | Student | Candidate | Client |
| Staff | Consultant | Recruiter | Case Officer |
| Workflow | Admission Process | Hiring Process | Visa Process |
| Document | Student Document | Candidate Document | Immigration Document |
| Organization | Consultancy | Agency | Firm |

---

The backend never changes.

Only labels presented in the frontend are configurable.

This allows multiple industries to use the same platform.

# 28. Domain Rules

The following rules govern the business domain.

## Organization Rules

- Every Staff member belongs to exactly one Organization.
- Every Applicant belongs to exactly one Organization.
- Organizations cannot access each other's data.
- All resources are isolated by Organization.

---

## Staff Rules

- Every Staff member has exactly one Role.
- Staff permissions are inherited from Roles.
- Staff may manage multiple Applicants.

---

## Applicant Rules

- Applicants cannot self-register.
- Applicants are created by Staff.
- Every Applicant has one Portal Account.
- Applicants cannot access internal Notes.
- Applicants cannot access Audit Logs.

---

## Document Rules

- Documents belong to one Applicant.
- Documents are categorized by Document Type.
- Every replacement creates a new Document Version.
- Previous versions are retained.
- Approved documents become read-only.

---

## Workflow Rules

- Every Applicant has one active Workflow.
- Only one Workflow Stage may be active at a time.
- Completing one stage activates the next stage.

---

## Security Rules

- Passwords are hashed using Argon2.
- Authentication uses JWT.
- Authorization uses Role-Based Access Control (RBAC).
- Every sensitive action generates an Audit Log.
- Uploaded files are never publicly accessible.

---

## Task Rules

- Tasks belong to Applicants.
- Tasks are assigned to Staff.
- Completed Tasks remain in history.

# 29. Domain Design Principles

The domain model follows these architectural principles.

## Industry Neutral

Business entities remain generic.

Industry-specific terminology belongs only in the frontend.

---

## Configuration Over Customization

Organizations configure workflows, document types, branding, and terminology.

Backend logic remains unchanged.

---

## Security By Design

Sensitive data is protected through authentication, authorization, encryption, and auditing.

---

## Extensibility

Future features should be added by introducing new entities instead of modifying existing ones whenever possible.

---

## Separation of Concerns

Business entities remain independent of infrastructure.

Authentication, storage, notifications, and payments are external services accessed through provider interfaces.

---

## Scalability

The domain model is designed for:

- Multi-tenant SaaS
- White-label deployments
- Mobile applications
- Public APIs
- Third-party integrations

# 30. Future Domain Expansion

The following domains are intentionally excluded from the MVP but may be added later.

## Communication

- Chat
- Email Conversations
- SMS
- WhatsApp

---

## Payments

- Invoice
- Payment
- Refund
- Subscription

---

## Scheduling

- Appointment
- Calendar
- Interview
- Meeting

---

## CRM

- Leads
- Pipeline
- Opportunity
- Campaign

---

## Reporting

- Analytics
- KPIs
- Export
- BI Dashboard

---

## AI

- OCR
- Document Classification
- AI Recommendations
- AI Workflow Assistant

# 31. Summary

The Domain Model establishes the business foundation of the Document Workflow Platform.

It defines:

- Core business entities
- Relationships
- Responsibilities
- Business rules
- White-label architecture
- Multi-tenant readiness
- Security boundaries

This document serves as the reference for:

- Database Design
- Backend Modules
- REST APIs
- Frontend Pages
- Mobile Applications
- Future SaaS Expansion

All future implementation should remain consistent with the business rules defined in this document.