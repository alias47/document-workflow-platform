/**
 * Sprint 12.3 — Integration tests for the applicant upload workflow.
 *
 * Executes against the real PostgreSQL database (DATABASE_URL from .env) to
 * catch FK constraint violations, audit accuracy, and requirement sync that are
 * invisible to unit tests with mocked Prisma.
 *
 * Run with: pnpm --filter @repo/api test:integration
 */

import { randomUUID } from 'crypto';

import { ConfigModule } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';

import { ActivityRepository } from '../../activity/repositories/activity.repository';
import { ActivityService } from '../../activity/services/activity.service';
import { ApplicantService } from '../../applicant/services/applicant.service';
import { AuditRepository } from '../../audit/repositories/audit.repository';
import { AuditService } from '../../audit/services/audit.service';
import { DocumentRepository } from '../../document/repositories/document.repository';
import {
  DocumentUploadService,
  type UploadActor,
} from '../../document/services/document-upload.service';
import { DocumentService } from '../../document/services/document.service';
import { FileValidationService } from '../../document/services/file-validation.service';
import { DocumentRequirementRepository } from '../../document-requirement/repositories/document-requirement.repository';
import { NotificationService } from '../../notification/services/notification.service';
import { STORAGE_PROVIDER } from '../../storage/interfaces/storage-provider.interface';

import { PrismaService } from '@/prisma/prisma.service';

// ─── DB connection ────────────────────────────────────────────────────────────

const databaseUrl = process.env['DATABASE_URL'];
if (!databaseUrl) throw new Error('DATABASE_URL env var is required for integration tests');

const rawPrisma = new PrismaClient({
  datasources: { db: { url: databaseUrl } },
});

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeTestFile(name = 'test.png'): Express.Multer.File {
  const buffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64',
  );
  return {
    fieldname: 'file',
    originalname: name,
    encoding: '7bit',
    mimetype: 'image/png',
    size: buffer.length,
    buffer,
    stream: undefined as never,
    destination: '',
    filename: name,
    path: '',
  };
}

const mockStorage = {
  upload: jest.fn().mockImplementation(async (input: { storedFilename: string }) => ({
    storageKey: `test/org/${input.storedFilename}`,
  })),
  download: jest.fn(),
  delete: jest.fn().mockResolvedValue(undefined),
  exists: jest.fn().mockResolvedValue(true),
};

const mockNotificationService = { notify: jest.fn().mockResolvedValue(undefined) };

// ─── Seed data ────────────────────────────────────────────────────────────────

let seedOrgId: string;
let seedStaffId: string;
let seedApplicantId: string;
let seedApplicantReqId: string;

async function seedTestData() {
  const orgId = randomUUID();
  const roleId = randomUUID();
  const staffId = randomUUID();
  const applicantId = randomUUID();
  const requirementId = randomUUID();
  const applicantReqId = randomUUID();

  await rawPrisma.$executeRawUnsafe(`
    INSERT INTO organizations (id, name, slug, "contactEmail", "isActive", "createdAt", "updatedAt")
    VALUES ('${orgId}', 'Test Org 123', 'test-org-${orgId.slice(0, 8)}', 'org@test.com', true, now(), now())
  `);
  await rawPrisma.$executeRawUnsafe(`
    INSERT INTO roles (id, "organizationId", name, "createdAt", "updatedAt")
    VALUES ('${roleId}', '${orgId}', 'Consultant', now(), now())
  `);
  await rawPrisma.$executeRawUnsafe(`
    INSERT INTO staff (id, "organizationId", "roleId", "firstName", "lastName", email, "passwordHash", status, "createdAt", "updatedAt")
    VALUES ('${staffId}', '${orgId}', '${roleId}', 'Test', 'Staff', 'staff-${staffId.slice(0, 8)}@test.com', 'hash', 'active', now(), now())
  `);
  await rawPrisma.$executeRawUnsafe(`
    INSERT INTO applicants (id, "organizationId", "applicantNumber", "firstName", "lastName", status, "createdAt", "updatedAt")
    VALUES ('${applicantId}', '${orgId}', 'INT-${orgId.slice(0, 6)}', 'John', 'Doe', 'active', now(), now())
  `);
  await rawPrisma.$executeRawUnsafe(`
    INSERT INTO document_requirements (id, "organizationId", name, category, "isRequired", "isActive", "sortOrder", "createdAt", "updatedAt")
    VALUES ('${requirementId}', '${orgId}', 'Passport', 'identity', true, true, 1, now(), now())
  `);
  await rawPrisma.$executeRawUnsafe(`
    INSERT INTO applicant_document_requirements (id, "applicantId", "requirementId", status, "assignedAt")
    VALUES ('${applicantReqId}', '${applicantId}', '${requirementId}', 'pending', now())
  `);

  seedOrgId = orgId;
  seedStaffId = staffId;
  seedApplicantId = applicantId;
  seedApplicantReqId = applicantReqId;
}

