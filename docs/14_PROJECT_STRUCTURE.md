# 14_PROJECT_STRUCTURE.md

# Project Structure

**Project:** Document Workflow Platform

**Version:** 1.0

**Status:** Draft

**Last Updated:** June 2026

---

# 1. Purpose

This document defines the official project structure for the Document Workflow Platform.

A consistent project structure improves:

- Scalability
- Maintainability
- Developer Productivity
- Code Discoverability
- Team Collaboration
- Long-Term Growth

Every developer should follow this structure when adding new features.

---

# 2. Architecture Philosophy

The project follows a modular monorepo architecture.

Primary goals:

- Feature Isolation
- Shared Code
- Strong Type Safety
- Reusable Components
- Clear Dependency Flow

The project should remain easy to navigate regardless of its size.

---

## Core Principles

### Modular

Every feature lives within its own module.

---

### Reusable

Shared functionality belongs inside shared packages.

---

### Scalable

The project should support future expansion without major restructuring.

---

### Consistent

Every feature follows the same folder structure.

---

### Independent

Modules should minimize dependencies on one another.

---

# 3. Repository Structure

The project uses a monorepo managed with Turborepo.

```text
document-workflow-platform/

├── apps/
│
├── packages/
│
├── docs/
│
├── docker/
│
├── scripts/
│
├── .github/
│
├── .husky/
│
├── turbo.json
│
├── package.json
│
├── pnpm-workspace.yaml
│
└── README.md
```

---

## Repository Overview

### apps/

Contains runnable applications.

---

### packages/

Contains reusable packages shared across applications.

---

### docs/

Project documentation.

---

### docker/

Docker configurations.

---

### scripts/

Automation scripts.

---

### .github/

GitHub workflows and templates.

---

### .husky/

Git hooks.

---

# 4. Monorepo Layout

```text
apps/

├── web/
│
└── api/

packages/

├── ui/
├── types/
├── config/
├── eslint-config/
├── tsconfig/
├── api-client/
├── validation/
└── utils/
```

---

## Benefits

- Shared Types
- Shared Validation
- Shared UI
- Shared Configurations
- Faster Builds
- Easier Maintenance

---

# 5. Applications

## Web

```text
apps/web
```

Contains:

- Consultant Dashboard
- Applicant Portal
- Administrator Panel

---

## API

```text
apps/api
```

Contains:

- REST API
- Authentication
- Database
- Business Logic
- File Management

---

Future applications may include:

- Mobile App
- Analytics Dashboard
- Internal Admin Portal

---

# 6. Shared Packages

Packages contain reusable code shared across applications.

---

## ui

Reusable UI components.

Examples:

- Buttons
- Dialogs
- Cards
- Tables

---

## types

Shared TypeScript types.

Examples:

- User
- Applicant
- Document
- Workflow

---

## validation

Shared Zod schemas.

Examples:

- Login
- Applicant Creation
- Document Upload

---

## api-client

Shared API client.

Provides:

- Authentication
- Request Helpers
- API Hooks

---

## utils

Shared utility functions.

Examples:

- Date Formatting
- File Formatting
- Currency Formatting
- Validators

---

## config

Shared configuration.

Examples:

- Constants
- Roles
- Permissions
- Workflow Stages

---

## eslint-config

Shared ESLint configuration.

---

## tsconfig

Shared TypeScript configuration.

# 7. Frontend Structure

The frontend follows a Feature-Sliced Design (FSD) architecture to ensure scalability and maintainability.

```text
apps/web/

src/

├── app/
├── pages/
├── widgets/
├── features/
├── entities/
├── shared/
├── assets/
├── styles/
├── providers/
└── middleware/
```

---

## app/

Contains:

- Application Entry
- Global Layout
- Route Definitions
- Providers
- Metadata

---

## pages/

Contains route-level pages.

Examples:

```text
dashboard/

applicants/

documents/

settings/

auth/
```

Pages should remain lightweight.

Pages coordinate features rather than implement business logic.

---

## widgets/

Widgets combine multiple features into larger UI sections.

Examples:

- Dashboard Overview
- Applicant Overview
- Workflow Summary
- Recent Activity

Widgets should not contain business logic.

---

## features/

Features contain business functionality.

Examples:

```text
features/

authentication/

applicants/

documents/

workflow/

reports/

dashboard/

settings/
```

Each feature owns its:

- Components
- Hooks
- API Calls
- Validation
- Business Logic

---

## entities/

Entities represent business models.

