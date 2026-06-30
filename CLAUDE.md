# CLAUDE.md

Instruction manual for Claude Code working in this repository. This file is the
operating contract, not a tutorial. The authoritative _what_ and _why_ live in
[`/docs`](docs/) — this file tells you _how to act_ and points you there. When this
file and the code disagree, trust the code and flag the drift. When this file and
`/docs` disagree, this file wins (the resolved decisions below were reconciled from
conflicting docs on purpose).

---

## 1. Project Mission

A **white-label, multi-tenant-ready SaaS** for collecting, reviewing, and tracking
applicant documents through configurable workflows. The first pilot is an education
consultancy, but the **backend stays industry-neutral forever**. See
[00_MVP.md](docs/00_MVP.md), [01_PRODUCT_VISION.md](docs/01_PRODUCT_VISION.md).

Two ideas drive almost every decision:

1. **Generic backend, branded frontend.** The backend only knows `Organization`,
   `Staff`, `Applicant`, `PortalAccount`, `Workflow`, `Document`. Words like
   "Student", "Consultant", "Counselor" exist **only** in frontend labels and
   org settings. Never leak industry terms into API, DB, or service code.
2. **Consultant-driven onboarding.** Applicants never self-register. Staff create
   the applicant → system provisions a portal account → temp password → invitation
   email → mandatory password change on first login. See
   [02_SYSTEM_ARCHITECTURE.md](docs/02_SYSTEM_ARCHITECTURE.md) §3.9, §10.

Guiding test for any feature: _"Does this make the document workflow simpler,
faster, or more transparent — and does it help validate the pilot?"_ If no, it
belongs in the backlog.

---

## 2. Current Implementation Status

> Keep this section honest. Update it when you add a module. **Do not assume code
> that isn't listed here exists.**

**Exists today (foundation only):**

- Turborepo + pnpm monorepo; Node 22 (`.nvmrc`), pnpm 11.
- Packages: `@repo/tsconfig`, `@repo/eslint-config`, `@repo/types`, `@repo/utils`,
  `@repo/config`, `@repo/ui` (mostly scaffolds/stubs).
- `@repo/api` (NestJS 10): `AppModule`, `ConfigModule` with Joi validation
  ([apps/api/src/config/](apps/api/src/config/)), `PrismaModule`/`PrismaService`
  ([apps/api/src/prisma/](apps/api/src/prisma/)). No business modules yet.
- `@repo/web` (Next.js 15 / React 19): root layout + landing page only. No
  features, no auth, no service layer yet.
- Docker PostgreSQL 17 ([docker/docker-compose.yml](docker/docker-compose.yml)).
- Prisma 6: root [prisma/schema.prisma](prisma/schema.prisma) (**no models yet**),
  one empty init migration, [prisma/seed.ts](prisma/seed.ts) stub.
- Root flat-config ESLint 9, Husky + lint-staged.

**Not built yet (do not reference as if it exists):** any domain model, Auth,
Applicant, Document, Workflow, Timeline, Notification modules; RBAC guards;
storage/email providers; the frontend feature tree; tests.

When asked to build a feature, scaffold it to the standards below — don't expect a
template already in the tree.

---

## 3. Development Philosophy

- **Simplest thing that solves the pilot problem.** Modular monolith, not
  microservices. No premature abstraction or infra.
- **Clarity over cleverness.** Code is read far more than written.
- **Local-first.** The whole stack runs locally with Docker, zero paid services.
- **API-first.** The NestJS API is the single source of truth; web (and future
  mobile) are just clients.
- **Security & auditability by design**, not bolted on.
- **Configuration over customization.** Orgs configure branding/workflow/docs/terms;
  backend code does not change per customer.
- **Documentation is part of the code.** Update `/docs` when architecture changes.

---

## 4. Repository Conventions

```
apps/web   → Next.js frontend (client only)
apps/api   → NestJS backend (all business logic)
packages/* → shared, business-logic-free code (@repo/*)
prisma/    → schema, migrations, seed (root-level, single source)
docker/    → local infra
docs/      → source of truth (numbered, ordered)
scripts/   → automation
```

