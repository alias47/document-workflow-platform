// Plugins are imported here (root context) so every workspace and lint-staged
// share the same module instances — avoiding pnpm isolated node_modules issues.
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';
import importX from 'eslint-plugin-import-x';

import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { base, nestjs, nextjs } = require('@repo/eslint-config');

/** Plugins loaded once from root, injected into every config variant. */
const plugins = { tsPlugin, tsParser, importX, prettier };

/** @type {import('eslint').Linter.Config[]} */
export default [
  // ── Global ignores ────────────────────────────────────────────────────────
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/dist/**',
      '**/build/**',
      '**/.turbo/**',
      '**/coverage/**',
      '**/*.tsbuildinfo',
      'apps/frontend/**',
      'prisma/seed.ts',
    ],
  },

  // ── packages/* — shared libraries ─────────────────────────────────────────
  ...base(plugins).map((config) => ({
    ...config,
    files: ['packages/*/src/**/*.{ts,tsx}'],
  })),

  // ── apps/api — NestJS ─────────────────────────────────────────────────────
  ...nestjs(plugins).map((config) => ({
    ...config,
    files: ['apps/api/src/**/*.ts'],
  })),

  // ── apps/web — Next.js ────────────────────────────────────────────────────
  ...nextjs(plugins).map((config) => ({
    ...config,
    files: ['apps/web/src/**/*.{ts,tsx}'],
  })),
];
