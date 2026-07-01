import { Test, type TestingModule } from '@nestjs/testing';

import { SearchRepository } from '../repositories/search.repository';

import { PrismaService } from '@/prisma/prisma.service';

const ORG = 'org-uuid-1';

const makeApplicantRow = (overrides = {}) => ({
  id: 'app-1',
  applicantNumber: 'APP-2026-0001',
  firstName: 'John',
  middleName: null,
  lastName: 'Doe',
  email: 'john@example.com',
  phone: null,
  status: 'active',
  createdAt: new Date(),
  ...overrides,
});

const makeDocumentRow = (overrides = {}) => ({
  id: 'doc-1',
  applicantId: 'app-1',
  title: 'Passport',
  originalFilename: 'passport.pdf',
  description: null,
  tags: ['identity'],
  category: 'identity',
  status: 'pending',
  createdAt: new Date(),
  ...overrides,
});

const makeWorkflowRow = (overrides = {}) => ({
  id: 'wf-1',
  applicantId: 'app-1',
  enteredStageAt: new Date(),
  applicant: { applicantNumber: 'APP-2026-0001', firstName: 'John', lastName: 'Doe' },
  currentStage: { name: 'New Inquiry' },
  ...overrides,
});

describe('SearchRepository', () => {
  let repo: SearchRepository;
  let prisma: {
    $transaction: jest.Mock;
    applicant: { findMany: jest.Mock; count: jest.Mock };
    document: { findMany: jest.Mock; count: jest.Mock };
    applicantWorkflow: { findMany: jest.Mock; count: jest.Mock };
  };

  beforeEach(async () => {
    const findMany = jest.fn();
    const count = jest.fn();

    prisma = {
      // Array-form $transaction: resolve all promises in the array
      $transaction: jest.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
      applicant: { findMany, count },
      document: { findMany, count },
      applicantWorkflow: { findMany, count },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [SearchRepository, { provide: PrismaService, useValue: prisma }],
    }).compile();

    repo = module.get(SearchRepository);
  });

  describe('searchApplicants', () => {
    it('returns typed applicant results and total', async () => {
      const row = makeApplicantRow();
      prisma.applicant.findMany.mockResolvedValue([row]);
      prisma.applicant.count.mockResolvedValue(1);

      const { results, total } = await repo.searchApplicants('john', ORG, 0, 20);

      const first = results[0];
      expect(total).toBe(1);
      expect(first).toBeDefined();
      expect(first?.type).toBe('applicant');
      expect((first as { firstName: string }).firstName).toBe('John');
    });

    it('returns empty when no rows match', async () => {
      prisma.applicant.findMany.mockResolvedValue([]);
      prisma.applicant.count.mockResolvedValue(0);
      const { results, total } = await repo.searchApplicants('xyz', ORG, 0, 20);
      expect(results).toHaveLength(0);
      expect(total).toBe(0);
    });
  });

  describe('searchDocuments', () => {
    it('returns typed document results', async () => {
      const row = makeDocumentRow();
      prisma.document.findMany.mockResolvedValue([row]);
      prisma.document.count.mockResolvedValue(1);

      const { results, total } = await repo.searchDocuments('passport', ORG, 0, 20);

      const first = results[0];
      expect(total).toBe(1);
      expect(first).toBeDefined();
      expect(first?.type).toBe('document');
      expect((first as { tags: string[] }).tags).toContain('identity');
    });
  });

  describe('searchWorkflows', () => {
    it('maps nested relations into a flat WorkflowSearchResult', async () => {
      const row = makeWorkflowRow();
      prisma.applicantWorkflow.findMany.mockResolvedValue([row]);
      prisma.applicantWorkflow.count.mockResolvedValue(1);

      const { results, total } = await repo.searchWorkflows('inquiry', ORG, 0, 20);

      const first = results[0];
      expect(total).toBe(1);
      expect(first).toBeDefined();
      expect(first?.type).toBe('workflow');
      expect((first as { currentStageName: string }).currentStageName).toBe('New Inquiry');
      expect((first as { applicantNumber: string }).applicantNumber).toBe('APP-2026-0001');
    });
  });
});