Hard rules (from [02](docs/02_SYSTEM_ARCHITECTURE.md) §8,
[14](docs/14_PROJECT_STRUCTURE.md)):

- Apps **never** import from other apps. Apps import only `@repo/*` packages.
- **Business logic lives only in `apps/api`.** Never in `packages/*`, never in the
  frontend, never in shared code.
- `packages/*` must not depend on app features (dependencies point down only).
- The frontend talks to the backend **only over HTTP**. It never touches the DB.
- There is one stray empty `services/` dir at root — ignore it; don't put code
  there. Backend services live in `apps/api/src/modules/<feature>/`.

**Imports** ordered: external libs → `@repo/*` packages → internal (`@/…`) →
relative. `import-x/order` enforces this; run lint, don't hand-sort. Prefer named
exports; avoid default exports unless a framework requires them. Use path aliases,
not `../../../..`.

**Naming:** `camelCase` vars/functions, `PascalCase` classes/components/types,
`UPPER_SNAKE_CASE` constants, `kebab-case` filenames (`create-applicant.ts`,
`user.service.ts`) — **except** React components which are `PascalCase.tsx`. No `I`
prefix on interfaces.

---

## 5. Coding Workflow

1. Read the relevant `/docs` file(s) before non-trivial work (table in §16).
2. Reuse existing components/utils/types before creating new ones.
3. Match surrounding code style; don't introduce personal patterns.
4. Keep functions ≤ ~40 lines, files ≤ ~300–500 lines, components ≤ ~200 lines,
   ≤ 3 positional params (use an options object beyond that).
5. Prefer early returns over deep nesting. No magic numbers — name them.
6. After changes, ensure type-check + lint + tests pass (see §15).
7. Update `/docs` and this file's status section when architecture changes.

**Always run from the repo root:**

```bash
pnpm dev          # turbo dev (all apps)
pnpm build        # turbo build
pnpm lint         # turbo lint
pnpm type-check   # turbo type-check
pnpm format       # prettier write
```

**Database** (run via `@repo/api`, schema is at repo root):

```bash
pnpm --filter @repo/api db:generate    # prisma generate
pnpm --filter @repo/api db:migrate     # prisma migrate dev
pnpm --filter @repo/api db:seed
pnpm --filter @repo/api db:studio
docker compose -f docker/docker-compose.yml up -d   # start Postgres
```

---

## 6. Architecture Principles

- **Modular monolith.** Each business capability is a self-contained NestJS module;
  modules are designed so they _could_ later be extracted into services. See
  [08_BACKEND_ARCHITECTURE.md](docs/08_BACKEND_ARCHITECTURE.md) §30.
- **Strict layering, downward only:** Controller → Service → Repository → Prisma →
  PostgreSQL. Dependencies never flow up.
- **Provider pattern for all external services** (storage, email, notifications).
  Business code depends on an interface, never a vendor SDK directly. This is what
  lets Local→R2→S3 and Mailpit→SES swap via config.
- **Every business entity carries `organizationId`** for future multi-tenancy, even
  though the MVP is single-org. All data is isolated by organization.
- **Event-driven where it reduces coupling** (e.g. `ApplicantCreated` →
  workflow/notification listeners).

---

## 7. Backend Development Rules (`apps/api`)

Reference: [08_BACKEND_ARCHITECTURE.md](docs/08_BACKEND_ARCHITECTURE.md),
[15_CODING_STANDARDS.md](docs/15_CODING_STANDARDS.md) §10–12.

**Module layout** — every feature under `apps/api/src/modules/<feature>/`:

```
controllers/  services/  repositories/  dto/  entities/
interfaces/   validators/  events/  listeners/  tests/  <feature>.module.ts
```

- **Controllers are thin**: receive request, validate via DTO, call a service,
  return. No business logic, no Prisma, no calculations, no email/file work.
- **Services own business logic** and orchestrate repositories + providers. Keep
  them focused; split "god services."
- **Repositories own DB access only** (queries, persistence, transactions, pagination,
  filtering). No business rules, no validation. They are the only place Prisma is used.
- **DTOs** validate every request (`class-validator` + global `ValidationPipe`,
  whitelist + transform). Separate Create / Update / Response DTOs; never accept raw
  bodies. Business validation (e.g. "email already in use") goes in services, not DTOs.
