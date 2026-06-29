# 15_CODING_STANDARDS.md

# Coding Standards

**Project:** Document Workflow Platform

**Version:** 1.0

**Status:** Draft

**Last Updated:** June 2026

---

# 1. Purpose

This document defines the official coding standards for the Document Workflow Platform.

Its objectives are to:

- Improve code quality
- Increase readability
- Reduce bugs
- Simplify maintenance
- Improve collaboration
- Ensure consistency across frontend and backend

Every developer contributing to the project is expected to follow these standards.

---

# 2. General Principles

Code should always prioritize clarity over cleverness.

The best code is:

- Easy to read
- Easy to understand
- Easy to modify
- Easy to test
- Easy to remove

---

## Core Principles

### Readability

Code is read far more often than it is written.

Always optimize for readability.

---

### Simplicity

Prefer simple solutions over complex ones.

Avoid unnecessary abstractions.

---

### Consistency

Follow existing project patterns.

Do not introduce personal coding styles.

---

### Reusability

Avoid duplication.

Extract reusable logic whenever appropriate.

---

### Maintainability

Write code that another developer can understand without additional explanation.

---

### Testability

Business logic should be easy to unit test.

Avoid tightly coupling business logic with UI or framework-specific code.

---

# 3. TypeScript Standards

TypeScript is mandatory throughout the project.

JavaScript files are not permitted.

---

## Strict Mode

The project must use:

```json
{
  "strict": true
}
```

Never disable strict mode.

---

## Avoid any

Do not use:

```typescript
any
```

Instead use:

- unknown
- Generic Types
- Interfaces
- Type Aliases
- Zod Inference

---

## Prefer Interfaces

Use interfaces for object definitions.

Example

```typescript
interface Applicant {
  id: string;
  firstName: string;
}
```

---

## Use Type Aliases

Use type aliases for:

- Unions
- Utility Types
- Function Types

Example

```typescript
type UserRole =
    | "ADMIN"
    | "CONSULTANT";
```

---

## Enum Usage

Prefer string enums only when necessary.

Otherwise prefer literal unions.

---

## Type Inference

Allow TypeScript to infer obvious types.

Avoid unnecessary annotations.

Good

```typescript
const name = "John";
```

Avoid

```typescript
const name: string = "John";
```

---

# 4. Naming Conventions

Use descriptive names.

Avoid abbreviations.

---

## Variables

camelCase

Good

```typescript
applicantName

documentCount

workflowStage
```

Avoid

```typescript
a

temp

doc1
```

---

## Functions

Use verbs.

Examples

```typescript
createApplicant()

uploadDocument()

assignConsultant()

sendInvitation()
```

---

## Components

Use PascalCase.

```typescript
ApplicantCard

WorkflowStepper

DocumentUploader
```

---

## Interfaces

Prefix with I is prohibited.

Good

```typescript
User

Applicant
```

Avoid

```typescript
IUser

IApplicant
```

---

## Constants

UPPER_SNAKE_CASE

```typescript
MAX_UPLOAD_SIZE

DEFAULT_PAGE_SIZE
```

---

## Files

Use kebab-case.

Examples

```text
create-applicant.ts

upload-document.ts

user.service.ts
```

---

# 5. File Organization

Each file should have one clear responsibility.

Avoid files exceeding approximately 300–500 lines unless justified.

---

## Import Order

1. External Libraries

2. Shared Packages

3. Internal Modules

4. Relative Imports

Example

```typescript
import { useQuery } from "@tanstack/react-query";

import { Button } from "@repo/ui";

import { ApplicantCard } from "@/features/applicants";

import "./styles.css";
```

---

## Exports

Prefer named exports.

Avoid default exports unless required by the framework.

---

# 6. Functions

Functions should be:

- Small
- Focused
- Predictable

---

## Single Responsibility

Each function should perform one task.

---

## Early Returns

Prefer

```typescript
if (!user) return;

if (!user.active) return;

saveUser();
```

Avoid

