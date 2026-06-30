# TASK.md

# Sprint 6.2.5 – Frontend API Infrastructure

## Objective

Build the shared frontend infrastructure required for all backend communication.

This sprint creates the API foundation only.

No Applicant UI integration.

No new pages.

No feature implementation.

---

## Read Before Starting

- CLAUDE.md
- docs/06_API_SPECIFICATION.md
- docs/07_FRONTEND_ARCHITECTURE.md
- docs/12_UI_UX_GUIDELINES.md
- docs/13_COMPONENT_LIBRARY.md

---

# Scope

## HTTP Client

Create:

src/lib/http.ts

Responsibilities:

- Axios instance
- Base URL from environment
- withCredentials enabled
- Default headers
- Request interceptor
- Response interceptor
- Global error handling

Do not call axios directly anywhere else.

---

## API Types

Create:

src/types/api.ts

Define:

ApiResponse<T>

PaginatedResponse<T>

PaginationMeta

ApiError

ValidationError

These types will be reused by every service.

---

## Services

Create:

src/services/

Implement:

auth.service.ts

applicant.service.ts

Each service owns all HTTP communication.

Components must never import axios.

---

## React Query

Install and configure:

- QueryClient
- QueryClientProvider

Create:

src/providers/QueryProvider.tsx

Configure:

- staleTime
- retry policy
- devtools (development only)

Wrap the application.

---

## Query Keys

Create:

src/lib/query-keys.ts

Centralize every query key.

Example:

auth

applicants

documents

workflow

notifications

Never hardcode query keys.

---

## Environment

Create:

.env.local.example

NEXT_PUBLIC_API_URL

Update README if necessary.

---

## Error Handling

Create reusable helpers.

Handle:

401

403

404

422

500

Do not expose raw backend messages.

---

## Authentication

Prepare support for:

HTTP-only cookie authentication

Do NOT implement login logic.

Only prepare the infrastructure.

---

## Validation

Verify:

pnpm lint

pnpm type-check

pnpm build

---

# Out of Scope

Do NOT implement:

Applicant pages

Documents

Workflow

Notifications

Settings

File uploads

Business logic

React UI changes