- **Dependency injection always.** Never `new` a service.
- **Auth:** JWT access + refresh tokens; **password hashing = Argon2** (resolved
  decision — see §13). RBAC via guards + `@Permissions('document.approve')`-style
  decorators. The backend always enforces authorization regardless of the frontend.
- **Errors:** centralized global exception filter; controllers never format errors.
  Never expose stack traces in production.
- **Config:** access env only through `ConfigService` / the typed config in
  [apps/api/src/config/](apps/api/src/config/). **Never** read `process.env`
  outside that layer. Startup fails fast on missing/invalid env (Joi).
- **Transactions** for multi-write operations (e.g. create applicant + workflow +
  portal account + timeline must succeed or roll back together).

---

## 8. Frontend Development Rules (`apps/web`)

Reference: [07_FRONTEND_ARCHITECTURE.md](docs/07_FRONTEND_ARCHITECTURE.md),
[12_UI_UX_GUIDELINES.md](docs/12_UI_UX_GUIDELINES.md),
[13_COMPONENT_LIBRARY.md](docs/13_COMPONENT_LIBRARY.md).

**Use the feature-based structure from doc 07** (resolved decision, §13):

```
src/app/         → App Router routes, layouts, metadata
src/features/    → business features (applicants, documents, workflow, …)
src/components/  → ui / layouts / tables / forms / dialogs / feedback
src/hooks/  src/services/  src/providers/  src/lib/  src/utils/
src/types/  src/constants/  src/styles/  src/middleware.ts
```

Each feature owns its `components/ hooks/ api/ validation/ types/ utils/ index.ts`.

- **Server Components by default**; add `"use client"` only when you need state,
  effects, browser APIs, or handlers.
- **Components never call Axios directly.** All HTTP goes through service classes in
  `src/services/`; React Query wraps them. Pages compose features; they don't hold
  business logic.
- **Forms:** React Hook Form + Zod, always. Frontend validation is UX only — never a
  substitute for backend validation.
- **Permissions drive the UI** (hide unauthorized actions/routes/menus), but this is
  cosmetic; the backend is the authorization source of truth.
- **Strongly type props.** No `any`. Use `applicant.id` for keys, never array index.
- Reusable visual primitives belong in `@repo/ui` / `components/ui` — no duplicate
  buttons/inputs/dialogs. One icon library (Heroicons). 8-pt spacing, design tokens.

---

## 9. State Management

Resolved decision (§13): **TanStack Query owns server state; Zustand owns UI state
only.** Do not duplicate server data in Zustand.

- **Server state** (applicants, documents, tasks, workflow, notifications): TanStack
  Query — cache, refetch, invalidate after create/update/delete.
- **UI/client state** (sidebar, theme, filters, selected row, modals): Zustand.
- Don't reach for global state unless it's genuinely cross-cutting.
- Tokens live in **secure HTTP-only cookies** — never `localStorage`, never exposed
  to JS.

---

## 10. API Implementation Rules

Reference: [06_API_SPECIFICATION.md](docs/06_API_SPECIFICATION.md),
[15_CODING_STANDARDS.md](docs/15_CODING_STANDARDS.md) §11.

- REST resource naming, no verbs in paths: `GET/POST /applicants`,
  `GET/PATCH/DELETE /applicants/:id`. Never `/createApplicant`.
- Consistent success envelope: `{ success, message, data, meta? }`.
- Consistent error envelope: `{ success: false, message, errors? }` (+ statusCode,
  timestamp, path from the global filter).
- Use correct HTTP status codes (201 create, 400/401/403/404/409/422/500) — don't
  return 200 for everything.
- Server-side pagination on all list endpoints (default page size 25, max 100).
- Keep Swagger/OpenAPI in sync with implementation.

---

## 11. Database Implementation Rules

Reference: [04_DOMAIN_MODEL.md](docs/04_DOMAIN_MODEL.md),
[05_DATABASE_DESIGN.md](docs/05_DATABASE_DESIGN.md).

- Prisma is the **only** DB access path. Schema lives at root
  [prisma/schema.prisma](prisma/schema.prisma); Prisma client is consumed via
  `PrismaService` in repositories.
