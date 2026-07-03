import type { ApiResponse, PaginatedResponse } from '@/types/api';

import { http } from '@/lib/http';

export type DocumentCategory =
  'identity' | 'academic' | 'financial' | 'language' | 'reference' | 'visa' | 'other';

export type DocumentStatus = 'pending' | 'verified' | 'rejected' | 'expired' | 'archived';

export interface DocumentUploader {
  id: string;
  firstName: string;
  lastName: string;
}

export interface Document {
  id: string;
  applicantId: string;
  category: DocumentCategory;
  status: DocumentStatus;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  expiresAt: string | null;
  createdAt: string;
  uploadedByStaff: DocumentUploader | null;
}

export interface DocumentDetail extends Document {
  storedFilename: string;
  storageKey: string;
  checksum: string | null;
  verifiedAt: string | null;
  verifiedBy: string | null;
  verificationNotes: string | null;
  updatedAt: string;
}

export interface DocumentListParams {
  page?: number;
  pageSize?: number;
  applicantId?: string;
  category?: DocumentCategory;
  status?: DocumentStatus;
  sortBy?: 'createdAt' | 'originalFilename' | 'status' | 'category';
  sortOrder?: 'asc' | 'desc';
}

export interface UploadDocumentData {
  applicantId: string;
  category: DocumentCategory;
  expiresAt?: string;
  requirementId?: string;
  file: File;
}

export interface UploadedDocument {
  id: string;
  storageKey: string;
  checksum: string;
}

function buildQueryString(params: Record<string, unknown>): string {
  const qs = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => [k, String(v)]),
  ).toString();
  return qs ? `?${qs}` : '';
}

export const documentService = {
  async list(params: DocumentListParams = {}): Promise<PaginatedResponse<Document>> {
    const res = await http.get<PaginatedResponse<Document>>(
      `/documents${buildQueryString(params as Record<string, unknown>)}`,
    );
    return res.data;
  },

  async upload(data: UploadDocumentData): Promise<ApiResponse<UploadedDocument>> {
    const form = new FormData();
    form.append('file', data.file);
    form.append('applicantId', data.applicantId);
    form.append('category', data.category);
    if (data.expiresAt) {
      form.append('expiresAt', data.expiresAt);
    }
    if (data.requirementId) {
      form.append('requirementId', data.requirementId);
    }

    const res = await http.post<ApiResponse<UploadedDocument>>('/documents/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async download(id: string, originalFilename: string): Promise<void> {
    const res = await http.get(`/documents/${id}/download`, {
      responseType: 'blob',
    });

    const blob = res.data as Blob;
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = originalFilename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  },

  async deleteFile(id: string): Promise<ApiResponse<null>> {
    const res = await http.delete<ApiResponse<null>>(`/documents/${id}/file`);
    return res.data;
  },
};
