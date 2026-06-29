03_DEVELOPMENT_GUIDE.md
1. Introduction
Purpose
Development Philosophy
Project Goals
2. Development Principles

These are the rules every developer follows.

Examples:

Keep business logic in the backend.
Never duplicate code.
Keep components reusable.
Use TypeScript everywhere.
Never hardcode strings.
Prefer composition over inheritance.
Small pull requests.
Document major architectural decisions.
3. Local Development Environment

Software required:

Node.js LTS
pnpm
Docker Desktop
Git
VS Code
Claude Code Extension
PostgreSQL (via Docker)
Mailpit (Docker)

This section should also include installation commands.

4. Project Setup

Step-by-step instructions:

git clone

pnpm install

docker compose up

pnpm dev

How to create:

.env
database
storage folder
uploads folder
5. Repository Structure

Explain:

apps/
packages/
docs/
docker/
scripts/

When to create a package.

When NOT to create one.

6. Git Workflow

Branch naming:

main

develop

feature/auth

feature/document-upload

bugfix/login

hotfix/security

Commit convention:

feat:

fix:

refactor:

docs:

test:

chore:

Example:

feat(auth): implement applicant login

fix(upload): prevent duplicate documents
7. Coding Standards
Naming

Variables

camelCase

Classes

PascalCase

Folders

kebab-case

Constants

UPPER_CASE

Enums

PascalCase

Interfaces

IApplicant

(or omit the I prefix—choose one convention and stick with it)

8. Folder Standards

Every module should look like:

controllers/

services/

repositories/

dto/

entities/

interfaces/

validators/

tests/

No exceptions.

9. Backend Standards

Examples:

Controllers

Only receive requests.
No business logic.

Services

Business logic only.

Repositories

Database only.

DTO

Validation only.

Providers

Third-party services only.
10. Frontend Standards

Pages

app/

Components

components/

Feature folders

features/

Hooks

hooks/

Shared UI

packages/ui
11. API Standards

REST naming

GET /applicants

POST /applicants

PATCH /applicants/:id

DELETE /applicants/:id

Response format

{
  "success": true,
  "data": {},
  "message": ""
}

Error format

{
  "success": false,
  "error": {
    "code": "",
    "message": ""
  }
}
12. Database Standards

Primary key

id

UUID

Soft delete

deletedAt

Created

createdAt

Updated

updatedAt

Every table should include:

organizationId

for future multi-tenancy.

13. File Upload Standards

Allowed:

PDF
JPG
PNG

Maximum:

10 MB

Naming:

Never use original filename.

Generate UUID.

Store metadata separately.

14. Security Guidelines

Passwords

Argon2

JWT

Refresh Tokens

Helmet

Rate limiting

Validation

OWASP

Never expose storage paths.

Never expose database IDs unnecessarily.

15. Environment Variables

Development

DATABASE_URL

JWT_SECRET

UPLOAD_PATH

MAIL_HOST

Pilot

R2_KEY

R2_SECRET

SES_KEY

SES_SECRET

Production

AWS credentials.

16. Testing Strategy

Unit Tests

Integration Tests

Manual Testing

Future

E2E

Playwright

17. Deployment Strategy

Development

Docker

↓

Pilot

Railway

↓

Production

AWS

No code changes between environments.

Only .env changes.

18. Development Roadmap

This is extremely important.

Instead of coding randomly, we define the implementation order.

Example:

Phase 1

Repository

Docker

Authentication

Database

------------------

Phase 2

Applicant CRUD

Dashboard

Staff CRUD

------------------

Phase 3

Document Upload

Workflow

Timeline

------------------

Phase 4

Notifications

Branding

Settings

------------------

Phase 5

Pilot Deployment
19. Definition of Done

Every feature is complete only if:

Works locally
Tested
Linted
Documented
API updated
No console errors
No TypeScript errors
Responsive
Reviewed

20. AI Development Guidelines (Claude Code)

Since you're using Claude Code extensively, I recommend adding a final section that tells AI assistants exactly how to contribute. This section would include rules like:

Never introduce new dependencies without approval.
Follow the documented folder structure.
Reuse existing components before creating new ones.
Keep commits focused on a single feature.
Update documentation when architecture changes.
Ask before making breaking changes.