- Naming: tables `snake_case`, models `PascalCase`, fields `camelCase`.
- Every table includes: `id` (UUID), `createdAt`, `updatedAt`, `deletedAt`
  (soft delete), and `organizationId` where it's a business entity.
- **Soft-delete business records** (applicants, documents, staff, tasks, workflows).
  Never hard-delete data that has audit value.
- **Audit logs and timeline entries are immutable** — never updated or deleted.
- **Documents are versioned**; replacing a file creates a new version. Files are
  never overwritten. Approved documents become read-only.
- All schema changes go through migrations. Never edit a DB manually.
- Use transactions for related multi-write operations. Add indexes on frequently
  queried columns (email, applicantNumber, organizationId, status, assigned staff).
- Avoid N+1 queries; select only needed fields.

---

## 12. UI Implementation Rules

- Provide `loading.tsx` / `error.tsx` for routes; skeletons over blank screens;
  disable submit + prevent double-submit while a form is in flight.
- Centralized notifications: toasts for transient actions, Notification Center for
  persistent ones. MVP delivery channel is **in-app only** (§13).
- Dashboard widgets load, fail, and refresh independently — one broken widget must
  not break the page.
- Accessibility: WCAG 2.1 AA where practical — keyboard nav, ARIA labels, focus
  traps in dialogs, contrast; color is never the only status signal.
- Never render unsanitized HTML; avoid `dangerouslySetInnerHTML`.

---

## 13. Resolved Decisions (doc conflicts reconciled)

The docs contradict each other in a few places. These are the binding resolutions
for this codebase. If you change one, update the relevant `/docs` file too.

| Topic                  | Decision                                                                                   | Why                                                                                                                                    |
| ---------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| Password hashing       | **Argon2**                                                                                 | 4 docs (MVP, Domain, Dev Guide, Sys Arch) specify Argon2; only Backend Arch said bcrypt. Argon2 is the stronger choice.                |
| Frontend structure     | **Feature-based** (doc 07): `src/features`, `src/components`                               | Matches the `@repo/ui` split and is simpler than the FSD layout in doc 14. Treat FSD (entities/widgets) as aspirational, not required. |
| Prisma location        | **Root `prisma/` + `apps/api/src/prisma/` service**                                        | Matches built code and docs 02/08. Doc 14's `src/database/prisma/` layout is not used.                                                 |
| MVP notifications      | **In-app only**, email **provider scaffolded behind an interface**                         | MVP charter excludes email; Mailpit/email stays wired but off the critical path until post-pilot.                                      |
| State                  | **TanStack Query = server state, Zustand = UI state**                                      | Reconciles doc 07 vs the "avoid global state" rule in doc 15.                                                                          |
| Refresh token lifetime | **7 days** (`JWT_REFRESH_EXPIRES_IN=7d`)                                                   | Env validation default is 7d; some docs mentioned 30d. 7d is the implemented value — change only via env var.                          |
| Error envelope shape   | `{ success, message, data, meta? }` success · `{ success: false, message, errors? }` error | `HttpExceptionFilter` in `apps/api/src/common/filters/` is the canonical implementation. Frontend must match this shape.               |
| Auth path scheme       | `/auth/*` (e.g. `POST /auth/login`, `GET /auth/me`)                                        | All auth routes are under `/auth` prefix on the shared controller. No `/auth/staff/*` nesting for staff auth.                          |
| DI class imports       | Use **value imports** (not `import type`) for classes injected via NestJS DI               | `import type` is erased at runtime; injecting a type-only import silently breaks DI. Use `import type` only for interfaces/types.      |

---

## 14. Git Workflow

Reference: [14_PROJECT_STRUCTURE.md](docs/14_PROJECT_STRUCTURE.md) §19,
[15_CODING_STANDARDS.md](docs/15_CODING_STANDARDS.md) §17.

- Branches: `main` (protected, production), `develop` (integration),
  `feature/<name>`, `bugfix/<name>`, `hotfix/<name>`. Never commit directly to
  `main`. Branch off `develop` for new work.
