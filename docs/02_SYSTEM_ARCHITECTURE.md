# 02_SYSTEM_ARCHITECTURE.md

# System Architecture

**Project:** Document Workflow Platform

**Version:** 1.0

**Status:** Draft

**Last Updated:** June 2026

---

# 1. Purpose

## Overview

This document defines the overall technical architecture of the Document Workflow Platform.

Its purpose is to establish a clear, scalable, and maintainable technical foundation before implementation begins.

The platform is being developed as a **white-label Software-as-a-Service (SaaS)** solution that enables organizations to securely manage applicants, documents, workflows, and communications through a centralized platform.

Although the initial MVP targets a single organization, every architectural decision should support future evolution into a multi-tenant SaaS platform with minimal refactoring.

This document serves as the primary technical reference for software developers, architects, and future contributors throughout the project's lifecycle.

---

## Objectives

The architecture aims to:

* Establish a consistent technical direction.
* Define project-wide architectural standards.
* Reduce technical debt during development.
* Separate business logic from infrastructure.
* Support secure handling of sensitive documents.
* Enable future mobile applications.
* Support white-label customization.
* Allow seamless migration from local development to cloud deployment.
* Minimize vendor lock-in.
* Ensure long-term maintainability and scalability.

---

## Intended Audience

This document is intended for:

* Software Architects
* Backend Developers
* Frontend Developers
* DevOps Engineers
* QA Engineers
* Future Contributors

---

## Related Documents

This architecture document should be read together with:

* `00_MVP.md`
* `01_PRODUCT_VISION.md`
* `03_DEVELOPMENT_GUIDE.md`
* `04_DOMAIN_MODEL.md`
* `05_DATABASE_DESIGN.md`
* `06_API_SPECIFICATION.md`

---

# 2. Scope

This document defines the high-level architecture of the platform and establishes the technical decisions required for MVP development while ensuring future scalability.

The document covers:

* Overall system architecture
* Architectural principles
* Technology strategy
* Development environments
* Monorepo architecture
* Backend architecture
* Authentication architecture
* Authorization model
* Provider architecture
* Deployment strategy
* Scalability strategy

The following topics are intentionally excluded and documented separately:

* Database schema
* API endpoints
* UI design
* Business workflows
* Testing strategy
* CI/CD implementation
* Infrastructure provisioning

---

## MVP Scope

The MVP is designed to validate the product with a real organization while minimizing development complexity.

The MVP includes:

* Staff authentication
* Applicant portal authentication
* Applicant management
* Document upload and management
* Workflow tracking
* Dashboard
* Timeline
* Organization settings
* Audit logging
* Email notifications
* White-label branding (basic)

Future features such as payments, messaging, appointment scheduling, AI document verification, and mobile applications are outside the MVP scope but are considered during architectural planning.

---

# 3. Architecture Goals

The architecture is designed around the following core objectives.

---

## 3.1 Simplicity

The MVP should solve the primary business problem using the simplest architecture possible.

Unnecessary abstractions, premature optimization, and excessive infrastructure should be avoided until supported by real business requirements.

The initial implementation will use a modular monolith rather than microservices to reduce operational complexity while maintaining clear separation of concerns.

---

## 3.2 Maintainability

The project should remain understandable and maintainable by developers joining the project at any stage.

To achieve this:

* Business domains are isolated into independent modules.
* Shared functionality is centralized.
* Coding standards are consistent across applications.
* Folder structures remain predictable.
* Business logic is separated from infrastructure.

---

## 3.3 Scalability

Although the MVP targets a single organization, the architecture must support future growth without requiring significant redesign.

Future capabilities include:

* Multi-tenancy
* White-label deployments
* Mobile applications
* Public APIs
* Third-party integrations
* Multiple storage providers
* Horizontal scaling
* Background job processing

Every major architectural decision should facilitate this evolution.

---

## 3.4 Security

The platform stores highly sensitive information, including:

* National Identification Documents
* Passports
* Academic Certificates
* Curriculum Vitae (CV)
* Employment Documents
* Visa Documents
* Other confidential files

Security is therefore treated as a foundational architectural concern rather than an optional feature.

The system should provide:

* Secure authentication
* Role-based authorization
* Encrypted communication
* Secure password storage
* Protected file access
* Audit logging
* Input validation
* Secure file uploads

---

## 3.5 Flexibility

External services should never be tightly coupled to business logic.

The architecture should support replacing infrastructure providers through configuration rather than code changes.

Examples include:

