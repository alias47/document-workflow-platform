# 08_BACKEND_ARCHITECTURE.md

# Backend Architecture

**Project:** Document Workflow Platform

**Version:** 1.0

**Status:** Draft

**Last Updated:** June 2026

---

# 1. Purpose

This document defines the backend architecture of the Document Workflow Platform.

It establishes the engineering standards, project organization, implementation patterns, and development principles for all backend services.

The backend is responsible for:

- Business logic
- Authentication
- Authorization
- Workflow processing
- File management
- Notifications
- Data persistence
- API delivery

This document serves as the implementation guide for all backend development.

---

# 2. Backend Goals

The backend architecture is designed around the following goals.

## Simplicity

The codebase should remain easy to understand.

Business logic should be easy to locate.

Developers should spend time solving business problems rather than understanding complex architecture.

---

## Maintainability

Business features should be isolated into independent modules.

Changes in one module should have minimal impact on others.

---

## Scalability

The backend should support:

- Multiple organizations
- Increased workloads
- Background processing
- Future microservices
- Future mobile clients

without major refactoring.

---

## Security

Security is a first-class concern.

Every request should pass through authentication, authorization, validation, and auditing before business logic executes.

---

## Testability

Every module should be independently testable.

Business logic should never depend directly on framework-specific implementations.

---

# 3. Technology Stack

| Technology | Purpose |
|------------|----------|
| NestJS | Backend Framework |
| TypeScript | Language |
| Prisma ORM | Database Access |
| PostgreSQL | Primary Database |
| JWT | Authentication |
| bcrypt | Password Hashing |
| Passport | Authentication Strategies |
| Zod / class-validator | Validation |
| Docker | Local Development |
| Mailpit | Email Testing |
| Cloudflare R2 / AWS S3 | File Storage |
| Swagger | API Documentation |
| Winston / Pino | Logging |
| BullMQ (Future) | Background Jobs |
| Redis (Future) | Caching & Queues |

---

# 4. Architectural Principles

The backend follows these principles.

---

## Principle 1

Business logic belongs inside Services.

Controllers remain thin.

---

## Principle 2

Each feature owns its own module.

No shared business logic between unrelated modules.

---

## Principle 3

External services are accessed through Providers.

Business modules never depend directly on third-party SDKs.

---

## Principle 4

Validation occurs before business logic executes.

---

## Principle 5

Repositories are responsible for database access only.

Business rules never belong inside repositories.

---

## Principle 6

Every request should be auditable.

---

## Principle 7

Every module should be independently testable.

---

## Principle 8

The backend API is the single source of truth.

All clients communicate through the REST API.

---

# 5. High-Level Backend Architecture

```text
                    HTTP Request
                         │
                         ▼
                    Middleware
                         │
                         ▼
                  Authentication
                         │
                         ▼
                   Authorization
                         │
                         ▼
                 Validation Pipes
                         │
                         ▼
                   Controllers
                         │
                         ▼
                     Services
                         │
                         ▼
                  Repositories
                         │
                         ▼
                     Prisma ORM
                         │
                         ▼
                    PostgreSQL
                         │
                         ▼
                     HTTP Response
```

The backend follows a Modular Monolith architecture with clear separation of concerns.

---

# 6. Project Structure

```text
apps/api/

src/

├── modules/
├── common/
├── providers/
├── prisma/
├── config/
├── database/
├── middleware/
├── jobs/
├── events/
├── shared/
├── app.module.ts
└── main.ts
```

Every directory has a single responsibility.

Shared infrastructure should never contain business logic.

---

# 7. Module Architecture

Every business feature is implemented as a standalone module.

Example:

```text
modules/

applicants/

├── controllers/
├── services/
├── repositories/
├── dto/
├── entities/
├── interfaces/
├── validators/
├── policies/
├── events/
├── listeners/
├── mappers/
├── tests/
└── applicants.module.ts
```

Every module owns:

- Controllers
- Services
- Repositories
- Validation
- Events
- Tests

Modules communicate only through Services.

Controllers must never communicate directly with other Controllers.

Repositories must never communicate directly with other Repositories.

# 8. Layered Architecture

The backend follows a layered architecture.

Each layer has a single responsibility.

```text
HTTP Request
      │
      ▼
Controller
      │
      ▼
Service
      │
      ▼
Repository
      │
      ▼
Database
```