Examples:

```text
Applicant

Document

Organization

Workflow

User
```

Each entity contains reusable business components and helper functions.

---

## shared/

Contains reusable code.

```text
shared/

ui/

hooks/

utils/

lib/

types/

constants/

config/

icons/
```

Business logic should never exist here.

---

## assets/

Contains static resources.

Examples:

- Images
- Logos
- Fonts
- SVG Icons

---

## styles/

Contains:

- Tailwind Base
- Global CSS
- Theme Variables

---

## providers/

Contains application providers.

Examples:

- Query Provider
- Theme Provider
- Authentication Provider

---

## middleware/

Contains:

- Authentication Middleware
- Permission Middleware
- Request Interceptors

---

# 8. Backend Structure

The backend follows a modular architecture.

```text
apps/api/

src/

├── modules/
├── common/
├── config/
├── database/
├── middleware/
├── providers/
├── jobs/
├── events/
├── queues/
└── main.ts
```

---

## modules/

Business modules.

Examples:

```text
authentication/

users/

organizations/

applicants/

documents/

workflow/

reports/

notifications/
```

Each module owns:

- Controller
- Service
- Repository
- DTOs
- Validators
- Tests

---

## common/

Shared backend functionality.

Examples:

- Exceptions
- Guards
- Decorators
- Pipes
- Utilities

---

## config/

Application configuration.

Examples:

- Database
- JWT
- Email
- Storage
- Environment

---

## database/

Contains:

- Prisma Schema
- Migrations
- Seed Scripts
- Database Client

---

## middleware/

Application middleware.

Examples:

- Logging
- Authentication
- Request Tracking

---

## providers/

External integrations.

Examples:

- Cloudflare R2
- Email Provider
- SMS Provider (Future)
- Notification Provider

---

## jobs/

Scheduled jobs.

Examples:

- Cleanup Expired Tokens
- Reminder Emails
- Backup Jobs

---

## events/

Domain events.

Examples:

- Applicant Created
- Document Uploaded
- Workflow Completed

---

## queues/

Background processing.

Examples:

- Email Queue
- File Processing
- Notification Queue
- Report Generation

---

# 9. Standard Feature Structure

Every feature should follow the same structure.

Frontend Example

```text
features/

applicants/

components/

hooks/

api/

schemas/

types/

utils/

constants/

index.ts
```

Backend Example

```text
modules/

applicants/

controller/

service/

repository/

dto/

entities/

validators/

tests/

index.ts
```

Consistency is more important than personal preference.

---

# 10. Dependency Rules

Dependencies should flow in only one direction.

Frontend

```text
Page

↓

Widget

↓

Feature

↓

Entity

↓

Shared
```

Allowed

```
Page → Feature

Feature → Entity

Entity → Shared
```

Not Allowed

```
Shared → Feature

Entity → Widget

Feature → Page
```

---

Backend

```text
Controller

↓

Service

↓

Repository

↓

Database
```

Never allow:

```text
Controller

↓

Database
```

All business logic belongs inside services.

---

# 11. Component Placement Rules

Choose the correct location based on reuse.

### Shared UI

Place reusable visual components in:

```text
shared/ui
```

Examples:

- Button
- Card
- Input
- Modal
- Badge

---

### Entity Components

Place business entity components in:

```text
entities/
```

Examples:

- ApplicantCard
- UserAvatar
- WorkflowStatusBadge

---

### Feature Components

Place feature-specific UI in:

```text
features/
```

Examples:

- CreateApplicantForm
- UploadDocumentDialog
- AssignConsultantModal

---

### Widgets

Widgets combine multiple entities and features into complete sections.

Examples:

- DashboardOverview
- ApplicantSummary
- WorkflowDashboard

# 12. API Folder Structure

The backend API should be organized by business modules rather than technical layers.

Every module should own its complete implementation.

---

## Standard Module Structure

```text
modules/

applicants/

├── controller/
│   └── applicants.controller.ts
│
├── service/
│   └── applicants.service.ts
│
├── repository/
│   └── applicants.repository.ts
│
├── dto/
│   ├── create-applicant.dto.ts
│   ├── update-applicant.dto.ts
│   └── applicant-response.dto.ts
│
├── validators/
│   └── applicant.validator.ts
│
├── entities/
│   └── applicant.entity.ts
│
├── mapper/
│   └── applicant.mapper.ts
│
├── policies/
│   └── applicant.policy.ts
│
├── tests/
│
├── applicants.module.ts
│
└── index.ts
```