* File Storage Providers
* Email Providers
* Notification Providers
* Payment Providers

This approach minimizes vendor lock-in and simplifies future migrations.

---

## 3.6 White-Label Readiness

The platform is designed as a white-label solution capable of serving multiple industries.

The backend should remain industry-neutral while allowing organizations to customize terminology and branding.

For example:

| Backend Entity | Organization Display |
| -------------- | -------------------- |
| Applicant      | Student              |
| Applicant      | Candidate            |
| Applicant      | Client               |
| Staff          | Consultant           |
| Staff          | Recruiter            |
| Staff          | HR Officer           |

This approach enables a single backend architecture to support multiple business domains.

---

## 3.7 Local Development First

Development should not require paid cloud services.

The entire platform must be runnable locally using free development tools.

Local development will include:

* Docker
* PostgreSQL
* Local file storage
* Mailpit
* Local environment variables

Cloud infrastructure will only be introduced during pilot deployment.

---

## 3.8 API First

All clients interact with the backend exclusively through REST APIs.

This ensures consistent business logic across:

* Web Application
* Future Mobile Applications
* Third-Party Integrations
* Internal Services

The backend acts as the single source of truth for all business operations.

---

## 3.9 Consultant-Driven Onboarding

Applicants are not required to create accounts or complete a registration process.

Instead:

1. A staff member creates the applicant profile.
2. The system automatically provisions the applicant portal account.
3. A temporary password is generated.
4. An invitation email is sent to the applicant.
5. The applicant logs in.
6. The applicant changes their password on first login.

This workflow reflects how education consultancies, recruitment agencies, and similar organizations operate while reducing onboarding friction for applicants.

---

## 3.10 Cloud-Native Evolution

Although the MVP begins as a locally hosted application, the architecture should support a smooth transition to cloud infrastructure.

The migration path is:

Local Development

↓

Pilot Deployment

↓

Production SaaS

No major architectural redesign should be required during this evolution.

# 4. Guiding Principles

The following architectural principles guide every technical decision made throughout the project lifecycle.

These principles help ensure the platform remains scalable, maintainable, secure, and adaptable as it evolves from an MVP into a commercial SaaS product.

---

## Principle 1 — Build the Simplest Product That Solves the Problem

The primary objective of the MVP is to validate the product with real organizations.

Features that do not directly contribute to solving the core business problem should be postponed until validated by customer feedback.

The platform should prioritize:

* Simplicity
* Readability
* Maintainability
* Developer productivity

Premature optimization should be avoided.

---

## Principle 2 — Local Development First

Developers should be able to build and run the entire platform without requiring cloud infrastructure.

Local development will use:

* Docker
* PostgreSQL
* Local File Storage
* Mailpit
* Environment Variables

Cloud services should only be introduced when deploying the pilot version.

---

## Principle 3 — Cloud Agnostic

Business logic must never depend directly on cloud providers.

External services should always be accessed through provider interfaces.

Examples include:

* Storage Provider
* Email Provider
* Notification Provider
* Payment Provider

This approach allows infrastructure to evolve independently of business logic.

---

## Principle 4 — API First

Every feature should be exposed through the REST API.

The backend is the single source of truth.

Current client:

* Web Application

Future clients:

* Mobile Application
* Public API
* Third-Party Integrations

---

## Principle 5 — Domain-Oriented Architecture

The system should be organized around business domains rather than technical layers.

Core domains include:

* Authentication
* Organizations
* Staff
* Applicants
* Portal Accounts
* Documents
* Workflow
* Timeline
* Notifications
* Dashboard
* Settings

Each domain owns its own business rules and APIs.

---

## Principle 6 — Generic Business Language

The backend uses industry-neutral terminology.

Core entities include:

* Organization
* Staff
* Applicant
* Portal Account
* Workflow
* Document

Industry-specific terms such as:

* Student
* Candidate
* Client
* Employee

should only appear in frontend branding and organization settings.

---

## Principle 7 — Security by Design

Security is a core architectural requirement.

The platform must protect sensitive applicant information through:

* Authentication
* Authorization
* Secure password hashing
* HTTPS
* Audit logging
* Secure document storage
* Input validation
* Role-based access control

Security should never be considered optional.

---

## Principle 8 — Configuration Over Customization

Organizations should configure platform behavior instead of requiring custom software development.

Examples include:

* Branding
* Logo
* Color Theme
* Terminology
* Workflow Stages
* Document Types

Configuration increases flexibility while reducing maintenance costs.

---

