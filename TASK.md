# TASK.md

# Sprint 5.1 – Authentication Backend

## Objective

Implement the authentication foundation for the platform.

This sprint establishes secure authentication and authorization for future business modules.

No Applicant, Document, or Workflow logic should be implemented.

---

## Documentation

Read before implementation:

- CLAUDE.md
- docs/04_DOMAIN_MODEL.md
- docs/05_DATABASE_DESIGN.md
- docs/06_API_SPECIFICATION.md
- docs/08_BACKEND_ARCHITECTURE.md
- docs/10_SECURITY_GUIDELINES.md
- docs/15_CODING_STANDARDS.md
- docs/16_ERROR_HANDLING.md

---

## Scope

### Prisma Models

Implement only authentication-related models:

- Organization
- Staff
- Role
- Permission
- PortalAccount
- RefreshToken

Include:

- UUID primary keys
- createdAt
- updatedAt
- deletedAt
- organizationId (where applicable)

Create proper relationships and indexes.

---

### NestJS Modules

Create:

- auth
- organization
- staff
- common

Follow the documented module structure:

controllers/
services/
repositories/
dto/
entities/
interfaces/
validators/
tests/

---

### Authentication

Implement:

- Login
- Logout
- Refresh Access Token
- Change Password
- Forgot Password (provider interface only)
- Reset Password

Use:

- JWT Access Tokens
- JWT Refresh Tokens
- Argon2 password hashing

---

### Authorization

Implement:

- JwtAuthGuard
- RolesGuard
- PermissionsGuard

Create decorators:

- @CurrentUser()
- @Roles()
- @Permissions()

---

### Providers

Create interfaces only:

- EmailProvider
- TokenProvider

Business logic must depend on interfaces.

---

### Validation

Use:

- class-validator
- ValidationPipe
- DTOs for every endpoint

---

### API

Implement the endpoints documented in the API specification.

Keep Swagger synchronized.

---

### Error Handling

Use the project's global exception strategy.

No controller should format errors manually.

---

### Testing

Add:

- AuthService unit tests
- Login integration tests
- Password hashing tests

---

## Out of Scope

Do NOT implement:

- Applicant module
- Document module
- Workflow
- Notifications
- Dashboard APIs
- Frontend integration

Authentication only.