Business logic always flows downward.

Dependencies should never flow upward.

---

## Controller Layer

Responsibilities:

- Receive HTTP Requests
- Parse Request Parameters
- Invoke Services
- Return HTTP Responses

Controllers should never:

- Access Prisma directly
- Contain business logic
- Perform calculations
- Send emails
- Upload files

Controllers remain thin.

---

## Service Layer

Services contain business logic.

Responsibilities include:

- Business Rules
- Validation
- Workflow Processing
- File Processing
- Permission Checks
- Calling Providers
- Calling Repositories

Most application logic belongs here.

---

## Repository Layer

Repositories encapsulate database access.

Responsibilities:

- CRUD Operations
- Query Building
- Pagination
- Filtering
- Transactions

Repositories should never contain business rules.

---

## Provider Layer

Providers abstract external services.

Examples:

- Storage Provider
- Email Provider
- Notification Provider
- Payment Provider

Providers allow infrastructure to change without affecting business logic.

---

# 9. Request Lifecycle

Every incoming request follows the same lifecycle.

```text
HTTP Request
      │
      ▼
Express Middleware
      │
      ▼
NestJS Guards
      │
      ▼
Interceptors
      │
      ▼
Validation Pipe
      │
      ▼
Controller
      │
      ▼
Service
      │
      ▼
Repository
      │
      ▼
Prisma
      │
      ▼
PostgreSQL
      │
      ▼
Response Interceptor
      │
      ▼
HTTP Response
```

This lifecycle guarantees that every request is:

- Authenticated
- Authorized
- Validated
- Logged
- Audited

before business logic executes.

---

# 10. Controllers

Controllers expose REST endpoints.

Responsibilities:

- Receive Requests
- Validate Route Parameters
- Parse Query Parameters
- Invoke Services
- Return Responses

Controllers should remain extremely small.

Example:

```typescript
@Get(':id')
findOne(@Param('id') id: string) {
    return this.applicantService.findById(id);
}
```

Controllers should never:

- Write SQL
- Hash Passwords
- Send Emails
- Upload Files
- Implement Workflow Logic

---

# 11. Services

Services implement business rules.

Example responsibilities:

Applicant Service

- Create Applicant
- Assign Consultant
- Archive Applicant
- Send Invitation

Document Service

- Upload Files
- Replace Files
- Approve Documents
- Reject Documents

Workflow Service

- Move Workflow
- Complete Stages
- Validate Transitions

Services coordinate multiple repositories and providers.

---

## Service Communication

Modules communicate through Services only.

Example

```text
Applicant Service

↓

Workflow Service

↓

Notification Service
```

Controllers should never call another Controller.

Repositories should never call another Repository.

---

# 12. Repositories

Repositories isolate database operations.

Responsibilities:

- Find Records
- Create Records
- Update Records
- Delete Records
- Complex Queries

Repositories return domain entities or data models.

---

## Repository Example

```text
ApplicantRepository

├── findById()

├── findMany()

├── create()

├── update()

├── archive()

└── search()
```

Repositories should remain framework-independent where practical.

---

# 13. Data Transfer Objects (DTOs)

DTOs define the structure of incoming and outgoing data.

They provide:

- Validation
- Type Safety
- API Documentation
- Consistent Contracts

---

## Types of DTOs

Examples:

- CreateApplicantDto
- UpdateApplicantDto
- LoginDto
- CreateTaskDto
- UploadDocumentDto

Separate DTOs should exist for:

- Create
- Update
- Response

Avoid reusing DTOs for unrelated operations.

---

# 14. Validation

Every incoming request is validated before reaching business logic.

Validation is performed using:

- class-validator
- class-transformer

Global Validation Pipe should be enabled.

---

## Validation Rules

Reject:

- Missing required fields
- Invalid data types
- Unknown properties
- Malformed requests

Automatically:

- Transform primitive types
- Strip unknown fields
- Return meaningful validation errors

---

## Business Validation

Business validation occurs inside Services.

Examples:

- Applicant already exists
- Workflow stage already completed
- Document already approved
- Email already in use

Business validation should not be implemented in DTOs.

---

# 15. Authentication

Authentication verifies user identity.

Supported user types:

- Staff
- Applicant

Authentication uses JWT Access Tokens and Refresh Tokens.

---

## Authentication Flow

