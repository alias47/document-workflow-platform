import type { Config } from 'jest';

/**
 * Jest configuration for integration tests that exercise the real database.
 * Run with: pnpm --filter @repo/api test:integration
 *
 * These tests use the DATABASE_URL from .env and wrap each test in a
 * rolled-back transaction to keep the DB clean.
 */
const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.integration\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: {
          emitDecoratorMetadata: true,
          experimentalDecorators: true,
        },
      },
    ],
  },
  setupFiles: ['<rootDir>/test-setup.ts'],
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage-integration',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  // Integration tests are slower — allow 60 s per test
  testTimeout: 60000,
};

export default config;
