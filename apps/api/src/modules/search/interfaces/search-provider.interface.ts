/** DI token for the active SearchProvider implementation. */
export const SEARCH_PROVIDER = Symbol('SEARCH_PROVIDER');

export type SearchEntityType = 'applicant' | 'document' | 'workflow';

export interface SearchParams {
  query: string;
  organizationId: string;
  entity?: SearchEntityType;
  page: number;
  pageSize: number;
}

export interface ApplicantSearchResult {
  type: 'applicant';
  id: string;
  applicantNumber: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  email: string | null;
  phone: string | null;
  status: string;
  createdAt: Date;
}

export interface DocumentSearchResult {
  type: 'document';
  id: string;
  applicantId: string;
  title: string | null;
  originalFilename: string;
  description: string | null;
  tags: string[];
  category: string;
  status: string;
  createdAt: Date;
}

export interface WorkflowSearchResult {
  type: 'workflow';
  id: string;
  applicantId: string;
  applicantNumber: string;
  firstName: string;
  lastName: string;
  currentStageName: string;
  enteredStageAt: Date;
}

export type SearchResult = ApplicantSearchResult | DocumentSearchResult | WorkflowSearchResult;

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Abstraction over the search backend. Business code depends only on this
 * interface so the implementation can swap (Prisma ILIKE → PostgreSQL FTS →
 * Elasticsearch) without touching the controller or service layer.
 */
export interface SearchProvider {
  search(params: SearchParams): Promise<SearchResponse>;
}