```text
Login Request
      │
      ▼
Validate Credentials
      │
      ▼
Generate Tokens
      │
      ▼
Return Tokens
      │
      ▼
Authenticated Requests
```

Passwords are stored using bcrypt hashing.

Passwords are never stored in plain text.

---

# 16. Authorization (RBAC)

Authorization determines what a user may access.

RBAC is implemented using:

- Roles
- Permissions
- Guards
- Decorators

---

## Permission Flow

```text
Request

↓

JWT

↓

Role

↓

Permissions

↓

Guard

↓

Controller
```

Every protected endpoint specifies required permissions.

Example:

```typescript
@Permissions('document.approve')
```

The frontend should hide unauthorized actions.

The backend must always enforce authorization regardless of frontend behavior.

# 17. File Management

The backend manages uploaded files through the Storage Provider.

Business modules never interact directly with the filesystem or cloud storage SDKs.

---

## Supported Operations

- Upload
- Replace
- Download
- Delete
- Generate Signed URLs
- Retrieve Metadata

---

## Upload Workflow

```text
HTTP Upload
      │
      ▼
Validate Request
      │
      ▼
Validate File
      │
      ▼
Storage Provider
      │
      ▼
Store Metadata
      │
      ▼
Timeline Event
      │
      ▼
Response
```

---

## File Validation

Every uploaded file is validated for:

- File Type
- File Size
- Virus Scan (Future)
- Duplicate Detection
- Associated Applicant

---

## Storage Strategy

Development

```
Local Storage
```

Pilot

```
Cloudflare R2
```

Production

```
Cloudflare R2
```

or

```
AWS S3
```

Storage providers can be changed through configuration without modifying business logic.

---

## File Versioning

Replacing a document creates a new version.

Previous versions remain available for:

- Auditing
- Download
- History

Files are never overwritten.

---

# 18. Background Jobs

Long-running operations should not block HTTP requests.

Background jobs improve responsiveness and scalability.

---

## Future Job Queue

Recommended technology:

```
BullMQ
```

using Redis.

---

## Example Jobs

- Send Portal Invitation
- Send Email Notifications
- Generate Reports
- Clean Temporary Files
- Process Large Imports
- Virus Scanning
- Scheduled Backups

---

## Job Flow

```text
HTTP Request
      │
      ▼
Create Job
      │
      ▼
Queue
      │
      ▼
Worker
      │
      ▼
Background Processing
```

Background jobs should be idempotent whenever possible.

---

# 19. Event-Driven Architecture

Business modules communicate using domain events.

Events reduce coupling between modules.

---

## Event Flow

```text
Applicant Created
        │
        ▼
Publish Event
        │
        ▼
───────────────
│             │
▼             ▼
Workflow   Notification
Listener    Listener
```

---

## Example Events

- ApplicantCreated
- ApplicantUpdated
- DocumentUploaded
- DocumentApproved
- WorkflowStarted
- WorkflowCompleted
- TaskCompleted
- InvitationSent

---

## Event Benefits

- Lower Coupling
- Better Maintainability
- Easier Testing
- Future Microservices
- Background Processing

---

# 20. Logging

Every significant system action should be logged.

Logging assists with:

- Debugging
- Monitoring
- Auditing
- Incident Investigation

---

## Log Levels

- Error
- Warning
- Information
- Debug

Production environments should avoid verbose debug logging.

---

## Structured Logging

Logs should include:

- Timestamp
- Request ID
- User ID
- Organization ID
- Endpoint
- HTTP Method
- Response Time
- Status Code

---

## Audit Logs

Audit logs record sensitive operations.

Examples

- Login
- Password Reset
- Permission Changes
- Role Changes
- Document Approval
- Workflow Updates
- Organization Settings
- User Creation

Audit logs should never be deleted.

---

# 21. Error Handling

The backend uses centralized exception handling.

Controllers should never manually format error responses.

---

## Global Exception Filter

Every exception passes through a Global Exception Filter.

Responsibilities:

- Format Responses
- Hide Internal Errors
- Log Exceptions
- Return HTTP Status Codes

---

## Error Response

Example

```json
{
    "success": false,
    "statusCode": 404,
    "message": "Applicant not found.",
    "timestamp": "2026-06-29T12:00:00Z",
    "path": "/api/v1/applicants/123"
}
```

---

## Exception Categories

- Validation
- Authentication
- Authorization
- Business Logic
- Database
- External Provider
- Unexpected Errors