## Principle 9 — Consultant-Driven Onboarding

Applicants do not create their own accounts.

Instead:

* Staff creates the applicant profile.
* The system automatically creates a portal account.
* A temporary password is generated.
* The applicant receives an invitation email.
* The applicant changes their password on first login.

This workflow reflects the operational processes of education consultancies, recruitment agencies, immigration firms, and similar organizations.

---

# 5. High-Level Architecture

The MVP follows a modern three-tier architecture.

```text
                    Browser

                        │

                        ▼

              Next.js Web Application

                        │

                  HTTPS / REST API

                        │

                        ▼

                NestJS Backend API

                        │

        ┌───────────────┼─────────────────┐

        ▼               ▼                 ▼

   PostgreSQL      File Storage      Email Provider
```

---

## Architecture Layers

### Presentation Layer

Implemented using Next.js.

Responsibilities:

* User Interface
* Form Validation
* Authentication
* Dashboard
* Applicant Portal
* Staff Portal

The frontend communicates exclusively through the REST API.

---

### Application Layer

Implemented using NestJS.

Responsibilities:

* Authentication
* Business Logic
* Validation
* Authorization
* File Processing
* Workflow Management
* Notifications

The backend contains all business rules.

---

### Data Layer

Responsible for persistence.

Includes:

* PostgreSQL Database
* File Storage Provider

The application layer is the only component allowed to communicate with the data layer.

---

## User Types

The platform supports two authenticated user categories.

### Staff

Internal organization users.

Examples:

* Consultant
* Recruiter
* HR Officer
* Administrator

Staff members access the management portal.

---

### Applicants

Applicants access their own secure portal.

Applicants:

* Do not register.
* Are invited by staff.
* Receive system-generated credentials.
* Can only access their own data.

---

## Data Flow

```text
Applicant

↓

Next.js

↓

REST API

↓

Business Module

↓

Database

↓

Response

↓

Applicant Dashboard
```

The frontend never communicates directly with the database.

---

# 6. Environment Strategy

The platform evolves through three environments.

---

## Development Environment

Purpose:

Enable free and fast local development.

Infrastructure:

* Docker
* PostgreSQL
* Local File Storage
* Mailpit
* Local Environment Variables

Characteristics:

* Zero cloud cost
* Fast startup
* Easy debugging
* Offline development

Primary Goal:

Developer productivity.

---

## Pilot Environment

Purpose:

Deploy the application to a real organization for validation.

Infrastructure:

Frontend

* Vercel

Backend

* Railway or Render

Database

* Neon PostgreSQL

Storage

* Cloudflare R2

Email

* Amazon SES or Resend

Characteristics:

* Production HTTPS
* Secure backups
* Real email delivery
* Cloud object storage

Primary Goal:

Validate the MVP with real users.

---

## Production SaaS

Purpose:

Operate as a commercial multi-tenant SaaS platform.

Infrastructure:

Frontend

* Vercel

Backend

* AWS ECS / Kubernetes

Database

* Managed PostgreSQL

Storage

* Amazon S3 or Cloudflare R2

Email

* Amazon SES

Monitoring

* Grafana
* Prometheus
* Sentry

Characteristics:

* Multi-tenancy
* White-label branding
* Horizontal scaling
* Automatic backups
* Disaster recovery
* High availability

Primary Goal:

Support multiple organizations securely and reliably.

---

## Environment Evolution

```text
Development

↓

Pilot

↓

Production SaaS
```

Each environment builds upon the previous one.

The platform should transition between environments through configuration changes rather than architectural redesign.

This approach minimizes migration effort and allows the product to scale progressively as adoption grows.

# 7. Technology Stack

The MVP is built using a modern TypeScript-based technology stack.

The primary goals of the selected technologies are:

* Developer productivity
* Type safety
* Scalability
* Strong community support
* Low operational cost
* Easy cloud migration

---

## Frontend

### Framework

**Next.js**

Reason:

* Production-ready React framework
* Server-side rendering support
* Excellent developer experience
* Future mobile API compatibility

---

### Language

**TypeScript**

Reason:

* Static typing
* Better maintainability
* Shared types with backend
* Improved IDE support

---

### UI Framework

**Tailwind CSS**

Reason:

* Rapid UI development
* Consistent design system
* Easy white-label customization
* Small production bundle

---

### State Management

For the MVP:

* React Context
* TanStack Query

Future:

* Zustand (if application complexity increases)

---

### Form Management

* React Hook Form
* Zod Validation

---

