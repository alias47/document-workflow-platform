import { Injectable } from '@nestjs/common';

import { SearchRepository } from '../repositories/search.repository';

import type {
  SearchParams,
  SearchProvider,
  SearchResponse,
  SearchResult,
} from '../interfaces/search-provider.interface';

/**
 * MVP search implementation backed by Prisma ILIKE queries.
 *
 * Swapping to PostgreSQL FTS or a dedicated engine means creating a new
 * class that satisfies the SearchProvider interface and updating the DI
 * binding in SearchModule — nothing else changes.
 */
@Injectable()
export class PrismaSearchProvider implements SearchProvider {
  constructor(private readonly searchRepo: SearchRepository) {}

  async search(params: SearchParams): Promise<SearchResponse> {
    const { query, organizationId, entity, page, pageSize } = params;
    const skip = (page - 1) * pageSize;

    const normalizedQuery = query.trim();

    if (entity === 'applicant') {
      const { results, total } = await this.searchRepo.searchApplicants(
        normalizedQuery,
        organizationId,
        skip,
        pageSize,
      );
      return this.buildResponse(results, total, page, pageSize);
    }

    if (entity === 'document') {
      const { results, total } = await this.searchRepo.searchDocuments(
        normalizedQuery,
        organizationId,
        skip,
        pageSize,
      );
      return this.buildResponse(results, total, page, pageSize);
    }

    if (entity === 'workflow') {
      const { results, total } = await this.searchRepo.searchWorkflows(
        normalizedQuery,
        organizationId,
        skip,
        pageSize,
      );
      return this.buildResponse(results, total, page, pageSize);
    }

    // Cross-entity search: query all three in parallel, merge, re-paginate.
    const perEntity = Math.ceil(pageSize / 3);
    const [applicants, documents, workflows] = await Promise.all([
      this.searchRepo.searchApplicants(normalizedQuery, organizationId, 0, perEntity),
      this.searchRepo.searchDocuments(normalizedQuery, organizationId, 0, perEntity),
      this.searchRepo.searchWorkflows(normalizedQuery, organizationId, 0, perEntity),
    ]);

    const merged: SearchResult[] = [
      ...applicants.results,
      ...documents.results,
      ...workflows.results,
    ];
    const total = applicants.total + documents.total + workflows.total;

    const paged = merged.slice(skip, skip + pageSize);
    return this.buildResponse(paged, total, page, pageSize);
  }

  private buildResponse(
    results: SearchResult[],
    total: number,
    page: number,
    pageSize: number,
  ): SearchResponse {
    return {
      results,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }
}