async function cleanupTestData() {
  if (!seedOrgId) return;
  await rawPrisma.$executeRawUnsafe(
    `DELETE FROM audit_logs WHERE "organizationId" = '${seedOrgId}'`,
  );
  await rawPrisma.$executeRawUnsafe(
    `DELETE FROM applicant_activities WHERE "organizationId" = '${seedOrgId}'`,
  );
  await rawPrisma.$executeRawUnsafe(
    `DELETE FROM documents WHERE "organizationId" = '${seedOrgId}'`,
  );
  await rawPrisma.$executeRawUnsafe(
    `DELETE FROM applicant_document_requirements WHERE "applicantId" = '${seedApplicantId}'`,
  );
  await rawPrisma.$executeRawUnsafe(
    `DELETE FROM document_requirements WHERE "organizationId" = '${seedOrgId}'`,
  );
  await rawPrisma.$executeRawUnsafe(
    `DELETE FROM applicants WHERE "organizationId" = '${seedOrgId}'`,
  );
  await rawPrisma.$executeRawUnsafe(`DELETE FROM staff WHERE "organizationId" = '${seedOrgId}'`);
  await rawPrisma.$executeRawUnsafe(`DELETE FROM roles WHERE "organizationId" = '${seedOrgId}'`);
  await rawPrisma.$executeRawUnsafe(`DELETE FROM organizations WHERE id = '${seedOrgId}'`);
}

// ─── Test module ──────────────────────────────────────────────────────────────

let testingModule: TestingModule;
let uploadService: DocumentUploadService;
let documentRepo: DocumentRepository;
let documentService: DocumentService;
let requirementRepo: DocumentRequirementRepository;

beforeAll(async () => {
  await seedTestData();

  const mockApplicantService = {
    getById: jest.fn().mockImplementation(async (id: string) => ({
      id,
      firstName: 'John',
      lastName: 'Doe',
      email: 'applicant@test.com',
      organizationId: seedOrgId,
    })),
  };

  testingModule = await Test.createTestingModule({
    imports: [ConfigModule.forRoot({ isGlobal: true })],
    providers: [
      DocumentUploadService,
      DocumentRepository,
      DocumentService,
      DocumentRequirementRepository,
      FileValidationService,
      AuditService,
      AuditRepository,
      ActivityRepository,
      {
        provide: ActivityService,
        useFactory: (repo: ActivityRepository, prisma: PrismaService) =>
          new ActivityService(repo, prisma),
        inject: [ActivityRepository, PrismaService],
      },
      { provide: ApplicantService, useValue: mockApplicantService },
      { provide: NotificationService, useValue: mockNotificationService },
      { provide: STORAGE_PROVIDER, useValue: mockStorage },
      PrismaService,
    ],
  }).compile();

  uploadService = testingModule.get(DocumentUploadService);
  documentRepo = testingModule.get(DocumentRepository);
  documentService = testingModule.get(DocumentService);
  requirementRepo = testingModule.get(DocumentRequirementRepository);
});

afterAll(async () => {
  await cleanupTestData();
  await testingModule.close();
  await rawPrisma.$disconnect();
});

