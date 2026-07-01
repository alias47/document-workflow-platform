/**
 * Integration tests for DocumentRepository.
 * These tests run against a real PostgreSQL database (via PrismaService).
 * Requires DATABASE_URL to be set and `prisma migrate deploy` to have run.
 *
 * Run with: TEST_ORG_ID=<uuid> TEST_STAFF_ID=<uuid> TEST_APPLICANT_ID=<uuid> \
 *   npx jest document.repository.spec.ts
 */
import { Test, type TestingModule } from '@nestjs/testing';

import { DocumentRepository } from '../repositories/document.repository';

import { PrismaModule } from '@/prisma/prisma.module';
import { PrismaService } from '@/prisma/prisma.service';

const TEST_ORG_ID = process.env['TEST_ORG_ID'];
const TEST_STAFF_ID = process.env['TEST_STAFF_ID'];
const TEST_APPLICANT_ID = process.env['TEST_APPLICANT_ID'];
const RUN_INTEGRATION = Boolean(TEST_ORG_ID && TEST_STAFF_ID && TEST_APPLICANT_ID);

const describeIntegration = RUN_INTEGRATION ? describe : describe.skip;

describeIntegration('DocumentRepository (integration)', () => {
  const orgId = TEST_ORG_ID ?? '';
  const staffId = TEST_STAFF_ID ?? '';
  const applicantId = TEST_APPLICANT_ID ?? '';

  let repo: DocumentRepository;
  let prisma: PrismaService;
  const createdIds: string[] = [];

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [DocumentRepository],
    }).compile();

    repo = module.get(DocumentRepository);
    prisma = module.get(PrismaService);
  });

  afterAll(async () => {
    if (createdIds.length) {
      await prisma.document.deleteMany({ where: { id: { in: createdIds } } });
    }
    await prisma.$disconnect();
  });

  async function createTestDocument(suffix: string) {
    const doc = await repo.create({
      organizationId: orgId,
      applicantId,
      uploadedBy: staffId,
      category: 'identity',
      originalFilename: `test-${suffix}.pdf`,
      storedFilename: `stored-${suffix}-${Date.now()}.pdf`,
      mimeType: 'application/pdf',
      fileSize: 1024,
      storageKey: `test/${suffix}-${Date.now()}.pdf`,
      createdBy: staffId,
    });
    createdIds.push(doc.id);
    return doc;
  }

  describe('findById', () => {
    it('returns the document within the same org', async () => {
      const doc = await createTestDocument('findById');
      const result = await repo.findById(doc.id, orgId);
      expect(result?.id).toBe(doc.id);
    });

    it('returns null when org does not match', async () => {
      const doc = await createTestDocument('findById-org');
      const result = await repo.findById(doc.id, 'other-org-id');
      expect(result).toBeNull();
    });

    it('returns null for a non-existent id', async () => {
      const result = await repo.findById('00000000-0000-0000-0000-000000000099', orgId);
      expect(result).toBeNull();
    });
  });

  describe('list', () => {
    it('returns empty list for an org with no documents', async () => {
      const result = await repo.list('00000000-0000-0000-0000-000000000000', {
        page: 1,
        pageSize: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('filters by applicant', async () => {
      await createTestDocument('list-applicant');
      const result = await repo.list(orgId, {
        page: 1,
        pageSize: 10,
        applicantId,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      expect(result.data.every((d) => d.applicantId === applicantId)).toBe(true);
    });
  });

  describe('softDelete', () => {
    it('sets deletedAt and excludes the record from findById', async () => {
      const doc = await createTestDocument('softDelete');
      await repo.softDelete(doc.id, staffId);
      const result = await repo.findById(doc.id, orgId);
      expect(result).toBeNull();
    });
  });
});
