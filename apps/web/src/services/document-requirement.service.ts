import type { ApiResponse, PaginatedResponse } from '@/types/api';

import { http } from '@/lib/http';

export type RequirementStatus = 'pending' | 'uploaded' | 'approved' | 'rejected';
export type DocumentCategory =
  'identity' | 'academic' | 'financial' | 'language' | 'reference' | 'visa' | 'other';

export interface DocumentRequirement {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  category: DocumentCategory;
  isRequired: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  _count: { applicantRequirements: number };
}

export interface ApplicantDocumentRequirement {
  id: string;
  applicantId: string;
  requirementId: string;
  status: RequirementStatus;
  assignedAt: string;
  completedAt: string | null;
  requirement: DocumentRequirement;
  documents: ApplicantRequirementDocument[];
}

export interface ApplicantRequirementDocument {
  id: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  status: string;
  createdAt: string;
  uploadedByStaff: { id: string; firstName: string; lastName: string } | null;
}

export interface RequirementListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: DocumentCategory;
  isActive?: boolean;
}

export interface CreateRequirementData {
  name: string;
  description?: string;
  category: DocumentCategory;
  isRequired?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}

export type UpdateRequirementData = Partial<CreateRequirementData>;

const BASE = '/document-requirements';

export const documentRequirementService = {
  async list(params: RequirementListParams = {}): Promise<PaginatedResponse<DocumentRequirement>> {
    const query = new URLSearchParams();
    if (params.page !== undefined) query.set('page', String(params.page));
    if (params.pageSize !== undefined) query.set('pageSize', String(params.pageSize));
    if (params.search) query.set('search', params.search);
    if (params.category !== undefined) query.set('category', params.category);
    if (params.isActive !== undefined) query.set('isActive', String(params.isActive));

    const qs = query.toString();
    const res = await http.get<PaginatedResponse<DocumentRequirement>>(BASE + (qs ? `?${qs}` : ''));
    return res.data;
  },

  async getById(id: string): Promise<ApiResponse<DocumentRequirement>> {
    const res = await http.get<ApiResponse<DocumentRequirement>>(`${BASE}/${id}`);
    return res.data;
  },

  async create(data: CreateRequirementData): Promise<ApiResponse<DocumentRequirement>> {
    const res = await http.post<ApiResponse<DocumentRequirement>>(BASE, data);
    return res.data;
  },

  async update(id: string, data: UpdateRequirementData): Promise<ApiResponse<DocumentRequirement>> {
    const res = await http.patch<ApiResponse<DocumentRequirement>>(`${BASE}/${id}`, data);
    return res.data;
  },

  async archive(id: string): Promise<ApiResponse<null>> {
    const res = await http.delete<ApiResponse<null>>(`${BASE}/${id}`);
    return res.data;
  },

  async listForApplicant(
    applicantId: string,
  ): Promise<ApiResponse<ApplicantDocumentRequirement[]>> {
    const res = await http.get<ApiResponse<ApplicantDocumentRequirement[]>>(
      `/applicants/${applicantId}/document-requirements`,
    );
    return res.data;
  },

  async syncForApplicant(applicantId: string): Promise<ApiResponse<null>> {
    const res = await http.post<ApiResponse<null>>(
      `/applicants/${applicantId}/document-requirements/sync`,
      {},
    );
    return res.data;
  },

  async updateApplicantRequirementStatus(
    id: string,
    status: RequirementStatus,
  ): Promise<ApiResponse<ApplicantDocumentRequirement>> {
    const res = await http.patch<ApiResponse<ApplicantDocumentRequirement>>(
      `/applicant-document-requirements/${id}/status`,
      { status },
    );
    return res.data;
  },
};