Unexpected errors should never expose stack traces in production.

---

# 22. Configuration Management

Application behavior should be driven by configuration.

---

## Environment Variables

Configuration examples:

```env
DATABASE_URL=

JWT_SECRET=

JWT_EXPIRES_IN=

STORAGE_PROVIDER=

EMAIL_PROVIDER=

NODE_ENV=

PORT=
```

---

## Configuration Module

NestJS ConfigModule manages configuration.

Configuration should be validated during application startup.

The application should fail fast when required configuration is missing.

---

## Secrets

Secrets should never be:

- Hardcoded
- Committed to Git
- Logged

Production secrets should be managed by the deployment platform.

---

# 23. Database Access (Prisma)

Prisma is the only supported ORM.

All database communication occurs through Prisma.

---

## Responsibilities

Prisma provides:

- CRUD Operations
- Migrations
- Transactions
- Type Safety
- Query Optimization

---

## Access Flow

```text
Service
    │
    ▼
Repository
    │
    ▼
Prisma Client
    │
    ▼
PostgreSQL
```

Business logic should never interact with Prisma directly.

---

## Migration Strategy

Every schema change must be managed through Prisma Migrations.

Manual database changes are not permitted.

---

## Seeding

Seed scripts should populate:

- Default Roles
- Permissions
- Workflow Templates
- Document Requirements
- Development Users

---

# 24. Transactions

Transactions ensure data consistency.

Use transactions whenever multiple operations must succeed together.

---

## Examples

Creating an Applicant

- Create Applicant
- Create Workflow
- Create Portal Account
- Record Timeline
- Create Default Tasks

If one step fails, all previous operations should be rolled back.

---

## Transaction Flow

```text
Begin Transaction
        │
        ▼
Operation 1
        │
        ▼
Operation 2
        │
        ▼
Operation 3
        │
        ▼
Commit
```

On failure:

```
Rollback
```

Always prefer database transactions over manual rollback logic.

# 25. Caching Strategy

The backend is designed to support caching for improved performance.

Caching should be introduced only where it provides measurable benefits.

---

## Future Cache Provider

Recommended technology:

```
Redis
```

---

## Cacheable Resources

Examples:

- Dashboard Statistics
- Workflow Templates
- Document Requirements
- Organization Settings
- Permission Matrix
- Roles

These resources change infrequently and are ideal candidates for caching.

---

## Cache Principles

- Cache read-heavy data.
- Do not cache frequently changing transactional data.
- Always invalidate affected cache entries after updates.

---

## Cache Flow

```text
Request
    │
    ▼
Redis Cache
    │
 ┌──┴──┐
 │     │
Hit   Miss
 │     │
 ▼     ▼
Return Database
       │
       ▼
 Cache Result
       │
       ▼
 Response
```

---

## Cache Expiration

Suggested TTL values:

| Resource | TTL |
|----------|-----|
| Dashboard | 60 Seconds |
| Roles | 30 Minutes |
| Permissions | 30 Minutes |
| Workflow Templates | 10 Minutes |
| Organization Settings | 15 Minutes |

Cache durations should be configurable.

---

# 26. Performance Optimization

Performance should be considered throughout backend development.

---

## Database Queries

Avoid unnecessary database calls.

Prefer:

- Select only required fields.
- Use pagination.
- Use filtering.
- Use indexes.
- Avoid N+1 queries.

---

## Pagination

Large datasets must always use server-side pagination.

Default page size:

```
25
```

Maximum page size:

```
100
```

---

## Batch Operations

Use bulk operations where appropriate.

Examples:

- Assign Applicants
- Archive Applicants
- Approve Multiple Documents
- Delete Notifications

---

## Database Indexing

Indexes should exist on frequently queried columns.

Examples:

- Email
- Applicant Number
- Workflow Status
- Organization ID
- Assigned Staff
- Created Date

---

## Asynchronous Processing

Expensive operations should be delegated to background jobs.

Examples:

- Email Sending
- Report Generation
- Bulk Imports
- File Processing

---

## Response Size

API responses should return only necessary data.

Avoid deeply nested objects unless explicitly requested.

---

# 27. Security

Security applies to every layer of the backend.

---

## Authentication

Supported authentication:

- JWT Access Token
- Refresh Token

Passwords must always be hashed using bcrypt.

