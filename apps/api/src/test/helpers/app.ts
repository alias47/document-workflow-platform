/**
 * E2E test application factory.
 *
 * Boots the full NestJS application (identical pipeline to production) and
 * returns a supertest agent that can make HTTP requests against it.
 *
 * Usage:
 *   let app: INestApplication;
 *   let request: supertest.Agent;
 *
 *   beforeAll(async () => { ({ app, request } = await createTestApp(orgId)); });
 *   afterAll(async () => { await app.close(); });
 */

import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ThrottlerStorage } from '@nestjs/throttler';
import cookieParser from 'cookie-parser';
import supertest from 'supertest';

import { AppModule } from '../../app.module';
import { HttpExceptionFilter } from '../../common/filters/http-exception.filter';
import { ResponseInterceptor } from '../../common/interceptors/response.interceptor';
import { globalValidationPipe } from '../../common/pipes/validation.pipe';

export interface TestApp {
  app: INestApplication;
  request: supertest.Agent;
}

/**
 * Bootstrap a full NestJS application instance for E2E testing.
 *
 * The DEFAULT_ORG_ID env var is set to `orgId` so the auth controller routes
 * login requests to the seeded test organization. Reset to the previous value
 * (or unset) after the test suite in teardown.
 *
 * Throttling is disabled: the ThrottlerModule is still wired (as in production)
 * but tests skip throttler limits because they run from a single IP.
 * If individual tests need to verify throttling, override with SkipThrottle.
 */
export async function createTestApp(orgId: string): Promise<TestApp> {
  // Point the auth controller's defaultOrganizationId at the test org.
  process.env['DEFAULT_ORG_ID'] = orgId;

  // Replace the ThrottlerStorage with a no-op store so rate-limiting is
  // never triggered in tests. The guard logic stays intact but can never
  // accumulate hits that would block subsequent requests.
  const noopThrottlerStorage: ThrottlerStorage = {
    increment: async () => ({
      totalHits: 1,
      timeToExpire: 0,
      isBlocked: false,
      timeToBlockExpire: 0,
    }),
  };

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(ThrottlerStorage)
    .useValue(noopThrottlerStorage)
    .compile();

  const app = moduleRef.createNestApplication();

  // Replicate the same pipeline as main.ts so tests exercise identical behaviour.
  app.use(cookieParser());
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(globalValidationPipe as ValidationPipe);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  await app.init();

  const httpServer = app.getHttpServer() as Parameters<typeof supertest.agent>[0];
  const request = supertest.agent(httpServer);

  return { app, request };
}

/**
 * Perform a staff login and return the agent with cookies set.
 * The cookies are automatically forwarded on subsequent requests via the agent.
 */
export async function loginAsStaff(
  request: supertest.Agent,
  email: string,
  password: string,
): Promise<void> {
  const res = await request.post('/api/v1/auth/login').send({ email, password }).expect(200);

  // Cookies are set by the response headers and stored automatically
  // in the supertest Agent (stateful across requests in the same agent).
  if (!res.headers['set-cookie']) {
    throw new Error(`Staff login failed for ${email}: no Set-Cookie headers`);
  }
}

/**
 * Perform an applicant portal login and return the agent with cookies set.
 */
export async function loginAsApplicant(
  request: supertest.Agent,
  email: string,
  password: string,
): Promise<void> {
  const res = await request
    .post('/api/v1/applicant-auth/login')
    .send({ email, password })
    .expect(200);

  if (!res.headers['set-cookie']) {
    throw new Error(`Applicant login failed for ${email}: no Set-Cookie headers`);
  }
}