```typescript
if (user) {

    if (user.active) {

        saveUser();

    }

}
```

---

## Function Length

Guideline

Maximum:

```
40 lines
```

If a function becomes significantly larger, consider extracting helper functions.

---

## Parameters

Prefer:

```
3 parameters or fewer
```

Use objects for larger parameter lists.

Example

```typescript
createApplicant({
    firstName,
    lastName,
    email
});
```

---

## Side Effects

Minimize unexpected side effects.

Functions should clearly communicate what they modify.

---

# 7. Error Handling

Never silently ignore errors.

Always:

- Log
- Handle
- Return meaningful messages

Never leave empty catch blocks.

Bad

```typescript
catch (error) {

}
```

Good

```typescript
catch (error) {

logger.error(error);

throw error;

}
```

# 8. React Standards

The frontend is built using React and Next.js.

React components should remain predictable, reusable, and easy to test.

---

## Functional Components

Always use functional components.

Do not create class components.

Good

```tsx
export function ApplicantCard() {
    return <div>...</div>;
}
```

---

## Hooks

Always use React Hooks.

Examples

- useState
- useEffect
- useMemo
- useCallback
- useRef

---

## Custom Hooks

Business logic should be extracted into custom hooks whenever it is reused.

Good

```typescript
useApplicants()

useDocuments()

useWorkflow()
```

Avoid duplicating fetching or business logic across components.

---

## State Management

Use the appropriate state for the appropriate scope.

Local State

- UI Toggles
- Dialog Visibility
- Form State

Server State

- TanStack Query

Global State

- Zustand

Do not use global state unless necessary.

---

## Component Size

Guideline:

```
~200 lines maximum
```

If a component grows significantly larger, extract:

- Child Components
- Hooks
- Utilities

---

## Props

Props should be strongly typed.

Good

```typescript
interface ApplicantCardProps {
    applicant: Applicant;
}
```

Avoid

```typescript
props: any
```

---

## Keys

Never use array indexes as React keys unless the list is static.

Good

```tsx
key={applicant.id}
```

Avoid

```tsx
key={index}
```

---

## Conditional Rendering

Prefer early returns.

Good

```tsx
if (isLoading) {
    return <Loading />;
}
```

Avoid deeply nested ternary expressions.

---

# 9. Next.js Standards

The frontend uses Next.js App Router.

---

## Server Components

Use Server Components by default.

Only use Client Components when required.

Examples requiring Client Components:

- State
- Effects
- Browser APIs
- Event Handlers

---

## Client Components

Always place

```typescript
"use client";
```

only when necessary.

Avoid unnecessary client rendering.

---

## Data Fetching

Preferred order

1. Server Components
2. React Query
3. Client Fetch

Do not fetch data directly inside random components.

---

## Route Organization

Use nested routing.

Example

```text
dashboard/

applicants/

[id]/

documents/

settings/
```

---

## Loading UI

Provide

```
loading.tsx
```

for slow pages.

---

## Error UI

Provide

```
error.tsx
```

for route-level error handling.

---

## Metadata

Every page should define:

- Title
- Description
- Open Graph (Future)

---

# 10. NestJS Standards

The backend uses NestJS.

Follow NestJS best practices.

---

## Modules

Every business feature belongs to its own module.

Example

```text
ApplicantsModule

DocumentsModule

WorkflowModule
```

---

## Dependency Injection

Always use dependency injection.

Never manually instantiate services.

Good

```typescript
constructor(
    private readonly applicantService: ApplicantService
) {}
```

---

## Controllers

Controllers should only:

- Receive Requests
- Validate Input
- Return Responses

Never implement business logic inside controllers.

---

## Services

Services contain business logic.

Examples

- Create Applicant
- Upload Document
- Assign Consultant

Services should remain framework-independent whenever possible.

---

## Repositories

Repositories communicate with the database.

Responsibilities:

- Queries
- Persistence
- Transactions

Repositories should not perform validation.

---

## DTOs

Every request should use DTOs.

Example

