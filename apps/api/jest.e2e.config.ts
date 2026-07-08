import type { Config } from 'jest';

/**
 * Jest configuration for E2E tests.
 *
 * E2E tests bootstrap the full NestJS application and make real HTTP requests
 * against a live PostgreSQL database. They run in serial (--runInBand) to
 * avoid port conflicts and reduce DB contention.
 *
 * Run with: pnpm --filter @repo/api test:e2e
 */
const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.e2e\\.spec\\.ts$',
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
  coverageDirectory: '../coverage-e2e',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  // E2E tests boot the full app and touch the real DB — allow 120 s per test.
  testTimeout: 120000,
  // Never run in parallel: each suite owns the DEFAULT_ORG_ID env var and
  // boots the NestJS server on the same port.
  maxWorkers: 1,
};

export default config;