- **Conventional Commits**: `type(scope): description` (feat, fix, refactor, docs,
  style, test, chore, perf, ci, build). Imperative mood, one logical change. Example:
  `feat(auth): add refresh token rotation`.
- Only commit/push when the user asks. End commit messages with:
  `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- Only `.env.example` is committed — never real `.env*` secrets.

---

## 15. Testing & Definition of Done

Reference: [11_TESTING_STRATEGY.md](docs/11_TESTING_STRATEGY.md).

- Backend: unit-test services/validators/policies; integration-test DB/providers/
  module wiring; mock external providers (email/storage). E2E for key flows
  (login, create applicant, upload, approve, workflow). Tests co-located in the
  module's `tests/`, named `*.spec.ts`.
- Frontend (when introduced): Vitest + React Testing Library; Playwright for E2E.

**A change is Done only when it:** works locally · passes `pnpm type-check` ·
passes `pnpm lint` (zero warnings) · has/updates tests that pass · is responsive ·
has no console errors · updates API docs + `/docs` if behavior/architecture changed.

---

## 16. Documentation Map (read, don't duplicate)

| Need                                    | Doc                                                             |
| --------------------------------------- | --------------------------------------------------------------- |
| Scope / what's in & out                 | [00_MVP.md](docs/00_MVP.md)                                     |
| Vision, users, value                    | [01_PRODUCT_VISION.md](docs/01_PRODUCT_VISION.md)               |
| System architecture, principles, envs   | [02_SYSTEM_ARCHITECTURE.md](docs/02_SYSTEM_ARCHITECTURE.md)     |
| Dev setup & standards overview          | [03_DEVELOPMENT_GUIDE.md](docs/03_DEVELOPMENT_GUIDE.md)         |
| Entities, relationships, business rules | [04_DOMAIN_MODEL.md](docs/04_DOMAIN_MODEL.md)                   |
| DB schema design                        | [05_DATABASE_DESIGN.md](docs/05_DATABASE_DESIGN.md)             |
| Endpoints, request/response contracts   | [06_API_SPECIFICATION.md](docs/06_API_SPECIFICATION.md)         |
| Frontend architecture                   | [07_FRONTEND_ARCHITECTURE.md](docs/07_FRONTEND_ARCHITECTURE.md) |
| Backend architecture                    | [08_BACKEND_ARCHITECTURE.md](docs/08_BACKEND_ARCHITECTURE.md)   |
| Deployment                              | [09_DEPLOYMENT_GUIDE.md](docs/09_DEPLOYMENT_GUIDE.md)           |
| Security                                | [10_SECURITY_GUIDELINES.md](docs/10_SECURITY_GUIDELINES.md)     |
| Testing                                 | [11_TESTING_STRATEGY.md](docs/11_TESTING_STRATEGY.md)           |
| UI/UX                                   | [12_UI_UX_GUIDELINES.md](docs/12_UI_UX_GUIDELINES.md)           |
| Component library                       | [13_COMPONENT_LIBRARY.md](docs/13_COMPONENT_LIBRARY.md)         |
| Project structure                       | [14_PROJECT_STRUCTURE.md](docs/14_PROJECT_STRUCTURE.md)         |
| Coding standards                        | [15_CODING_STANDARDS.md](docs/15_CODING_STANDARDS.md)           |
| Error handling                          | [16_ERROR_HANDLING.md](docs/16_ERROR_HANDLING.md)               |
| Logging & monitoring                    | [17_LOGGING_MONITORING.md](docs/17_LOGGING_MONITORING.md)       |
| Notifications                           | [18_NOTIFICATION_SYSTEM.md](docs/18_NOTIFICATION_SYSTEM.md)     |

---

## 17. Tooling Notes (non-obvious)

- **ESLint uses one root flat config** ([eslint.config.mjs](eslint.config.mjs)) with
  a **dependency-injection** design: the root imports plugins once and injects them
  into the factory functions exported by `@repo/eslint-config`
  ([packages/eslint-config/index.js](packages/eslint-config/index.js)). This works
  around pnpm's isolated `node_modules` giving plugins duplicate identities. **Do not**
  re-add per-workspace `eslint.config.*` files, and don't make `@repo/eslint-config`
  `require()` plugins itself. Workspace `lint` scripts call
  `pnpm -w exec eslint <path>` so the root binary + root config resolve correctly.
- **lint-staged** runs on commit via Husky; the ESLint glob is scoped to
  `{apps,packages}/**/*.{ts,tsx}` to avoid root/prisma files that have no config.
- Prettier config is fixed ([.prettierrc](.prettierrc)): single quotes, semicolons,
  trailing commas, width 100, 2-space. Don't fight it — run `pnpm format`.
- **NestJS DI imports:** Use `import ClassName from '...'` (value import) for any
  class token injected via `@Injectable()` / constructor DI. `import type` is stripped
  at compile time and silently produces an `undefined` token at runtime, breaking the
  DI container. Reserve `import type` for pure TypeScript interfaces, type aliases, and
  DTO types that are never used as runtime values. ESLint's `@typescript-eslint/no-import-type-side-effects`
  does not catch DI misuse — enforce by code review (see §13 resolved decisions).

---

## 18. Code Review Checklist

Before declaring work complete, verify: correct folder placement & dependency
direction · no business logic outside `apps/api` · no `process.env` outside the
config layer · controllers thin / services own logic / repositories own DB · DTO
validation present · authorization enforced server-side · input validated · no `any`
· no secrets in code or logs · soft deletes & audit/timeline immutability respected ·
pagination on lists · type-check + lint + tests green · docs updated.

---

## 19. Things Claude Must Never Do

- ❌ Put business logic in `packages/*`, the frontend, or controllers.
- ❌ Let industry terms (Student, Consultant, etc.) into backend/API/DB code.
- ❌ Access `process.env` outside [apps/api/src/config/](apps/api/src/config/).
- ❌ Use `any`, disable `strict`, or silence type errors to "make it pass."
- ❌ Bypass DTO validation, RBAC guards, or backend authorization.
- ❌ Write raw/concatenated SQL — use Prisma. Never log passwords, tokens, or keys.
- ❌ Hard-delete business records, or mutate audit logs / timeline entries.
- ❌ Overwrite document files (always version) or expose direct file/storage URLs.
- ❌ Add a new dependency without clear need + approval; prefer existing libs.
- ❌ Commit secrets or any `.env*` other than `.env.example`.
- ❌ Commit/push, or touch `main` directly, unless explicitly asked.
- ❌ Re-introduce per-workspace ESLint configs (see §17).
- ❌ Reference modules/features that don't exist yet (see §2) — scaffold them.
- ❌ Make breaking changes without flagging them first.

---

## 20. AI Collaboration Rules

Reference: [15_CODING_STANDARDS.md](docs/15_CODING_STANDARDS.md) §23.

- Follow the documented structure; reuse before creating; keep changes focused.
- Generated code must pass type-check, lint, and tests, include proper error
  handling, and respect security rules — the same bar as human code.
- Explain _why_ in comments only for business rules / non-obvious decisions, not
  what the code literally does.
- When requirements are ambiguous or a doc conflict isn't covered by §13, ask
  rather than guess.
- Keep this file and `/docs` current when architecture or decisions change.

## Development Process

For every task:

1. Read the relevant documentation.
2. Explain the implementation plan.
3. Wait for approval if the task affects architecture.
4. Implement only the requested feature.
5. Run lint and type checks.
6. Summarize:
   - Files changed
   - Decisions made
   - Remaining work

## Frontend Implementation Strategy

The HTML files in `apps/frontend` are visual references only.

They are not production code.

Claude should:

- Match the design as closely as possible.
- Rebuild the UI using Next.js and React.
- Create reusable components.
- Avoid copying raw HTML directly.
- Use the project's design system and shared components.

## UI Design Source of Truth

The HTML prototypes in `apps/frontend` are the official visual reference for the application.

When implementing any page:

1. Locate the corresponding HTML prototype.
2. Analyze its layout, spacing, typography, colors, icons, and interactions.
3. Recreate the design using React, Next.js, Tailwind CSS, and shadcn/ui.
4. Do not copy the HTML directly.
5. Extract reusable components instead of duplicating markup.
6. Maintain pixel-level visual consistency wherever practical.
