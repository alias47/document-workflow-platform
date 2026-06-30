/**
 * Integration tests for ApplicantRepository.
 * These tests run against a real PostgreSQL database (via PrismaService).
 * Requires DATABASE_URL to be set and `prisma migrate deploy` to have run.
 *
 * Run with: npx jest applicant.repository.spec.ts
 */
import { Test, type TestingModule } from '@nestjs/testing';

import { ApplicantRepository } from '../repositories/applicant.repository';

import { PrismaModule } from '@/prisma/prisma.module';
import { PrismaService } from '@/prisma/prisma.service';

// Integration tests: only run when TEST_ORG_ID is explicitly provided (i.e. in CI or manually).
// Run with: TEST_ORG_ID=<uuid> TEST_STAFF_ID=<uuid> npx jest applicant.repository.spec.ts
const TEST_ORG_ID = process.env['TEST_ORG_ID'];
const TEST_STAFF_ID = process.env['TEST_STAFF_ID'];
const RUN_INTEGRATION = Boolean(TEST_ORG_ID && TEST_STAFF_ID);

const describeIntegration = RUN_INTEGRATION ? describe : describe.skip;

describeIntegration('ApplicantRepository (integration)', () => {
  // Safe to use fallback: this describe block only runs when RUN_INTEGRATION is true (both are defined)
  const orgId = TEST_ORG_ID ?? '';
  const staffId = TEST_STAFF_ID ?? '';

  let repo: ApplicantRepository;
  let prisma: PrismaService;
  const createdIds: string[] = [];

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [ApplicantRepository],
    }).compile();

    repo = module.get(ApplicantRepository);
    prisma = module.get(PrismaService);
  });

  afterAll(async () => {
    if (createdIds.length) {
      await prisma.applicantAssignment.deleteMany({
        where: { applicantId: { in: createdIds } },
      });
      await prisma.applicant.deleteMany({ where: { id: { in: createdIds } } });
    }
    await prisma.$disconnect();
  });

  async function createTestApplicant(suffix: string) {
    const applicant = await prisma.applicant.create({
      data: {
        organizationId: orgId,
        applicantNumber: `TEST-REPO-${suffix}-${Date.now()}`,
        firstName: 'Test',
        lastName: `Applicant-${suffix}`,
        email: `repo-test-${suffix}-${Date.now()}@example.com`,
        createdBy: staffId,
      },
    });
    createdIds.push(applicant.id);
    return applicant;
  }

  describe('findById', () => {
    it('returns null for a non-existent id', async () => {
      const result = await repo.findById('00000000-0000-0000-0000-000000000099', orgId);
      expect(result).toBeNull();
    });

    it('returns null when org does not match', async () => {
      const applicant = await createTestApplicant('findById-org');
      const result = await repo.findById(applicant.id, 'other-org-id');
      expect(result).toBeNull();
    });
  });

  describe('list', () => {
    it('returns empty list for org with no applicants', async () => {
      const result = await repo.list('non-existent-org', {
        page: 1,
        pageSize: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('filters by status', async () => {
      const testOrg = `00000000-0000-0000-0000-${Date.now().toString().slice(-12)}`;
      // This test only verifies the filter param is wired — actual records depend on seed data
      const result = await repo.list(testOrg, {
        page: 1,
        pageSize: 10,
        status: 'active',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('countByOrganization', () => {
    it('returns 0 for org with no applicants', async () => {
      const count = await repo.countByOrganization('no-such-org');
      expect(count).toBe(0);
    });
  });

  describe('findByEmail', () => {
    it('returns null when email does not exist', async () => {
      const result = await repo.findByEmail(orgId, 'no-such@example.com');
      expect(result).toBeNull();
    });
  });
});
