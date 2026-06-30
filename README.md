# EduFlow — Document Workflow Platform

A production-grade SaaS platform for managing educational document workflows.

## Prerequisites

- [Node.js](https://nodejs.org/) >= 20
- [pnpm](https://pnpm.io/) >= 9
- [Docker](https://www.docker.com/) >= 24

## Getting started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Then open `.env` and set the required values:

| Variable                 | Required | Description                                                |
| ------------------------ | -------- | ---------------------------------------------------------- |
| `DATABASE_URL`           | Yes      | PostgreSQL connection string                               |
| `JWT_SECRET`             | Yes      | Min 32 chars. Generate with: `openssl rand -base64 64`     |
| `PORT`                   | No       | API port (default: `3001`)                                 |
| `NODE_ENV`               | No       | `development` / `test` / `production`                      |
| `CORS_ORIGIN`            | No       | Allowed frontend origin (default: `http://localhost:3000`) |
| `JWT_ACCESS_EXPIRES_IN`  | No       | Access token TTL (default: `15m`)                          |
| `JWT_REFRESH_EXPIRES_IN` | No       | Refresh token TTL (default: `7d`)                          |

**The application will refuse to start if `DATABASE_URL` or `JWT_SECRET` are missing or invalid.**

#### Local overrides

Create `.env.local` to override specific values without modifying `.env`:

```bash
# .env.local — loaded after .env, not committed to git
JWT_SECRET=my-personal-dev-secret-longer-than-32-characters
```

`.env.local` takes precedence over `.env` and is ignored by git.

### 3. Start the database

```bash
docker compose -f docker/docker-compose.yml up -d
```

Wait for the health check to pass (usually ~10 seconds):

```bash
docker compose -f docker/docker-compose.yml ps
```

The `STATUS` column should show `healthy` before starting the apps.

### 4. Run database migrations

```bash
pnpm db:migrate
```

This applies all pending migrations and re-generates the Prisma Client.

### 5. Start the development servers

```bash
pnpm dev
```

This starts both apps via Turborepo:

| App           | URL                   |
| ------------- | --------------------- |
| Web (Next.js) | http://localhost:3000 |
| API (NestJS)  | http://localhost:3001 |

## Database

### Start

```bash
docker compose -f docker/docker-compose.yml up -d
```

### Stop (preserve data)

```bash
docker compose -f docker/docker-compose.yml down
```

### Stop and delete all data

```bash
docker compose -f docker/docker-compose.yml down -v
```

### Connection details

| Setting  | Value                                                             |
| -------- | ----------------------------------------------------------------- |
| Host     | `localhost`                                                       |
| Port     | `5432`                                                            |
| Database | `document_workflow`                                               |
| User     | `postgres`                                                        |
| Password | `postgres`                                                        |
| URL      | `postgresql://postgres:postgres@localhost:5432/document_workflow` |

## Prisma

All Prisma commands run from the repo root. The schema lives at `prisma/schema.prisma`.

### Generate the Prisma Client

```bash
pnpm db:generate
```

Run this after pulling changes that include schema modifications.

### Create and apply a migration

```bash
pnpm db:migrate
```

Prisma will prompt you to name the migration. It creates a SQL file in `prisma/migrations/` and applies it to the database.

### Apply migrations in CI / production

```bash
pnpm db:migrate:deploy
```

Uses `migrate deploy` — applies pending migrations without creating new ones.

### Seed the database

```bash
pnpm db:seed
```

### Open Prisma Studio

```bash
pnpm db:studio
```

Opens a local browser UI at http://localhost:5555 to inspect and edit database records.

## Project structure

```
.
├── apps/
│   ├── web/          # Next.js 15 App Router
│   └── api/          # NestJS REST API
├── packages/
│   ├── config/       # Shared constants and configuration
│   ├── eslint-config/ # Shared ESLint rules
│   ├── tsconfig/     # Shared TypeScript configs
│   ├── types/        # Shared TypeScript interfaces
│   ├── ui/           # Shared React component library
│   └── utils/        # Shared utility functions
├── prisma/
│   ├── schema.prisma    # Database schema
│   ├── seed.ts          # Seed script
│   └── migrations/      # Migration history
└── docker/
    └── docker-compose.yml
```

## Useful commands

| Command                  | Description                                      |
| ------------------------ | ------------------------------------------------ |
| `pnpm dev`               | Start all apps in development mode               |
| `pnpm build`             | Build all apps and packages                      |
| `pnpm type-check`        | Run TypeScript type checking across all packages |
| `pnpm lint`              | Lint all packages                                |
| `pnpm format`            | Format all files with Prettier                   |
| `pnpm db:generate`       | Generate the Prisma Client                       |
| `pnpm db:migrate`        | Create and apply a new migration                 |
| `pnpm db:migrate:deploy` | Apply pending migrations (CI/production)         |
| `pnpm db:seed`           | Seed the database                                |
| `pnpm db:studio`         | Open Prisma Studio                               |
