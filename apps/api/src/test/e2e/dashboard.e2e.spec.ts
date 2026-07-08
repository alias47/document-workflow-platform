import { createTestApp, loginAsStaff } from '../helpers/app';
import { rawPrisma } from '../helpers/db';
import {
  seedApplicant,
  seedConsultantStaff,
  seedOrg,
  teardownOrg,
  type SeedOrg,
} from '../helpers/seed';

import type { INestApplication } from '@nestjs/common';
import type * as supertest from 'supertest';

let app: INestApplication;
let request: supertest.Agent;
let org: SeedOrg;

beforeAll(async () => {
  org = await seedOrg();
  // Seed some applicants so the dashboard has non-zero data
  await Promise.all([seedApplicant(org.orgId, org.staffId), seedApplicant(org.orgId, org.staffId)]);
  ({ app, request } = await createTestApp(org.orgId));
  await loginAsStaff(request, org.staffEmail, org.staffPassword);
});

afterAll(async () => {
  await app.close();
  await teardownOrg(org.orgId);
  await rawPrisma.$disconnect();
});

describe('Dashboard — GET /dashboard/summary', () => {
  it('returns summary with expected numeric KPIs', async () => {
    const res = await request.get('/api/v1/dashboard/summary').expect(200);

    expect(res.body.success).toBe(true);
    const kpis = (res.body.data as { kpis: Record<string, unknown> }).kpis;
    expect(typeof kpis['totalApplicants']).toBe('number');
    expect(kpis['totalApplicants']).toBeGreaterThanOrEqual(2);
    expect(typeof kpis['completedDocuments']).toBe('number');
  });
});

describe('Dashboard — GET /dashboard/activity', () => {
  it('returns an array of recent activity entries', async () => {
    const res = await request.get('/api/v1/dashboard/activity').expect(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('Dashboard — GET /dashboard/workload', () => {
  it('admin can access workload endpoint', async () => {
    const res = await request.get('/api/v1/dashboard/workload').expect(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('consultant without workload permission receives 403', async () => {
    // Consultant role has dashboard.view but NOT dashboard.workload.view
    const { staffEmail, staffPassword } = await seedConsultantStaff(org.orgId, org.roleId);
    const { app: consultantApp, request: consultantReq } = await createTestApp(org.orgId);
    await loginAsStaff(consultantReq, staffEmail, staffPassword);

    await consultantReq.get('/api/v1/dashboard/workload').expect(403);

    await consultantApp.close();
  });
});

describe('Dashboard — GET /dashboard', () => {
  it('returns the full aggregated dashboard', async () => {
    const res = await request.get('/api/v1/dashboard').expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  it('returns 401 when unauthenticated', async () => {
    const { app: freshApp, request: freshReq } = await createTestApp(org.orgId);
    await freshReq.get('/api/v1/dashboard').expect(401);
    await freshApp.close();
  });
});
