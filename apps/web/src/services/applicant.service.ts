import { type ApiListResponse, type ApiResponse, apiClient } from './api-client';

export interface Applicant {
  id: string;
  organizationId: string;
  applicantNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  destination?: string;
  status: 'new' | 'pending_docs' | 'under_review' | 'completed' | 'rejected';
  assignedStaffId?: string;
  createdAt: string;
}

export interface ApplicantListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  destination?: string;
}

// ---------- mock ----------
const MOCK_APPLICANTS: Applicant[] = [
  {
    id: '1',
    organizationId: 'org-1',
    applicantNumber: 'APP-001',
    firstName: 'Arjun',
    lastName: 'Kumar',
    email: 'arjun@email.com',
    phone: '+44 7700 900123',
    destination: 'UK',
    status: 'under_review',
    createdAt: '2026-06-02T00:00:00Z',
  },
  {
    id: '2',
    organizationId: 'org-1',
    applicantNumber: 'APP-002',
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya@email.com',
    destination: 'Canada',
    status: 'completed',
    createdAt: '2026-05-31T00:00:00Z',
  },
  {
    id: '3',
    organizationId: 'org-1',
    applicantNumber: 'APP-003',
    firstName: 'Mohammed',
    lastName: 'Al-Lami',
    email: 'mlami@email.com',
    destination: 'Australia',
    status: 'new',
    createdAt: '2026-05-29T00:00:00Z',
  },
];

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ---------- service ----------
export const applicantService = {
  async list(params: ApplicantListParams = {}): Promise<ApiListResponse<Applicant>> {
    if (process.env.NODE_ENV === 'development') {
      await delay(300);
      const { page = 1, pageSize = 25 } = params;
      return {
        success: true,
        message: 'OK',
        data: MOCK_APPLICANTS,
        meta: { total: MOCK_APPLICANTS.length, page, pageSize, totalPages: 1 },
      };
    }
    const qs = new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)]),
    ).toString();
    return apiClient.get<ApiListResponse<Applicant>>(`/applicants${qs ? `?${qs}` : ''}`);
  },

  async getById(id: string): Promise<ApiResponse<Applicant>> {
    if (process.env.NODE_ENV === 'development') {
      await delay(300);
      const found = MOCK_APPLICANTS.find((a) => a.id === id) ?? MOCK_APPLICANTS[0];
      if (!found) throw new Error(`Applicant ${id} not found`);

      return { success: true, message: 'OK', data: found };
    }
    return apiClient.get<ApiResponse<Applicant>>(`/applicants/${id}`);
  },
};
