import { Test, type TestingModule } from '@nestjs/testing';

import { PrismaSearchProvider } from '../providers/prisma-search.provider';
import { SearchRepository } from '../repositories/search.repository';

import type { SearchParams } from '../interfaces/search-provider.interface';

const ORG = 'org-uuid-1';

const BASE_PARAMS: SearchParams = {
  query: 'john',
  organizationId: ORG,
  page: 1,
  pageSize: 20,
};

const makeApplicantResult = () => ({
  type: 'applicant' as const,
  id: 'app-1',
  applicantNumber: 'APP-2026-0001',
  firstName: 'John',
  middleName: null,
  lastName: 'Doe',
  email: 'john@example.com',
  phone: null,
  status: 'active',
  createdAt: new Date(),
});

describe('PrismaSearchProvider', () => {
  let provider: PrismaSearchProvider;
  let repo: jest.Mocked<SearchRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaSearchProvider,
        {
          provide: SearchRepository,
          useValue: {
            searchApplicants: jest.fn(),
            searchDocuments: jest.fn(),
            searchWorkflows: jest.fn(),
          } satisfies Partial<Record<keyof SearchRepository, jest.Mock>>,
        },
      ],
    }).compile();

    provider = module.get(PrismaSearchProvider);
    repo = module.get(SearchRepository) as jest.Mocked<SearchRepository>;
  });

  describe('entity-scoped search', () => {
    it('delegates to searchApplicants when entity=applicant', async () => {
      repo.searchApplicants.mockResolvedValue({ results: [makeApplicantResult()], total: 1 });

      const res = await provider.search({ ...BASE_PARAMS, entity: 'applicant' });

      expect(repo.searchApplicants).toHaveBeenCalledWith('john', ORG, 0, 20);
      expect(repo.searchDocuments).not.toHaveBeenCalled();
      expect(repo.searchWorkflows).not.toHaveBeenCalled();
      expect(res.results).toHaveLength(1);
      expect(res.total).toBe(1);
    });

    it('delegates to searchDocuments when entity=document', async () => {
      repo.searchDocuments.mockResolvedValue({ results: [], total: 0 });
      await provider.search({ ...BASE_PARAMS, entity: 'document' });
      expect(repo.searchDocuments).toHaveBeenCalledWith('john', ORG, 0, 20);
    });

    it('delegates to searchWorkflows when entity=workflow', async () => {
      repo.searchWorkflows.mockResolvedValue({ results: [], total: 0 });
      await provider.search({ ...BASE_PARAMS, entity: 'workflow' });
      expect(repo.searchWorkflows).toHaveBeenCalledWith('john', ORG, 0, 20);
    });
  });

  describe('cross-entity search', () => {
    it('queries all three entity types in parallel and merges results', async () => {
      repo.searchApplicants.mockResolvedValue({ results: [makeApplicantResult()], total: 1 });
      repo.searchDocuments.mockResolvedValue({ results: [], total: 0 });
      repo.searchWorkflows.mockResolvedValue({ results: [], total: 0 });

      const res = await provider.search(BASE_PARAMS);

      expect(repo.searchApplicants).toHaveBeenCalled();
      expect(repo.searchDocuments).toHaveBeenCalled();
      expect(repo.searchWorkflows).toHaveBeenCalled();
      expect(res.results).toHaveLength(1);
      expect(res.total).toBe(1);
    });
  });

  describe('pagination metadata', () => {
    it('computes totalPages correctly', async () => {
      repo.searchApplicants.mockResolvedValue({ results: [], total: 45 });
      const res = await provider.search({ ...BASE_PARAMS, entity: 'applicant', pageSize: 20 });
      expect(res.totalPages).toBe(3);
    });

    it('totalPages is at least 1 when total is 0', async () => {
      repo.searchApplicants.mockResolvedValue({ results: [], total: 0 });
      const res = await provider.search({ ...BASE_PARAMS, entity: 'applicant' });
      expect(res.totalPages).toBe(1);
    });
  });

  describe('query normalisation', () => {
    it('trims surrounding whitespace before delegating', async () => {
      repo.searchApplicants.mockResolvedValue({ results: [], total: 0 });
      await provider.search({ ...BASE_PARAMS, entity: 'applicant', query: '  john  ' });
      expect(repo.searchApplicants).toHaveBeenCalledWith('john', ORG, 0, 20);
    });
  });
});
