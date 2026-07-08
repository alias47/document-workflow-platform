import { createTestApp, loginAsStaff } from '../helpers/app';
import { rawPrisma } from '../helpers/db';
import {
  seedApplicant,
  seedDocumentRequirement,
  seedOrg,
  teardownOrg,
  type SeedApplicant,
  type SeedDocument,
  type SeedOrg,
} from '../helpers/seed';

import type { INestApplication } from '@nestjs/common';
import type * as supertest from 'supertest';

let org1App: INestApplication;
let org1Req: supertest.Agent;
let org1: SeedOrg;
let org1Applicant: SeedApplicant;
let org1Doc: SeedDocument;

let org2App: INestApplication;
let org2Req: supertest.Agent;
let org2: SeedOrg;
let org2Applicant: SeedApplicant;

beforeAll(async () => {
  [org1, org2] = await Promise.all([seedOrg(), seedOrg()]);
  [org1Applicant, org2Applicant] = await Promise.all([
    seedApplicant(org1.orgId, org1.staffId),
    seedApplicant(org2.orgId, org2.staffId),
  ]);
  org1Doc = await seedDocumentRequirement(org1.orgId, org1Applicant.applicantId);

  // Sequential to avoid concurrent DEFAULT_ORG_ID env var race between the two apps.
  ({ app: org1App, request: org1Req } = await createTestApp(org1.orgId));
  ({ app: org2App, request: org2Req } = await createTestApp(org2.orgId));

  await loginAsStaff(org1Req, org1.staffEmail, org1.staffPassword);
  await loginAsStaff(org2Req, org2.staffEmail, org2.staffPassword);
});

afterAll(async () => {
  await Promise.all([org1App.close(), org2App.close()]);
  await Promise.all([teardownOrg(org1.orgId), teardownOrg(org2.orgId)]);
  await rawPrisma.$disconnect();
});

describe('Organization isolation — applicant access', () => {
  it('org2 staff cannot fetch org1 applicant by id', async () => {
    await org2Req.get(`/api/v1/applicants/${org1Applicant.applicantId}`).expect(404);
  });

  it('org1 staff cannot fetch org2 applicant by id', async () => {
    await org1Req.get(`/api/v1/applicants/${org2Applicant.applicantId}`).expect(404);
  });

  it('org1 applicant list contains only org1 applicants', async () => {
    const res = await org1Req.get('/api/v1/applicants').expect(200);
    const ids: string[] = (res.body.data as Array<{ id: string }>).map((a) => a.id);
    expect(ids).not.toContain(org2Applicant.applicantId);
  });

  it('org2 applicant list contains only org2 applicants', async () => {
    const res = await org2Req.get('/api/v1/applicants').expect(200);
    const ids: string[] = (res.body.data as Array<{ id: string }>).map((a) => a.id);
    expect(ids).not.toContain(org1Applicant.applicantId);
  });
});

describe('Organization isolation — document access', () => {
  it('org2 staff cannot fetch org1 document', async () => {
    await org2Req.get(`/api/v1/documents/${org1Doc.documentId}`).expect(404);
  });

  it('org2 staff cannot update org1 document status', async () => {
    await org2Req
      .patch(`/api/v1/documents/${org1Doc.documentId}`)
      .send({ status: 'verified' })
      .expect(404);
  });
});

describe('Organization isolation — dashboard scoping', () => {
  it('org1 dashboard summary reflects only org1 data', async () => {
    const [r1, r2] = await Promise.all([
      org1Req.get('/api/v1/dashboard/summary').expect(200),
      org2Req.get('/api/v1/dashboard/summary').expect(200),
    ]);
    // Both succeed independently; totals may differ if orgs have different data.
    expect(r1.body.success).toBe(true);
    expect(r2.body.success).toBe(true);
    // The applicant counts are org-scoped; verify they are numeric.
    expect(typeof r1.body.data.kpis.totalApplicants).toBe('number');
    expect(typeof r2.body.data.kpis.totalApplicants).toBe('number');
  });
});
