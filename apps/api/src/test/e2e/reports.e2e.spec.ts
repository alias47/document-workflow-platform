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
  await seedApplicant(org.orgId, org.staffId);
  ({ app, request } = await createTestApp(org.orgId));
  await loginAsStaff(request, org.staffEmail, org.staffPassword);
});

afterAll(async () => {
  await app.close();
  await teardownOrg(org.orgId);
  await rawPrisma.$disconnect();
});

describe('Reports — GET /reports/applicants', () => {
  it('returns paginated applicant report for admin', async () => {
    const res = await request.get('/api/v1/reports/applicants').expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(typeof res.body.meta?.totalItems).toBe('number');
  });

  it('supports pagination parameters', async () => {
    const res = await request.get('/api/v1/reports/applicants?page=1&pageSize=5').expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.meta?.pageSize).toBeLessThanOrEqual(5);
  });

  it('returns 403 when consultant lacks report.view', async () => {
    const { staffEmail, staffPassword } = await seedConsultantStaff(org.orgId, org.roleId);
    const { app: consultantApp, request: consultantReq } = await createTestApp(org.orgId);
    await loginAsStaff(consultantReq, staffEmail, staffPassword);

    await consultantReq.get('/api/v1/reports/applicants').expect(403);

    await consultantApp.close();
  });
});

describe('Reports — GET /reports/documents', () => {
  it('returns document report for admin', async () => {
    const res = await request.get('/api/v1/reports/documents').expect(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('Reports — Export', () => {
  it('exports applicants as CSV', async () => {
    const res = await request
      .get('/api/v1/reports/applicants/export?format=csv')
      .buffer(true)
      .expect(200);

    const contentType = res.headers['content-type'] as string;
    expect(contentType).toContain('text/csv');
  });

  it('exports applicants as Excel', async () => {
    const res = await request
      .get('/api/v1/reports/applicants/export?format=xlsx')
      .buffer(true)
      .expect(200);

    const contentType = res.headers['content-type'] as string;
    expect(contentType).toContain(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
  });

  it('returns 403 when consultant lacks report.export', async () => {
    const { staffEmail, staffPassword } = await seedConsultantStaff(org.orgId, org.roleId);
    const { app: consultantApp, request: consultantReq } = await createTestApp(org.orgId);
    await loginAsStaff(consultantReq, staffEmail, staffPassword);

    await consultantReq.get('/api/v1/reports/applicants/export?format=csv').expect(403);

    await consultantApp.close();
  });
});