---

## API Design Rules

Every endpoint should follow:

```text
Controller

↓

Service

↓

Repository

↓

Database
```

Business logic should never exist inside controllers.

Repositories should never contain validation logic.

---

## Shared API Code

Shared functionality belongs in:

```text
common/

├── decorators/
├── exceptions/
├── filters/
├── guards/
├── interceptors/
├── middleware/
├── pipes/
├── validators/
├── logger/
└── utils/
```

Avoid duplicating shared logic across modules.

---

# 13. Database Folder Structure

Database-related files should remain centralized.

```text
database/

├── prisma/
│
│   ├── schema.prisma
│   ├── migrations/
│   ├── seed.ts
│   └── prisma.service.ts
│
├── factories/
│
├── fixtures/
│
├── scripts/
│
└── backups/
```

---

## Responsibilities

### schema.prisma

Defines all database models.

---

### migrations/

Contains version-controlled schema changes.

---

### seed.ts

Creates default application data.

Examples:

- Administrator
- Roles
- Permissions
- Workflow Templates
- Document Types

---

### factories/

Creates fake data for testing.

---

### fixtures/

Stores reusable testing datasets.

---

### scripts/

Contains database utilities.

Examples:

- Reset Database
- Import Data
- Export Data

---

# 14. Configuration Files

Configuration should never be scattered throughout the project.

---

## Shared Configuration

```text
config/

├── app.config.ts
├── auth.config.ts
├── database.config.ts
├── storage.config.ts
├── email.config.ts
├── queue.config.ts
├── cache.config.ts
└── validation.config.ts
```

---

## Rules

Configuration files should:

- Read environment variables
- Validate required values
- Export typed configuration
- Never contain business logic

---

# 15. Assets

Static assets belong inside the frontend application.

```text
assets/

├── images/
├── icons/
├── illustrations/
├── logos/
├── fonts/
└── favicon/
```

---

## Naming

Examples:

```
logo.svg

empty-documents.svg

user-placeholder.png

upload-icon.svg
```

Avoid filenames such as:

```
image1.png

newlogo.png

icon-final.svg
```

---

# 16. Environment Variables

Environment variables should remain outside the source code.

---

## Structure

```text
.env

.env.local

.env.development

.env.test

.env.production

.env.example
```

---

## Rules

Never commit:

- Production Secrets
- API Keys
- JWT Secrets
- Database Passwords

Only `.env.example` should be committed to the repository.

---

## Validation

Environment variables should be validated during application startup.

The application should fail fast if required variables are missing.

---

# 17. Testing Folder Structure

Tests should be located close to the code they verify.

Frontend

```text
features/

documents/

tests/
```

Backend

```text
modules/

documents/

tests/
```

---

## Test Categories

```text
tests/

unit/

integration/

e2e/

fixtures/
```

---

## Naming

Examples:

```
documents.service.spec.ts

applicants.controller.spec.ts

login.e2e.spec.ts
```

Use consistent naming across the project.

---

# 18. Documentation Folder

Project documentation should remain inside a dedicated directory.

```text
docs/

00_PROJECT_OVERVIEW.md

01_PRODUCT_REQUIREMENTS.md

...

14_PROJECT_STRUCTURE.md

README.md

CHANGELOG.md

CONTRIBUTING.md
```

---

## Rules

Documentation should be updated whenever:

- New Features
- Architecture Changes
- Database Changes
- API Changes
- Deployment Changes

Documentation is considered part of the application, not an afterthought.

# 19. Git Branch Strategy

A consistent branching strategy improves collaboration and simplifies releases.

The project follows a simplified Git Flow model.

---

## Permanent Branches

### main

Production-ready code.

Rules:

- Protected branch
- Requires Pull Request
- All CI checks must pass
- Direct commits are prohibited

---

### develop

Primary development branch.

All completed features are merged into `develop` before being promoted to `main`.

---

## Temporary Branches

### Feature Branches

Format

```text
feature/<feature-name>
```

Examples

```text
feature/applicant-management

feature/document-upload

feature/authentication
```

---

### Bug Fix Branches

Format

```text
bugfix/<issue-name>
```

Examples

```text
bugfix/login-error

bugfix/upload-timeout
```

---

### Hotfix Branches

For urgent production issues.

Format

```text
hotfix/<issue-name>
```

Example

```text
hotfix/security-patch
```

Hotfixes should be merged into both `main` and `develop`.

---

## Branch Protection Rules