```typescript
CreateApplicantDto

UpdateApplicantDto

LoginDto
```

Never accept raw request bodies directly.

---

## Validation

Use:

```
class-validator
```

or shared validation schemas where applicable.

Never trust client input.

---

# 11. API Standards

All APIs should remain consistent.

---

## REST Naming

Good

```text
GET

/applicants

POST

/applicants

GET

/applicants/{id}

PATCH

/applicants/{id}

DELETE

/applicants/{id}
```

Avoid verbs inside endpoints.

Avoid

```text
/createApplicant

/updateUser
```

---

## Response Format

Success

```json
{
    "success": true,
    "message": "Applicant created successfully.",
    "data": {},
    "meta": {}
}
```

---

Error

```json
{
    "success": false,
    "message": "Validation failed.",
    "errors": []
}
```

---

## HTTP Status Codes

Use appropriate status codes.

Examples

- 200 OK
- 201 Created
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 409 Conflict
- 422 Validation Error
- 500 Internal Server Error

Avoid always returning 200.

---

# 12. Database Standards

Use Prisma as the ORM.

---

## Naming

Tables

```
snake_case
```

Models

```
PascalCase
```

Fields

```
camelCase
```

---

## Migrations

Every schema change must be committed through migrations.

Never edit production databases manually.

---

## Soft Deletes

Business records should use soft deletes whenever appropriate.

Example

```typescript
deletedAt
```

instead of permanently removing data.

---

## Transactions

Use database transactions for operations involving multiple related writes.

Examples

- Creating an applicant and initial workflow
- Assigning documents and tasks
- Bulk operations

Transactions help maintain data integrity.

# 13. Logging

Logging is essential for monitoring, debugging, auditing, and security.

Logs should provide enough information to diagnose issues without exposing sensitive data.

---

## Logging Levels

Use the appropriate log level.

| Level | Purpose |
|---------|----------|
| Debug | Development Information |
| Info | Normal Application Events |
| Warn | Unexpected but Recoverable Events |
| Error | Failures Requiring Investigation |
| Fatal | Critical Application Failure |

---

## Log Structure

Every log should include:

- Timestamp
- Request ID
- User ID (if authenticated)
- Module
- Log Level
- Message

Example

```text
2026-06-30T09:15:22Z

INFO

ApplicantsService

User 123 created Applicant 456
```

---

## Never Log

Never log:

- Passwords
- JWT Tokens
- Refresh Tokens
- API Keys
- OTP Codes
- Credit Card Data
- Session Cookies

---

## Structured Logging

Prefer structured logging.

Good

```typescript
logger.info({
    applicantId,
    consultantId,
    action: "Applicant Created"
});
```

Avoid

```typescript
logger.info("Something happened");
```

---

# 14. Validation

All incoming data must be validated.

Never trust client input.

---

## Frontend Validation

Use:

- React Hook Form
- Zod

Frontend validation improves user experience but does not replace backend validation.

---

## Backend Validation

Every API request must be validated.

Validate:

- Body
- Query Parameters
- Route Parameters
- Headers (when applicable)

---

## Validation Rules

Examples

- Required Fields
- Email Format
- Phone Number Format
- Maximum Length
- Minimum Length
- Enum Values
- Date Formats
- File Types
- File Size

---

## Error Messages

Provide user-friendly messages.

Good

```text
Email address is required.
```

Avoid

```text
Validation failed.
```

---

# 15. Comments

Code should be self-explanatory.

Comments should explain **why**, not **what**.

---

## Good Comment

```typescript
// Prevent duplicate document uploads for the same applicant.
```

---

## Bad Comment

```typescript
// Increment i.
i++;
```

---

## TODO Comments

Always include context.

Example

```typescript
// TODO(Atit): Replace local storage with Redis cache.
```

---

## Remove Old Comments

Delete outdated comments during refactoring.

Comments should never contradict the implementation.

---

# 16. Documentation

Public APIs and reusable modules should be documented.

---

## API Documentation

