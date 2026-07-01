import type { ApiResponse } from '@/types/api';

import { http } from '@/lib/http';

export type SearchEntityType = 'applicant' | 'document' | 'workflow';

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
  createdAt: string;
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
  createdAt: string;
}

export interface WorkflowSearchResult {
  type: 'workflow';
  id: string;
  applicantId: string;
  applicantNumber: string;
  firstName: string;
  lastName: string;
  currentStageName: string;
  enteredStageAt: string;
}

export type SearchResult = ApplicantSearchResult | DocumentSearchResult | WorkflowSearchResult;

export interface SearchData {
  results: SearchResult[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SearchParams {
  q: string;
  entity?: SearchEntityType;
  page?: number;
  pageSize?: number;
}

function buildQueryString(params: SearchParams): string {
  const qs = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, String(v)]),
  ).toString();
  return qs ? `?${qs}` : '';
}

export const searchService = {
  async search(params: SearchParams): Promise<ApiResponse<SearchData>> {
    const res = await http.get<ApiResponse<SearchData>>(`/search${buildQueryString(params)}`);
    return res.data;
  },
};