---

## Authorization

Every protected endpoint must verify permissions.

Authorization is implemented using:

- Guards
- Roles
- Permissions

Never trust the frontend for authorization.

---

## Input Validation

Every request must be validated.

Reject:

- Invalid Types
- Missing Fields
- Unknown Properties
- Malicious Input

---

## SQL Injection

Prisma parameterized queries provide protection against SQL injection.

Avoid raw SQL unless absolutely necessary.

---

## File Security

Uploaded files should be validated before storage.

Validation includes:

- MIME Type
- File Extension
- File Size

Future production deployments should include virus scanning.

---

## HTTPS

Production environments must enforce HTTPS.

HTTP should automatically redirect to HTTPS.

---

## Security Headers

Recommended headers:

- Strict-Transport-Security
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Content-Security-Policy

---

## Rate Limiting

Rate limiting should protect:

- Login
- Password Reset
- File Uploads
- Public APIs

---

## Soft Deletes

Business records should never be permanently deleted.

Examples:

- Applicants
- Documents
- Staff
- Tasks
- Workflows

Soft deletes preserve audit history.

---

# 28. Testing Strategy

Testing ensures reliability and maintainability.

---

## Testing Pyramid

```text
          E2E Tests
        ─────────────
     Integration Tests
   ─────────────────────
        Unit Tests
────────────────────────────
```

---

## Unit Tests

Test:

- Services
- Validators
- Utilities
- Policies

Target:

Business logic.

---

## Integration Tests

Verify:

- Database interactions
- Providers
- Module integration

---

## End-to-End Tests

Simulate real user workflows.

Examples:

- Login
- Create Applicant
- Upload Document
- Complete Workflow
- Approve Document

---

## Mocking

External providers should be mocked during tests.

Examples:

- Email
- Storage
- Notifications

This ensures deterministic test results.

---

# 29. Coding Standards

Backend developers should follow consistent coding standards.

---

## General Principles

- Use TypeScript.
- Keep methods small.
- Prefer composition over inheritance.
- Write self-documenting code.
- Avoid duplicated logic.

---

## Naming Conventions

Examples:

Services

```
ApplicantService
```

Repositories

```
ApplicantRepository
```

DTOs

```
CreateApplicantDto
```

Controllers

```
ApplicantController
```

Interfaces

```
ApplicantRepositoryInterface
```

---

## Method Names

Prefer descriptive method names.

Examples:

- createApplicant()
- assignConsultant()
- approveDocument()
- archiveApplicant()

Avoid generic names such as:

- process()
- handle()
- execute()

unless implementing framework interfaces.

---

## Comments

Comments should explain business rules rather than code behavior.

Example:

```typescript
// Applicants cannot be archived while an active workflow exists.
```

---

## Dependency Injection

Always rely on NestJS dependency injection.

Never instantiate services manually.

Example:

```typescript
constructor(
    private readonly applicantService: ApplicantService
) {}
```

---

# 30. Future Evolution

The backend architecture is designed to evolve without major restructuring.

---

## Planned Enhancements

Future versions may introduce:

- Multi-Tenant SaaS
- GraphQL API
- Public API
- Mobile API
- Redis Caching
- Background Workers
- Webhooks
- AI Document Analysis
- OCR Processing
- Real-Time Notifications
- Event Streaming

---

## Microservice Readiness

Although the MVP uses a Modular Monolith, modules are designed for future extraction into independent services.

Potential future services include:

- Authentication Service
- Applicant Service
- Workflow Service
- Document Service
- Notification Service
- Reporting Service

The current architecture minimizes coupling to support this evolution.

---

# 31. Backend Architecture Summary

The backend architecture is designed to be:

- Modular
- Secure
- Scalable
- Maintainable
- Testable
- Performant
- Provider-Agnostic
- Cloud-Ready

Core architectural decisions include:

- NestJS Modular Monolith
- Feature-Based Modules
- Repository Pattern
- Service Layer
- Provider Pattern
- Dependency Injection
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Role-Based Access Control (RBAC)
- Global Validation
- Centralized Error Handling
- Structured Logging
- Event-Driven Architecture
- Background Job Support
- Transaction Management
- Soft Deletes
- Audit Logging

These standards establish a robust backend foundation capable of supporting the MVP while providing a clear path toward a scalable, enterprise-grade SaaS platform.

---

# End of Document