beforeEach(() => {
  mockStorage.upload.mockClear();
  mockNotificationService.notify.mockClear();
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Upload a document and return its ID; common setup pattern. */
async function uploadAsApplicant(filename = 'test.png') {
  const actor: UploadActor = { type: 'applicant', applicantId: seedApplicantId };
  const result = await uploadService.upload(
    makeTestFile(filename),
    { applicantId: seedApplicantId, category: 'identity', requirementId: seedApplicantReqId },
    seedOrgId,
    actor,
  );
  return result.id;
}

async function cleanupDoc(docId: string) {
  await rawPrisma.$executeRawUnsafe(`DELETE FROM audit_logs WHERE "resourceId" = '${docId}'`);
  await rawPrisma.$executeRawUnsafe(
    `DELETE FROM applicant_activities WHERE (metadata->>'documentId') = '${docId}'`,
  );
  await rawPrisma.$executeRawUnsafe(`DELETE FROM documents WHERE id = '${docId}'`);
  await rawPrisma.$executeRawUnsafe(
    `UPDATE applicant_document_requirements SET status = 'pending', "completedAt" = NULL WHERE id = '${seedApplicantReqId}'`,
  );
}

// ─── FK integrity ─────────────────────────────────────────────────────────────

describe('Applicant upload — FK integrity (Sprint 12.3 §4)', () => {
  let docId: string;
  afterEach(() => cleanupDoc(docId));

  it('stores uploadedByApplicantId and leaves uploadedBy NULL for portal uploads', async () => {
    docId = await uploadAsApplicant();
    const doc = await rawPrisma.document.findUnique({ where: { id: docId } });
    expect(doc).not.toBeNull();
    expect(doc?.uploadedBy).toBeNull();
    expect(doc?.uploadedByApplicantId).toBe(seedApplicantId);
  });

  it('does not violate the staff FK when uploading as applicant', async () => {
    // Previously failed: applicant ID was written to uploadedBy → staff FK violation.
    docId = await uploadAsApplicant();
    const doc = await rawPrisma.document.findUnique({ where: { id: docId } });
    expect(doc?.uploadedByApplicantId).toBe(seedApplicantId);
    expect(doc?.uploadedBy).toBeNull();
  });

  it('preserves staff upload: uploadedBy = staffId, uploadedByApplicantId = NULL', async () => {
    const actor: UploadActor = { type: 'staff', staffId: seedStaffId };
    const result = await uploadService.upload(
      makeTestFile(),
      { applicantId: seedApplicantId, category: 'identity', requirementId: seedApplicantReqId },
      seedOrgId,
      actor,
    );
    docId = result.id;
    const doc = await rawPrisma.document.findUnique({ where: { id: docId } });
    expect(doc?.uploadedBy).toBe(seedStaffId);
    expect(doc?.uploadedByApplicantId).toBeNull();
  });
});

// ─── Audit logging ────────────────────────────────────────────────────────────

describe('Applicant upload — audit logging (Sprint 12.3 §5)', () => {
  let docId: string;
  afterEach(() => cleanupDoc(docId));

  it('records actorType=applicant in audit log for portal uploads', async () => {
    docId = await uploadAsApplicant();
    // Allow void audit/activity promises to settle.
    await new Promise((r) => setTimeout(r, 200));
    const auditLog = await rawPrisma.auditLog.findFirst({
      where: { resourceId: docId, action: 'document.uploaded' },
    });
    expect(auditLog).not.toBeNull();
    expect(auditLog?.actorType).toBe('applicant');
    expect(auditLog?.actorId).toBeNull();
  });

  it('records actorType=staff in audit log for staff uploads', async () => {
    const actor: UploadActor = { type: 'staff', staffId: seedStaffId };
    const result = await uploadService.upload(
      makeTestFile(),
      { applicantId: seedApplicantId, category: 'identity', requirementId: seedApplicantReqId },
      seedOrgId,
      actor,
    );
    docId = result.id;
    await new Promise((r) => setTimeout(r, 200));
    const auditLog = await rawPrisma.auditLog.findFirst({
      where: { resourceId: docId, action: 'document.uploaded' },
    });
    expect(auditLog?.actorType).toBe('staff');
    expect(auditLog?.actorId).toBe(seedStaffId);
  });
});

// ─── Document listing ─────────────────────────────────────────────────────────

describe('Document listing — applicant portal (Sprint 12.3 §6)', () => {
  let docId: string;

  beforeEach(async () => {
    docId = await uploadAsApplicant('listing-test.png');
  });

  afterEach(() => cleanupDoc(docId));

  it('returns the uploaded document in listForApplicantPortal', async () => {
    const { data, total } = await documentRepo.listForApplicantPortal(seedApplicantId, seedOrgId, {
      page: 1,
      pageSize: 25,
    });
    expect(total).toBeGreaterThanOrEqual(1);
    const found = data.find((d) => d.id === docId);
    expect(found).toBeDefined();
    expect(found?.originalFilename).toBe('listing-test.png');
  });

  it('does not leak documents to a different applicant', async () => {
    const { data } = await documentRepo.listForApplicantPortal(randomUUID(), seedOrgId, {
      page: 1,
      pageSize: 25,
    });
    expect(data.find((d) => d.id === docId)).toBeUndefined();
  });
});

// ─── Requirement status sync ─────────────────────────────────────────────────

describe('Requirement status sync on verify/reject (Sprint 12.3 §11)', () => {
  let docId: string;

  beforeEach(async () => {
    docId = await uploadAsApplicant();
    const req = await rawPrisma.applicantDocumentRequirement.findUnique({
      where: { id: seedApplicantReqId },
    });
    expect(req?.status).toBe('uploaded');
  });

  afterEach(() => cleanupDoc(docId));

  it('syncs requirement to approved when document is verified', async () => {
    await documentService.update(docId, seedOrgId, { status: 'verified' }, seedStaffId);
    const req = await rawPrisma.applicantDocumentRequirement.findUnique({
      where: { id: seedApplicantReqId },
    });
    expect(req?.status).toBe('approved');
    expect(req?.completedAt).not.toBeNull();
  });

  it('syncs requirement to rejected when document is rejected', async () => {
    await documentService.update(
      docId,
      seedOrgId,
      { status: 'rejected', verificationNotes: 'Wrong document' },
      seedStaffId,
    );
    const req = await rawPrisma.applicantDocumentRequirement.findUnique({
      where: { id: seedApplicantReqId },
    });
    expect(req?.status).toBe('rejected');
  });

  it('surfaces verificationNotes in listApplicantRequirements', async () => {
    const notes = 'This passport has expired';
    await documentService.update(
      docId,
      seedOrgId,
      { status: 'rejected', verificationNotes: notes },
      seedStaffId,
    );
    const requirements = await requirementRepo.listApplicantRequirements(
      seedApplicantId,
      seedOrgId,
    );
    const req = requirements.find((r) => r.id === seedApplicantReqId);
    const latestDoc = req?.documents.at(0);
    expect(latestDoc?.verificationNotes).toBe(notes);
  });
});
