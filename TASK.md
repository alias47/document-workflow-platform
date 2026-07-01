# Sprint 8.2 – Search Foundation

## Goal

Implement the platform-wide Search domain.

This sprint establishes a unified search architecture across Applicants, Documents, and Workflow using PostgreSQL-compatible Prisma queries (ILIKE), with an abstraction that can later be replaced by PostgreSQL Full Text Search without affecting consumers.

No Full Text Search implementation in this sprint.

---

# Scope

## Database

Extend the Document model.

Add:

- title
- description
- tags (String[])

Create migration.

Update seed data.

---

## Backend

Create SearchModule.

Create:

- SearchController
- SearchService
- SearchRepository
- SearchProvider interface
- PrismaSearchProvider implementation

The service must depend only on SearchProvider.

---

## Search Targets

Applicants

Search by:

- applicantNumber
- firstName
- middleName
- lastName
- email
- phone

Documents

Search by:

- title
- filename
- description
- tags
- category

Workflow

Search by:

- current stage name

---

## Endpoints

GET /search

Parameters

q

entity

page

pageSize

Example

/search?q=john

/search?q=visa&entity=document

/search?q=approved&entity=workflow

---

## Permissions

search.view

---

## Security

Organization isolation.

Permission filtering.

Soft-deleted records excluded.

---

## Frontend

Create

services/search.service.ts

features/search/

hooks/

components/

SearchBar

SearchResults

SearchEmptyState

SearchSkeleton

React Query hooks.

Use existing QueryProvider.

No direct axios imports.

---

## UI

Global search bar.

Debounced search.

300 ms debounce.

URL persistence.

Loading state.

Empty state.

Error state.

Pagination.

Entity filters.

---

## Tests

Repository

Provider

Service

Controller

Frontend hook tests

Validation tests

---

## Validation

Run

pnpm lint

pnpm type-check

pnpm build

All tests pass.

---

## Out of Scope

PostgreSQL Full Text Search

GIN indexes

tsvector

Ranking

Autocomplete

Recent searches

Search analytics
