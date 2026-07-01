import { Inject, Injectable } from '@nestjs/common';

import {
  SEARCH_PROVIDER,
  type SearchEntityType,
  type SearchProvider,
  type SearchResponse,
} from '../interfaces/search-provider.interface';

export interface SearchParams {
  query: string;
  organizationId: string;
  entity?: SearchEntityType;
  page: number;
  pageSize: number;
}

@Injectable()
export class SearchService {
  constructor(@Inject(SEARCH_PROVIDER) private readonly provider: SearchProvider) {}

  search(params: SearchParams): Promise<SearchResponse> {
    return this.provider.search(params);
  }
}
