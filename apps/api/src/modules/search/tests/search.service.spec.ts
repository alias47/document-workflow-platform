import { Test, type TestingModule } from '@nestjs/testing';

import {
  SEARCH_PROVIDER,
  type SearchProvider,
  type SearchResponse,
} from '../interfaces/search-provider.interface';
import { SearchService, type SearchParams } from '../services/search.service';

const ORG = 'org-uuid-1';

describe('SearchService', () => {
  let service: SearchService;
  let provider: jest.Mocked<SearchProvider>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: SEARCH_PROVIDER,
          useValue: { search: jest.fn() } satisfies Partial<
            Record<keyof SearchProvider, jest.Mock>
          >,
        },
      ],
    }).compile();

    service = module.get(SearchService);
    provider = module.get(SEARCH_PROVIDER) as jest.Mocked<SearchProvider>;
  });

  it('delegates to the injected provider and returns its response', async () => {
    const expected: SearchResponse = {
      results: [],
      total: 0,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    };
    provider.search.mockResolvedValue(expected);

    const params: SearchParams = {
      query: 'visa',
      organizationId: ORG,
      page: 1,
      pageSize: 20,
    };

    const result = await service.search(params);

    expect(provider.search).toHaveBeenCalledWith(params);
    expect(result).toBe(expected);
  });

  it('propagates errors from the provider', async () => {
    provider.search.mockRejectedValue(new Error('DB unavailable'));
    await expect(
      service.search({ query: 'x', organizationId: ORG, page: 1, pageSize: 20 }),
    ).rejects.toThrow('DB unavailable');
  });
});
