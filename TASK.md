# TASK.md

# Sprint 4.1 – Frontend Infrastructure Completion

## Objective

Prepare the frontend for backend integration without introducing real API communication.

---

## Scope

### Service Layer

Create reusable services:

- api-client.ts
- auth.service.ts
- applicant.service.ts
- dashboard.service.ts

---

### Environment

Create:

src/lib/env.ts

Support:

- NEXT_PUBLIC_API_URL
- NEXT_PUBLIC_APP_NAME
- NEXT_PUBLIC_ENV

---

### Authentication

Create:

- AuthProvider
- mock authentication
- auth context

---

### Route Protection

Prepare protected routes:

- dashboard
- applicants

Public:

- login
- forgot-password
- reset-password

---

### Loading UI

Add:

loading.tsx

where appropriate.

---

### Error UI

Add:

error.tsx

where appropriate.

---

### Empty States

Standardize empty state components.

---

### Skeletons

Create reusable skeleton loaders.

---

## Rules

No backend.

No JWT.

No API integration.

No business logic changes.

No UI redesign.

Architecture only.