Every endpoint should include:

- Description
- Parameters
- Request Example
- Response Example
- Error Responses

Swagger/OpenAPI should remain synchronized with the implementation.

---

## Component Documentation

Reusable components should document:

- Purpose
- Props
- Variants
- Usage Example

---

## README Files

Each major module should include a README when the module contains complex business logic.

---

# 17. Git Commit Convention

The project follows the Conventional Commits specification.

---

## Format

```text
type(scope): description
```

---

## Types

Examples

```text
feat

fix

refactor

docs

style

test

chore

perf

ci

build
```

---

## Examples

```text
feat(auth): add refresh token support

fix(upload): validate maximum file size

refactor(applicants): simplify search service

docs(api): update authentication endpoints

test(workflow): add integration tests
```

---

## Rules

Commit messages should:

- Be concise
- Use the imperative mood
- Describe one logical change

Avoid vague messages like:

```text
changes

update

fixed stuff
```

---

# 18. Code Review Checklist

Every Pull Request should satisfy the following checklist before approval.

---

## Functionality

- Feature works as expected.
- No regressions introduced.
- Edge cases considered.

---

## Readability

- Clear naming.
- Small functions.
- Consistent formatting.

---

## Architecture

- Correct folder placement.
- Follows dependency rules.
- No duplicated business logic.

---

## Performance

- Avoid unnecessary database queries.
- Avoid unnecessary renders.
- Efficient algorithms used.

---

## Security

- Authorization verified.
- Input validated.
- Sensitive data protected.

---

## Testing

- Unit tests updated.
- Integration tests updated (if applicable).
- Existing tests continue to pass.

---

## Documentation

- API documentation updated.
- Relevant Markdown documents updated.
- Comments reviewed.

---

# 19. Performance Guidelines

Performance should be considered during implementation rather than optimized only after issues arise.

---

## Frontend

Prefer:

- Server Components
- Lazy Loading
- Code Splitting
- Memoization (only when beneficial)
- Image Optimization
- Pagination
- Virtualized Lists for large datasets

Avoid:

- Unnecessary state updates
- Large bundle sizes
- Re-rendering entire pages

---

## Backend

Prefer:

- Pagination
- Database Indexes
- Query Optimization
- Background Jobs
- Caching where appropriate
- Connection Pooling

Avoid:

- N+1 Queries
- Blocking Operations
- Long-running synchronous tasks

---

## Database

Optimize:

- Index frequently queried columns.
- Limit selected fields.
- Batch related operations.
- Archive historical data when appropriate.

Performance improvements should not compromise code readability unless justified.

# 20. Security Coding Practices

Security is a shared responsibility.

Every developer should write code with security in mind from the beginning rather than treating it as a separate phase.

---

## Authentication

Always verify authentication before processing protected requests.

Never trust authentication data supplied by the client.

Use the authenticated user provided by the server.

---

## Authorization

Always check permissions in addition to authentication.

Example

```text
Authenticated

≠

Authorized
```

Being logged in does not automatically grant access to a resource.

---

## Input Validation

Validate every input.

Examples

- Request Body
- Query Parameters
- Route Parameters
- Uploaded Files
- HTTP Headers

Never trust client-side validation.

---

## SQL Injection

Always use Prisma queries.

Never concatenate SQL strings.

Good

```typescript
await prisma.applicant.findUnique({
    where: {
        id
    }
});
```

Avoid

```typescript
SELECT * FROM applicants WHERE id = " + id
```

---

## XSS Protection

Escape user-generated content when rendering HTML.

Avoid:

```tsx
dangerouslySetInnerHTML
```

unless absolutely necessary and sanitized.

---

## CSRF

Use secure authentication mechanisms.

For cookie-based authentication:

- HttpOnly Cookies
- Secure Cookies
- SameSite Protection
- CSRF Tokens (when applicable)

---

## Secrets

Secrets must never exist inside source code.

Bad

```typescript
const JWT_SECRET = "super-secret";
```

Good