## Backend

### Framework

**NestJS**

Reason:

* Modular architecture
* Dependency Injection
* Excellent TypeScript support
* Enterprise-grade architecture

---

### Language

TypeScript

---

### ORM

Prisma ORM

Reason:

* Type-safe database access
* Automatic migrations
* Excellent PostgreSQL support

---

### Authentication

* JWT Access Tokens
* Refresh Tokens
* Argon2 Password Hashing

---

### Validation

* Zod
* NestJS ValidationPipe

---

## Database

PostgreSQL

Reason:

* Open source
* ACID compliant
* Excellent performance
* Mature ecosystem

Development:

Docker PostgreSQL

Pilot:

Neon PostgreSQL

Production:

AWS RDS PostgreSQL

---

## File Storage

Development

Local Storage

Pilot

Cloudflare R2

Production

Amazon S3

Storage access is abstracted through the Storage Provider interface.

---

## Email

Development

Mailpit

Pilot

Amazon SES or Resend

Production

Amazon SES

---

## Monitoring

Future Production

* Sentry
* Grafana
* Prometheus

Monitoring is outside MVP scope.

---

## Containerization

Docker

Used for:

* PostgreSQL
* Mailpit
* Local Development
* Future Redis

---

## Version Control

Git

Repository:

GitHub

Branch Strategy