The `main` branch should require:

- Pull Request
- Passing CI Checks
- Code Review Approval
- Up-to-Date Branch
- No Merge Conflicts

---

# 20. Code Ownership

Each business module should have an assigned owner.

Ownership improves:

- Accountability
- Code Quality
- Faster Reviews

---

## Example

| Module | Owner |
|----------|--------|
| Authentication | Backend Team |
| Applicants | Backend + Frontend |
| Documents | Backend + Frontend |
| Workflow | Backend + Frontend |
| Dashboard | Frontend |
| Infrastructure | DevOps |

---

## Responsibilities

Owners are responsible for:

- Code Reviews
- Refactoring
- Documentation
- Performance
- Security
- Architecture Decisions

---

# 21. Dependency Rules

Dependencies should remain predictable.

---

## Allowed

Frontend

```text
Page

↓

Widget

↓

Feature

↓

Entity

↓

Shared
```

Backend

```text
Controller

↓

Service

↓

Repository

↓

Database
```

---

## Not Allowed

Frontend

```text
Shared

↓

Feature
```

Shared code must never depend on business features.

---

Backend

```text
Repository

↓

Controller
```

Dependencies should always point downward.

---

## Third-Party Libraries

Before introducing a new dependency, evaluate:

- Maintenance
- Community Adoption
- Security
- Bundle Size
- Performance
- License Compatibility

Avoid adding libraries for functionality that can be implemented with existing project dependencies.

---

# 22. Import Rules

Imports should remain clean and predictable.

---

## Import Order

```text
Node Modules

↓

Shared Packages

↓

Internal Modules

↓

Relative Imports
```

---

## Example

```typescript
import { useQuery } from "@tanstack/react-query";

import { Button } from "@repo/ui";

import { ApplicantCard } from "@/features/applicants";

import "./styles.css";
```

---

## Relative Imports

Avoid deeply nested imports.

Avoid:

```text
../../../../components
```

Prefer path aliases.

Example

```text
@/features

@/shared

@/entities
```

---

# 23. File Naming Rules

Consistency improves discoverability.

---

## Components

Use PascalCase.

Examples

```text
ApplicantCard.tsx

WorkflowStepper.tsx

StatusBadge.tsx
```

---

## Hooks

Use camelCase with the `use` prefix.

Examples

```text
useApplicant.ts

useDocuments.ts

useWorkflow.ts
```

---

## Utilities

Use camelCase.

Examples

```text
formatDate.ts

generateFileName.ts

validatePassword.ts
```

---

## Types

Use PascalCase.

Examples

```text
Applicant.ts

Workflow.ts

UserRole.ts
```

---

## Tests

Use the `.spec.ts` naming convention.

Examples

```text
applicant.service.spec.ts

document-upload.e2e.spec.ts
```

---

# 24. Barrel Exports

Barrel exports simplify imports and improve developer experience.

---

## Example

```text
features/

applicants/

index.ts
```

```typescript
export * from "./components";
export * from "./hooks";
export * from "./api";
```

---

## Benefits

- Cleaner Imports
- Better Discoverability
- Easier Refactoring
- Consistent Module Boundaries

Avoid excessively large barrel files that export unrelated modules.

---

# 25. Future Microservices

The MVP is intentionally designed as a modular monolith.

As the platform grows, individual modules can be extracted into independent services.

Potential future services include:

- Authentication Service
- Document Service
- Notification Service
- Reporting Service
- Analytics Service
- File Processing Service

This approach allows the team to defer the operational complexity of microservices until there is a clear business need.

---

## Migration Strategy

Any future extraction should preserve:

- Shared Contracts
- Shared Types
- API Compatibility
- Database Integrity

The modular architecture defined in this document is intended to make these transitions straightforward.

---

# 26. Project Structure Summary

The Document Workflow Platform adopts a scalable, modular monorepo architecture built around clear separation of concerns and predictable dependency management.

Key architectural decisions include:

- Turborepo Monorepo
- Next.js Frontend
- NestJS Backend
- Feature-Sliced Design (Frontend)
- Modular Architecture (Backend)
- Shared Packages
- Strict Dependency Rules
- Path Aliases
- Barrel Exports
- Typed Configuration
- Standardized Feature Structure
- Co-located Tests
- Shared Documentation

By following this structure, the project will remain maintainable as it grows from an MVP into a production-grade SaaS platform, enabling faster onboarding, consistent development practices, and easier long-term evolution.

---

# End of Document