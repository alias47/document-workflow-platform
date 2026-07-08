import { createTestApp, loginAsStaff } from '../helpers/app';
import { rawPrisma } from '../helpers/db';
import { seedConsultantStaff, seedOrg, teardownOrg, type SeedOrg } from '../helpers/seed';

import type { INestApplication } from '@nestjs/common';
import type * as supertest from 'supertest';

let app: INestApplication;
let request: supertest.Agent;
let org: SeedOrg;
let org2: SeedOrg;

beforeAll(async () => {
  [org, org2] = await Promise.all([seedOrg(), seedOrg()]);
  ({ app, request } = await createTestApp(org.orgId));
});

afterAll(async () => {
  await app.close();
  await Promise.all([teardownOrg(org.orgId), teardownOrg(org2.orgId)]);
  await rawPrisma.$disconnect();
});

describe('Staff Auth — POST /auth/login', () => {
  it('returns 200 and sets HttpOnly cookies on valid credentials', async () => {
    const res = await request
      .post('/api/v1/auth/login')
      .send({ email: org.staffEmail, password: org.staffPassword })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.staff).toBeDefined();

    const cookies: string[] = (res.headers['set-cookie'] as unknown as string[]) ?? [];
    const hasAccessToken = cookies.some((c) => c.startsWith('access_token='));
    const hasRefreshToken = cookies.some((c) => c.startsWith('refresh_token='));
    expect(hasAccessToken).toBe(true);
    expect(hasRefreshToken).toBe(true);

    const accessCookie = cookies.find((c) => c.startsWith('access_token=')) ?? '';
    expect(accessCookie).toContain('HttpOnly');
  });

  it('returns 401 on wrong password', async () => {
    await request
      .post('/api/v1/auth/login')
      .send({ email: org.staffEmail, password: 'WrongPassword!' })
      .expect(401);
  });

  it('returns 401 on unknown email', async () => {
    await request
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@nowhere.test', password: org.staffPassword })
      .expect(401);
  });

  it('returns 400 on missing body fields', async () => {
    await request.post('/api/v1/auth/login').send({}).expect(400);
  });
});

describe('Staff Auth — GET /auth/me', () => {
  it('returns current user profile when authenticated', async () => {
    const agent = request;
    await loginAsStaff(agent, org.staffEmail, org.staffPassword);

    const res = await agent.get('/api/v1/auth/me').expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(org.staffEmail);
    expect(res.body.data.organizationId).toBe(org.orgId);
  });

  it('returns 401 when not authenticated', async () => {
    const { app: freshApp, request: freshReq } = await createTestApp(org.orgId);
    await freshReq.get('/api/v1/auth/me').expect(401);
    await freshApp.close();
  });
});

describe('Staff Auth — POST /auth/refresh', () => {
  it('returns 200 and rotates cookies', async () => {
    const agent = request;
    await loginAsStaff(agent, org.staffEmail, org.staffPassword);

    const res = await agent.post('/api/v1/auth/refresh').expect(200);
    expect(res.body.success).toBe(true);

    const cookies: string[] = (res.headers['set-cookie'] as unknown as string[]) ?? [];
    expect(cookies.some((c) => c.startsWith('access_token='))).toBe(true);
  });

  it('returns 401 when no refresh cookie present', async () => {
    const { app: freshApp, request: freshReq } = await createTestApp(org.orgId);
    await freshReq.post('/api/v1/auth/refresh').expect(401);
    await freshApp.close();
  });
});

describe('Staff Auth — POST /auth/logout', () => {
  it('clears cookies and revokes session', async () => {
    const { app: freshApp, request: freshReq } = await createTestApp(org.orgId);
    await loginAsStaff(freshReq, org.staffEmail, org.staffPassword);

    const logoutRes = await freshReq.post('/api/v1/auth/logout').expect(200);
    expect(logoutRes.body.success).toBe(true);

    const cookies: string[] = (logoutRes.headers['set-cookie'] as unknown as string[]) ?? [];
    const accessCookie = cookies.find((c) => c.startsWith('access_token=')) ?? '';
    expect(accessCookie).toContain('Expires=Thu, 01 Jan 1970');

    await freshApp.close();
  });
});

describe('Organization isolation — staff cannot access other org data', () => {
  it('staff in org1 cannot list org2 applicants', async () => {
    await loginAsStaff(request, org.staffEmail, org.staffPassword);

    // GET /applicants scopes by the JWT's organizationId — the response must
    // not contain org2 data. We seed a consultant in org2 and verify they are absent.
    const { staffEmail: org2Email, staffPassword: org2Password } = await seedConsultantStaff(
      org2.orgId,
      org2.roleId,
    );

    // Authenticate as org2 staff using a fresh app scoped to org2
    const { app: org2App, request: org2Req } = await createTestApp(org2.orgId);
    await loginAsStaff(org2Req, org2Email, org2Password);

    // org2 staff list their own applicants — response is scoped to org2
    const res = await org2Req.get('/api/v1/applicants').expect(200);
    expect(res.body.data).toBeDefined();

    // org1 staff list applicants — they must not see org2 data
    const org1Res = await request.get('/api/v1/applicants').expect(200);
    const org1Ids: string[] = (org1Res.body.data as Array<{ id: string }>).map((a) => a.id);
    const org2StaffIds: string[] = (res.body.data as Array<{ id: string }>).map((a) => a.id);
    const overlap = org1Ids.filter((id) => org2StaffIds.includes(id));
    expect(overlap).toHaveLength(0);

    await org2App.close();
  });
});
