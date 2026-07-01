import { Test, type TestingModule } from '@nestjs/testing';

import { SearchController } from '../controllers/search.controller';
import { SearchService } from '../services/search.service';

import type { SearchQueryDto } from '../dto/search-query.dto';
import type { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';

const USER: JwtPayload = {
  sub: 'staff-uuid-1',
  email: 'admin@test.com',
  organizationId: 'org-uuid-1',
  role: 'Admin',
  permissions: ['search.view'],
};

describe('SearchController', () => {
  let controller: SearchController;
  let service: jest.Mocked<SearchService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [
        {
          provide: SearchService,
          useValue: {
            search: jest.fn(),
          } satisfies Partial<Record<keyof SearchService, jest.Mock>>,
        },
      ],
    }).compile();

    controller = module.get(SearchController);
    service = module.get(SearchService) as jest.Mocked<SearchService>;
  });

  it('returns a success envelope and forwards params to the service', async () => {
    const mockData = {
      results: [],
      total: 0,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    };
    service.search.mockResolvedValue(mockData);

    const dto = { q: 'visa', page: 1, pageSize: 20 } as SearchQueryDto;
    const result = await controller.search(USER, dto);

    expect(result.success).toBe(true);
    expect(result.data).toBe(mockData);
    expect(service.search).toHaveBeenCalledWith({
      query: 'visa',
      organizationId: USER.organizationId,
      entity: undefined,
      page: 1,
      pageSize: 20,
    });
  });

  it('passes entity filter through to the service', async () => {
    service.search.mockResolvedValue({
      results: [],
      total: 0,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    });

    const dto = { q: 'passport', entity: 'document', page: 1, pageSize: 20 } as SearchQueryDto;
    await controller.search(USER, dto);

    expect(service.search).toHaveBeenCalledWith(expect.objectContaining({ entity: 'document' }));
  });

  it('defaults page to 1 and pageSize to 20 when not supplied by DTO', async () => {
    service.search.mockResolvedValue({
      results: [],
      total: 0,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    });

    const dto = { q: 'test' } as SearchQueryDto;
    await controller.search(USER, dto);

    expect(service.search).toHaveBeenCalledWith(expect.objectContaining({ page: 1, pageSize: 20 }));
  });
});
