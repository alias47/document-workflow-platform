import { createTestApp, loginAsApplicant, loginAsStaff } from '../helpers/app';
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

let app: INestApplication;
let request: supertest.Agent;
let org: SeedOrg;
let applicant: SeedApplicant;
let seedDoc: SeedDocument;

beforeAll(async () => {
  org = await seedOrg();
  applicant = await seedApplicant(org.orgId, org.staffId);
  seedDoc = await seedDocumentRequirement(org.orgId, applicant.applicantId);
  ({ app, request } = await createTestApp(org.orgId));
});

afterAll(async () => {
  await app.close();
  await teardownOrg(org.orgId);
  await rawPrisma.$disconnect();
});

describe('Applicant creation — POST /applicants', () => {
  it('staff can create a new applicant with required fields', async () => {
    await loginAsStaff(request, org.staffEmail, org.staffPassword);

    const res = await request
      .post('/api/v1/applicants')
      .send({
        firstName: 'Jane',
        lastName: 'Doe',
        email: `jane-${Date.now()}@example.test`,
        phone: '+1-555-0100',
        nationality: 'US',
        assignedStaffId: org.staffId,
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.applicantNumber).toMatch(/^APP-\d{4}-\d{4}$/);
  });

  it('returns 400 when required fields are missing', async () => {
    await loginAsStaff(request, org.staffEmail, org.staffPassword);
    await request.post('/api/v1/applicants').send({ firstName: 'Only' }).expect(400);
  });

  it('returns 401 when unauthenticated', async () => {
    const { app: freshApp, request: freshReq } = await createTestApp(org.orgId);
    await freshReq
      .post('/api/v1/applicants')
      .send({ firstName: 'No', lastName: 'Auth', email: 'anon@test.example' })
      .expect(401);
    await freshApp.close();
  });
});

describe('Applicant retrieval — GET /applicants/:id', () => {
  it('returns the applicant detail for a valid id', async () => {
    await loginAsStaff(request, org.staffEmail, org.staffPassword);

    const res = await request.get(`/api/v1/applicants/${applicant.applicantId}`).expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(applicant.applicantId);
  });

  it('returns 404 for an unknown id', async () => {
    await loginAsStaff(request, org.staffEmail, org.staffPassword);
    await request.get('/api/v1/applicants/00000000-0000-0000-0000-000000000000').expect(404);
  });
});

describe('Applicant portal login — POST /applicant-auth/login', () => {
  it('returns 200 and sets HttpOnly cookies', async () => {
    const res = await request
      .post('/api/v1/applicant-auth/login')
      .send({ email: applicant.portalEmail, password: applicant.portalPassword })
      .expect(200);

    expect(res.body.success).toBe(true);
    const cookies: string[] = (res.headers['set-cookie'] as unknown as string[]) ?? [];
    expect(cookies.some((c) => c.startsWith('applicant_access_token='))).toBe(true);
  });

  it('returns 401 on wrong password', async () => {
    await request
      .post('/api/v1/applicant-auth/login')
      .send({ email: applicant.portalEmail, password: 'WrongPass!' })
      .expect(401);
  });
});

describe('Applicant portal profile — GET /applicant/profile', () => {
  it('returns applicant profile when authenticated as applicant', async () => {
    await loginAsApplicant(request, applicant.portalEmail, applicant.portalPassword);

    const res = await request.get('/api/v1/applicant/profile').expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(applicant.applicantId);
  });

  it('returns 401 when not authenticated', async () => {
    const { app: freshApp, request: freshReq } = await createTestApp(org.orgId);
    await freshReq.get('/api/v1/applicant/profile').expect(401);
    await freshApp.close();
  });
});

describe('Document listing for applicant — GET /applicant/documents', () => {
  it('returns documents scoped to the authenticated applicant', async () => {
    // Use a fresh agent to avoid cookie conflicts from previous staff logins.
    const { app: freshApp, request: freshReq } = await createTestApp(org.orgId);
    await loginAsApplicant(freshReq, applicant.portalEmail, applicant.portalPassword);

    const res = await freshReq.get('/api/v1/applicant/documents').expect(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);

    const ids: string[] = (res.body.data as Array<{ id: string }>).map((d) => d.id);
    expect(ids).toContain(seedDoc.documentId);

    await freshApp.close();
  });
});

describe('Document review — PATCH /documents/:id', () => {
  it('staff can verify a document', async () => {
    await loginAsStaff(request, org.staffEmail, org.staffPassword);

    const res = await request
      .patch(`/api/v1/documents/${seedDoc.documentId}`)
      .send({ status: 'verified', verificationNotes: 'Looks good' })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('verified');
    expect(res.body.data.verificationNotes).toBe('Looks good');
  });

  it('unauthenticated request cannot patch a document (401)', async () => {
    const { app: freshApp, request: freshReq } = await createTestApp(org.orgId);
    await freshReq
      .patch(`/api/v1/documents/${seedDoc.documentId}`)
      .send({ status: 'verified' })
      .expect(401);
    await freshApp.close();
  });
});