```typescript
process.env.JWT_SECRET
```

---

## File Uploads

Validate:

- File Type
- File Extension
- MIME Type
- Maximum Size

Never trust the uploaded filename.

Generate server-side filenames.

---

## Rate Limiting

Protect public endpoints such as:

- Login
- Password Reset
- OTP Verification
- Invitation Acceptance

---

## Dependencies

Keep dependencies updated.

Remove unused packages regularly.

Run vulnerability scans before releases.

---

# 21. Code Smells to Avoid

The following patterns should be avoided.

---

## Long Functions

Large functions are difficult to understand.

Extract helper functions.

---

## Duplicate Code

Avoid copy-paste programming.

Extract:

- Utilities
- Hooks
- Services
- Shared Components

---

## Deep Nesting

Bad

```typescript
if (a) {
    if (b) {
        if (c) {
            ...
        }
    }
}
```

Prefer

```typescript
if (!a) return;
if (!b) return;
if (!c) return;
```

---

## Magic Numbers

Avoid

```typescript
if (count > 17)
```

Prefer

```typescript
const MAX_DOCUMENTS = 17;
```

---

## Boolean Flags

Avoid functions like

```typescript
saveApplicant(true, false, true);
```

Prefer

```typescript
saveApplicant({
    notify: true,
    validate: false,
    publish: true
});
```

---

## God Components

Avoid React components that:

- Fetch data
- Manage forms
- Handle business logic
- Render UI
- Manage dialogs

Split responsibilities into:

- Hooks
- Child Components
- Services

---

## God Services

Backend services should remain focused.

Large services should be divided into multiple domain services.

---

# 22. Refactoring Guidelines

Refactoring should improve code without changing behavior.

---

## Goals

Improve:

- Readability
- Simplicity
- Performance
- Maintainability

---

## Rules

Refactoring should:

- Preserve functionality
- Keep tests passing
- Reduce duplication
- Simplify architecture

---

## Before Refactoring

Ensure:

- Existing tests pass.
- Business requirements are understood.

---

## After Refactoring

Verify:

- Tests pass.
- Lint passes.
- Type checking passes.
- Documentation remains accurate.

---

# 23. AI-Assisted Development Guidelines

AI tools such as ChatGPT and Claude Code are approved development assistants for this project.

They should accelerate development—not replace engineering judgment.

---

## Acceptable Uses

AI may assist with:

- Boilerplate Generation
- Refactoring Suggestions
- Unit Test Generation
- Documentation
- Code Explanation
- Debugging Assistance
- SQL Queries
- API Design
- UI Prototyping

---

## Review Requirements

All AI-generated code must be reviewed by a developer before merging.

Developers remain responsible for:

- Correctness
- Security
- Performance
- Maintainability

---

## Restrictions

AI-generated code must not:

- Introduce unapproved dependencies
- Expose secrets or credentials
- Bypass project architecture
- Disable validation or security checks
- Ignore coding standards

---

## Verification Checklist

Before accepting AI-generated code, verify that it:

- Passes TypeScript type checking
- Passes linting
- Passes all tests
- Follows folder structure
- Uses approved libraries
- Includes appropriate error handling
- Meets performance expectations

---

## Prompt Documentation (Recommended)

For complex implementations generated with AI, consider saving the prompts in the project documentation.

Benefits include:

- Easier reproducibility
- Better team collaboration
- Improved knowledge sharing

---

# 24. Summary

The Document Workflow Platform follows a consistent set of coding standards designed to produce maintainable, scalable, and secure software.

Key principles include:

- Readable Code
- Strong Type Safety
- Modular Architecture
- Small Functions
- Reusable Components
- Strict Validation
- Consistent API Design
- Security by Default
- Comprehensive Testing
- Conventional Commits
- Thorough Code Reviews
- AI-Assisted Development with Human Oversight

By following these standards, the development team can build a codebase that remains easy to understand, easy to extend, and reliable as the platform grows from an MVP into a production-ready SaaS application.

---

# End of Document