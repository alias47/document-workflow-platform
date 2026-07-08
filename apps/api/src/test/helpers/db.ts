/**
 * Raw PrismaClient singleton for E2E / integration test seeding and cleanup.
 *
 * All test files import this module; a single connection is opened once per
 * Jest worker and closed in globalTeardown (or via afterAll in each suite).
 * Never use this client for assertions inside NestJS tests — use the
 * PrismaService provided by the app module instead.
 */

import { PrismaClient } from '@prisma/client';

const databaseUrl = process.env['DATABASE_URL'];
if (!databaseUrl) {
  throw new Error('DATABASE_URL env var must be set for E2E / integration tests');
}

export const rawPrisma = new PrismaClient({
  datasources: { db: { url: databaseUrl } },
  log: [],
});