* main
* develop
* feature/*
* hotfix/*

---

## Package Manager

pnpm

Reason:

* Faster installs
* Efficient disk usage
* Native Turborepo support

---

## Monorepo Tool

Turborepo

Reason:

* Shared packages
* Shared configuration
* Incremental builds
* Future scalability

---

# 8. Project Structure

## Monorepo Architecture

The platform uses a Turborepo monorepo.

This allows all applications, packages, documentation, and infrastructure to be managed from a single repository while maintaining clear separation of concerns.

Benefits include:

* Shared TypeScript types
* Shared UI components
* Shared configuration
* Faster builds
* Easier testing
* Simplified dependency management
* Better CI/CD support

---

## Repository Structure

```text
document-workflow-platform/

├── apps/
│   ├── web/
│   └── api/
│
├── packages/
│   ├── ui/
│   ├── types/
│   ├── config/
│   ├── utils/
│   ├── eslint-config/
│   └── tsconfig/
│
├── docs/
│
├── docker/
│
├── scripts/
│
├── .github/
│
├── package.json
├── turbo.json
├── pnpm-workspace.yaml
└── README.md
```

---

## Applications

### apps/web

The primary web application.

Responsibilities:

* Staff Authentication
* Applicant Authentication
* Staff Dashboard
* Applicant Dashboard
* Applicant Management
* Document Upload
* Workflow Management
* White-Label Branding
* Organization Settings

Technology

* Next.js
* React
* Tailwind CSS
* TypeScript

---

### apps/api

REST API built with NestJS.

Responsibilities:

* Business Logic
* Authentication
* Authorization
* Applicant Management
* Portal Accounts
* Document Management
* Workflow Engine
* Timeline
* Notifications

Technology

* NestJS
* Prisma
* PostgreSQL

---

## Shared Packages

Shared packages contain reusable code used by multiple applications.

Business logic must never exist inside shared packages.

---

### packages/ui

Reusable UI components.

Examples:

* Buttons
* Inputs
* Dialogs
* Tables
* Layout Components

---

### packages/types

Shared TypeScript interfaces.

Examples:

* Applicant
* Staff
* Organization
* Document
* Workflow
* API Responses

---

### packages/config

Shared application configuration.

Examples:

* Constants
* Environment Variables
* Feature Flags

---

### packages/utils

Shared utility functions.

Examples:

* Date Helpers
* File Helpers
* Validation Helpers
* Formatting Utilities

---

### packages/eslint-config

Shared linting rules.

---

### packages/tsconfig

Shared TypeScript configuration.

---

## Documentation

Project documentation lives inside:

```text
docs/
```

Every architectural decision must be reflected in the documentation before implementation.

Documentation is considered part of the source code.

---

## Infrastructure

Infrastructure configuration is stored in:

```text
docker/
```

Examples:

* PostgreSQL
* Mailpit
* Docker Compose
* Future Redis

Infrastructure must remain reproducible across all developer environments.

---

## Scripts

Automation scripts are stored in:

```text
scripts/
```

Examples:

* Database Seed
* Backup Scripts
* Deployment Helpers
* Code Generation
* Maintenance Tasks

---

## Repository Rules

1. Applications belong in `apps/`.

2. Shared code belongs in `packages/`.

3. Documentation belongs in `docs/`.

4. Infrastructure belongs in `docker/`.

5. Scripts belong in `scripts/`.

6. Applications never import from other applications.

7. Applications may import only shared packages.

8. Business logic belongs only inside the API.

---

## Dependency Architecture

```text
                 Browser
                    │
                    ▼
              apps/web
                    │
           HTTP / REST API
                    │
                    ▼
              apps/api
               /      \
              ▼        ▼
       packages/*   PostgreSQL

packages/*
    │
    ▼
Shared Components & Utilities
```

The frontend communicates with the backend **only through HTTP APIs**.

No application directly imports code from another application.

This separation allows the web application to be replaced by a future mobile application without affecting the backend.

---

## Future Expansion

The repository structure supports future applications without significant restructuring.

```text
apps/

├── web/
├── api/
├── mobile/
├── admin/
└── worker/

packages/

├── ui/
├── auth/
├── types/
├── config/
├── logger/
└── utils/
```

This structure enables the platform to grow into a full SaaS ecosystem while maintaining a clean and modular architecture.

# 9. Backend Architecture

## Architectural Style

The backend follows a **Modular Monolith** architecture built with **NestJS**.

For the MVP, the application is deployed as a single service while maintaining clear module boundaries.

This approach provides:

* Simple deployment
* Easier debugging
* Lower infrastructure cost
* Clear separation of business domains
* Future migration path to microservices if required

The backend is organized around business capabilities rather than technical layers.

---

## Backend Architecture Overview

```text
                          NestJS API

                               │

        ┌──────────────────────┼──────────────────────┐

        ▼                      ▼                      ▼

     Business Modules      Common Layer      Infrastructure Layer
```

Business logic remains isolated inside feature modules.

Infrastructure concerns such as storage and email are accessed through provider interfaces.

---

# Core Business Modules

## Auth Module

Responsibilities:

* Staff Login
* Applicant Login
* JWT Authentication
* Refresh Tokens
* Password Reset
* Session Management
* Role-Based Access Control (RBAC)

The Auth Module is responsible only for authentication and authorization.

It should never contain business logic.

---

## Organization Module

Responsibilities:

* Organization Profile
* White-label Branding
* Organization Settings
* Configuration
* Subscription (Future)

Although the MVP supports a single organization, every major entity should reference an `organizationId` to simplify future multi-tenancy.

---

## Staff Module

Responsibilities:

* Staff Management
* Staff Roles
* Staff Permissions
* Staff Profiles
* Password Management

Staff are internal users of the platform.

Examples include:

* Consultant
* Recruiter
* HR Officer
* Admissions Officer
* Administrator

---

## Applicant Module

Responsibilities:

* Create Applicant
* Update Applicant
* Search Applicants
* Archive Applicants
* Applicant Profile
* Applicant Information

Applicants represent the business entity being managed.

The Applicant module does **not** handle authentication.

---

## Portal Account Module

Responsibilities:

* Create Portal Account
* Generate Temporary Password
* First Login Password Change
* Password Reset
* Account Status
* Invitation Email

Portal Accounts provide authenticated access for applicants.

Authentication logic remains inside the Auth Module, while lifecycle management belongs to the Portal Account Module.

---

## Document Module

Responsibilities:

* Upload Documents
* Replace Documents
* Download Documents
* Approve Documents
* Reject Documents
* Document Metadata
* File Validation

Documents are stored through the Storage Provider rather than directly on the server.

---

## Workflow Module

Responsibilities:

* Workflow Stages
* Status Updates
* Progress Tracking
* Required Documents
* Business Rules

Workflow definitions should be configurable to support different organizations.

---

## Timeline Module

Responsibilities:

Automatically record significant system events.

Examples:

* Applicant Created
* Portal Account Created
* Invitation Sent
* Password Changed
* Document Uploaded
* Document Approved
* Document Rejected
* Workflow Updated

Timeline records provide transparency and auditability.

---

## Dashboard Module

Responsibilities:

* Dashboard Statistics
* Recent Activity
* Pending Tasks
* Workflow Summary
* Applicant Counts

The Dashboard module aggregates data but does not contain business logic.

---

## Notification Module

Responsibilities:

* Email Notifications
* In-App Notifications
* Future Push Notifications
* Future SMS Notifications

All notifications should be delivered through provider interfaces.

---

## Settings Module

Responsibilities:

* Organization Settings
* Branding
* Workflow Configuration
* Document Configuration
* User Preferences

Settings should be configurable without requiring code changes.

---

# Module Structure

Every business module follows the same internal structure.

```text
modules/applicants/

├── controllers/
├── services/
├── repositories/
├── dto/
├── entities/
├── validators/
├── interfaces/
├── tests/
└── applicants.module.ts
```

Consistent structure improves maintainability and developer onboarding.

---

# Common Layer

The Common Layer contains reusable infrastructure shared across modules.

Examples:

* Guards
* Pipes
* Filters
* Decorators
* Exceptions
* Pagination
* Constants
* Utilities

Business logic must never exist in the Common Layer.

---

# Provider Layer

External services are isolated behind provider interfaces.

Examples:

* Storage Provider
* Email Provider
* Notification Provider
* Payment Provider

Business modules communicate only through interfaces.

This prevents vendor lock-in.

---

# Dependency Rules

The following architectural rules must always be respected.

* Controllers never communicate with other controllers.
* Modules communicate only through services.
* Repositories never access another module's repository.
* Business logic belongs only inside services.
* Infrastructure is accessed only through providers.
* Shared code belongs only in the Common Layer.

---

# 10. Authentication & Authorization

## Authentication Model

The platform supports two authenticated user categories.

### Staff

Staff accounts are created by Organization Administrators.

Authentication requires:

* Email
* Password

After successful authentication:

* JWT Access Token
* Refresh Token

are issued.

Staff access the internal management portal.

---

### Applicants

Applicants do not create accounts.

Instead:

1. Staff creates the Applicant.
2. The system creates a Portal Account.
3. A secure temporary password is generated.
4. An invitation email is sent.
5. Applicant logs in.
6. Applicant changes password.
7. Applicant accesses the Applicant Portal.

This workflow aligns with the operational model of education consultancies, recruitment agencies, immigration firms, and similar organizations.

---

# Applicant Onboarding Flow

```text
Staff

↓

Create Applicant

↓

System Creates Portal Account

↓

Generate Temporary Password

↓

Send Invitation Email

↓

Applicant Login

↓

Mandatory Password Change

↓

Applicant Dashboard
```

---

# Authorization

The platform uses Role-Based Access Control (RBAC).

---

## Organization Administrator

Permissions:

* Manage Organization
* Manage Staff
* Manage Roles
* Configure Settings
* Access Reports
* View Audit Logs

---

## Staff

Permissions:

* Manage Applicants
* Manage Documents
* Manage Workflow
* Review Documents
* Request Additional Documents
* Reset Applicant Password
* View Dashboard

---

## Applicant

Permissions:

* Access Personal Dashboard
* Upload Documents
* Replace Documents
* View Timeline
* View Workflow Status
* Update Limited Profile Information

Applicants may only access their own records.

---

# Security Principles

The platform is designed around security by default.

Key requirements include:

* Argon2 password hashing
* JWT authentication
* Refresh token rotation
* HTTPS-only communication
* Secure HTTP-only cookies (where applicable)
* Input validation
* File type validation
* File size validation
* Audit logging
* Principle of Least Privilege

---

# Password Policy

Staff Passwords

* Minimum 12 characters
* Strong password requirements
* Password reset via email

Applicant Passwords

* System-generated temporary password
* Mandatory password change on first login
* Password reset via verified email

Staff members must never know or retrieve applicant passwords.

---

# File Access Security

Uploaded documents are protected through authorization checks.

Rules:

* Staff may access applicants belonging to their organization.
* Applicants may access only their own documents.
* Direct file URLs must never be publicly accessible.
* File downloads should use secure signed URLs when cloud storage is introduced.

---

# Audit Logging

The system records all security-sensitive activities.

Examples include:

* Login
* Logout
* Failed Login
* Password Reset
* Password Change
* Applicant Creation
* Portal Account Creation
* Document Upload
* Document Approval
* Document Rejection
* Workflow Changes

Audit logs should be immutable and retained according to the organization's data retention policy.

---

# Authentication Lifecycle

```text
Administrator
        │
        ▼
Creates Staff
        │
        ▼
Staff Login
        │
        ▼
Creates Applicant
        │
        ▼
System Creates Portal Account
        │
        ▼
Invitation Email
        │
        ▼
Applicant Login
        │
        ▼
Password Change
        │
        ▼
Applicant Dashboard
```

This authentication model minimizes onboarding friction for applicants while maintaining strong security and aligning with the operational workflows of organizations using the platform.
