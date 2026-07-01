import type { ApiResponse, PaginatedResponse } from '@/types/api';

import { env } from '@/lib/env';
import { http } from '@/lib/http';

// Status values matching the backend ApplicantStatus enum
export type ApplicantStatus = 'active' | 'inactive' | 'archived';

export interface Applicant {
  id: string;
  organizationId: string;
  applicantNumber: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email?: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
  nationality?: string;
  address?: string;
  city?: string;
  country?: string;
  status: ApplicantStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  assignments?: ApplicantAssignment[];
}

export interface ApplicantAssignment {
  id: string;
  staffId: string;
  isPrimary: boolean;
  assignedAt: string;
}

export interface ApplicantListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: ApplicantStatus;
  assignedTo?: string;
  sortBy?: 'createdAt' | 'lastName' | 'firstName' | 'applicantNumber' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateApplicantData {
  firstName: string;
  lastName: string;
  middleName?: string;
  email?: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
  nationality?: string;
  address?: string;
  city?: string;
  country?: string;
  assignedStaffId: string;
}

export interface UpdateApplicantData {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  email?: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
  nationality?: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface CreatedApplicant {
  id: string;
  applicantNumber: string;
}

// ---------- mock data (dev only) ----------
// 30 entries so pagination is testable (default pageSize = 25 → 2 pages).
// Mutable so archive() can remove entries and the cache invalidation path works.
const SEED_APPLICANTS: Applicant[] = [
  {
    id: '1',
    organizationId: 'org-1',
    applicantNumber: 'APP-2026-0001',
    firstName: 'Aarav',
    lastName: 'Sharma',
    email: 'aarav.sharma@example.com',
    phone: '+977 98010 00001',
    nationality: 'Nepalese',
    country: 'Nepal',
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    createdBy: 'staff-1',
  },
  {
    id: '2',
    organizationId: 'org-1',
    applicantNumber: 'APP-2026-0002',
    firstName: 'Mei Ling',
    lastName: 'Chen',
    email: 'meiling.chen@example.com',
    phone: '+86 139 0000 0002',
    nationality: 'Chinese',
    country: 'China',
    status: 'active',
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z',
    createdBy: 'staff-1',
  },
  {
    id: '3',
    organizationId: 'org-1',
    applicantNumber: 'APP-2026-0003',
    firstName: 'Daniel',
    lastName: 'Okeke',
    email: 'dokeke@example.com',
    phone: '+234 803 000 0003',
    nationality: 'Nigerian',
    country: 'Nigeria',
    status: 'inactive',
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z',
    createdBy: 'staff-1',
  },
  {
    id: '4',
    organizationId: 'org-1',
    applicantNumber: 'APP-2026-0004',
    firstName: 'Fatima',
    lastName: 'Nasser',
    email: 'fnasser@example.com',
    phone: '+49 151 000 0004',
    nationality: 'Jordanian',
    country: 'Jordan',
    status: 'active',
    createdAt: '2026-01-20T00:00:00Z',
    updatedAt: '2026-01-20T00:00:00Z',
    createdBy: 'staff-1',
  },
  {
    id: '5',
    organizationId: 'org-1',
    applicantNumber: 'APP-2026-0005',
    firstName: 'Li',
    lastName: 'Wang',
    email: 'li.wang@example.com',
    phone: '+1 212 555 0005',
    nationality: 'Chinese',
    country: 'China',
    status: 'active',
    createdAt: '2026-01-25T00:00:00Z',
    updatedAt: '2026-01-25T00:00:00Z',
    createdBy: 'staff-1',
  },
  {
    id: '6',
    organizationId: 'org-1',
    applicantNumber: 'APP-2026-0006',
    firstName: 'Riya',
    lastName: 'Patel',
    email: 'riya.patel@example.com',
    phone: '+91 98000 00006',
    nationality: 'Indian',
    country: 'India',
    status: 'active',
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
    createdBy: 'staff-1',
  },
  {
    id: '7',
    organizationId: 'org-1',
    applicantNumber: 'APP-2026-0007',
    firstName: 'Kwame',
    lastName: 'Asante',
    email: 'kwame.asante@example.com',
    phone: '+233 244 000 007',
    nationality: 'Ghanaian',
    country: 'Ghana',
    status: 'inactive',
    createdAt: '2026-02-05T00:00:00Z',
    updatedAt: '2026-02-05T00:00:00Z',
    createdBy: 'staff-1',
  },
  {
    id: '8',
    organizationId: 'org-1',
    applicantNumber: 'APP-2026-0008',
    firstName: 'Sofia',
    lastName: 'Morales',
    email: 'sofia.morales@example.com',
    phone: '+52 55 0000 0008',
    nationality: 'Mexican',
    country: 'Mexico',
    status: 'active',
    createdAt: '2026-02-10T00:00:00Z',
    updatedAt: '2026-02-10T00:00:00Z',
    createdBy: 'staff-1',
  },
  {
    id: '9',
    organizationId: 'org-1',
    applicantNumber: 'APP-2026-0009',
    firstName: 'Ahmed',
    lastName: 'Al-Rashid',
    email: 'ahmed.alrashid@example.com',
    phone: '+966 50 000 0009',
    nationality: 'Saudi',
    country: 'Saudi Arabia',
    status: 'active',
    createdAt: '2026-02-15T00:00:00Z',
    updatedAt: '2026-02-15T00:00:00Z',
    createdBy: 'staff-1',
  },
  {
    id: '10',
    organizationId: 'org-1',
    applicantNumber: 'APP-2026-0010',
    firstName: 'Priya',
    lastName: 'Krishnan',
    email: 'priya.k@example.com',
    phone: '+91 98000 00010',
    nationality: 'Indian',
    country: 'India',
    status: 'archived',
    createdAt: '2026-02-20T00:00:00Z',
    updatedAt: '2026-02-20T00:00:00Z',
    createdBy: 'staff-1',
  },
  {
    id: '11',
    organizationId: 'org-1',
    applicantNumber: 'APP-2026-0011',
    firstName: 'Yuki',
    lastName: 'Tanaka',
    email: 'yuki.tanaka@example.com',
    phone: '+81 90 0000 0011',
    nationality: 'Japanese',
    country: 'Japan',
    status: 'active',
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
    createdBy: 'staff-1',
  },
  {
    id: '12',
    organizationId: 'org-1',
    applicantNumber: 'APP-2026-0012',
    firstName: 'Carlos',
    lastName: 'Rivera',
    email: 'carlos.r@example.com',
    phone: '+57 300 000 0012',
    nationality: 'Colombian',
    country: 'Colombia',
    status: 'active',
    createdAt: '2026-03-05T00:00:00Z',
    updatedAt: '2026-03-05T00:00:00Z',
    createdBy: 'staff-1',
  },
  {
    id: '13',
    organizationId: 'org-1',
    applicantNumber: 'APP-2026-0013',
    firstName: 'Amara',
    lastName: 'Diallo',
    email: 'amara.d@example.com',
    phone: '+221 77 000 0013',
    nationality: 'Senegalese',
    country: 'Senegal',
    status: 'inactive',
    createdAt: '2026-03-10T00:00:00Z',
    updatedAt: '2026-03-10T00:00:00Z',
    createdBy: 'staff-1',
  },
  {
    id: '14',
    organizationId: 'org-1',
    applicantNumber: 'APP-2026-0014',
    firstName: 'Lena',
    lastName: 'Müller',
    email: 'lena.m@example.com',
    phone: '+49 176 000 0014',
    nationality: 'German',
    country: 'Germany',
    status: 'active',
    createdAt: '2026-03-15T00:00:00Z',
    updatedAt: '2026-03-15T00:00:00Z',
    createdBy: 'staff-1',
  },
  {
    id: '15',
    organizationId: 'org-1',
    applicantNumber: 'APP-2026-0015',
    firstName: 'Tariq',
    lastName: 'Hassan',
    email: 'tariq.h@example.com',
    phone: '+20 100 000 0015',
    nationality: 'Egyptian',
    country: 'Egypt',
    status: 'active',
    createdAt: '2026-03-20T00:00:00Z',
    updatedAt: '2026-03-20T00:00:00Z',
    createdBy: 'staff-1',
  },
  {
    id: '16',
    organizationId: 'org-1',
    applicantNumber: 'APP-2026-0016',
    firstName: 'Nadia',
    lastName: 'Popescu',
    email: 'nadia.p@example.com',
    phone: '+40 722 000 016',
    nationality: 'Romanian',
    country: 'Romania',
    status: 'active',
    createdAt: '2026-03-25T00:00:00Z',
    updatedAt: '2026-03-25T00:00:00Z',
    createdBy: 'staff-1',
  },
  {
    id: '17',
    organizationId: 'org-1',
    applicantNumber: 'APP-2026-0017',
    firstName: 'Emmanuel',
    lastName: 'Nwosu',
    email: 'emma.n@example.com',
    phone: '+234 805 000 0017',
    nationality: 'Nigerian',
    country: 'Nigeria',
    status: 'active',
    createdAt: '2026-04-01T00:00:00Z',
    updatedAt: '2026-04-01T00:00:00Z',
    createdBy: 'staff-1',
  },
  {
    id: '18',
    organizationId: 'org-1',
    applicantNumber: 'APP-2026-0018',
    firstName: 'Min',
    lastName: 'Jun',
    email: 'min.jun@example.com',
    phone: '+82 10 0000 0018',
    nationality: 'Korean',
    country: 'South Korea',
    status: 'inactive',
    createdAt: '2026-04-05T00:00:00Z',
    updatedAt: '2026-04-05T00:00:00Z',
    createdBy: 'staff-1',
  },
  {
    id: '19',
    organizationId: 'org-1',
    applicantNumber: 'APP-2026-0019',
    firstName: 'Isabela',
    lastName: 'Santos',
    email: 'isabela.s@example.com',
    phone: '+55 11 0000 0019',
    nationality: 'Brazilian',
    country: 'Brazil',
    status: 'active',
    createdAt: '2026-04-10T00:00:00Z',
    updatedAt: '2026-04-10T00:00:00Z',
    createdBy: 'staff-1',
  },
  {
    id: '20',
    organizationId: 'org-1',
    applicantNumber: 'APP-2026-0020',
    firstName: 'Vlad',
    lastName: 'Petrov',
    email: 'vlad.p@example.com',
    phone: '+7 916 000 0020',
    nationality: 'Russian',
    country: 'Russia',
    status: 'archived',
    createdAt: '2026-04-15T00:00:00Z',
    updatedAt: '2026-04-15T00:00:00Z',
    createdBy: 'staff-1',
  },
  {
    id: '21',
    organizationId: 'org-1',
    applicantNumber: 'APP-2026-0021',
    firstName: 'Nia',
    lastName: 'Owusu',
    email: 'nia.o@example.com',
    phone: '+233 244 000 021',
    nationality: 'Ghanaian',
    country: 'Ghana',
    status: 'active',
    createdAt: '2026-04-20T00:00:00Z',
    updatedAt: '2026-04-20T00:00:00Z',
    createdBy: 'staff-1',
  },
  {
    id: '22',
    organizationId: 'org-1',
    applicantNumber: 'APP-2026-0022',
    firstName: 'Hamid',
    lastName: 'Ahmadi',
    email: 'hamid.a@example.com',
    phone: '+98 912 000 0022',
    nationality: 'Iranian',
    country: 'Iran',
    status: 'active',
    createdAt: '2026-04-25T00:00:00Z',
    updatedAt: '2026-04-25T00:00:00Z',
    createdBy: 'staff-1',
  },
  {
    id: '23',
    organizationId: 'org-1',
    applicantNumber: 'APP-2026-0023',
    firstName: 'Elena',
    lastName: 'Vasquez',
    email: 'elena.v@example.com',
    phone: '+34 612 000 023',
    nationality: 'Spanish',
    country: 'Spain',
    status: 'inactive',
    createdAt: '2026-05-01T00:00:00Z',
    updatedAt: '2026-05-01T00:00:00Z',
    createdBy: 'staff-1',
  },
  {
    id: '24',
    organizationId: 'org-1',
    applicantNumber: 'APP-2026-0024',
    firstName: 'Takeshi',
    lastName: 'Yamamoto',
    email: 'takeshi.y@example.com',
    phone: '+81 90 0000 0024',
    nationality: 'Japanese',
    country: 'Japan',
    status: 'active',
    createdAt: '2026-05-05T00:00:00Z',
    updatedAt: '2026-05-05T00:00:00Z',
    createdBy: 'staff-1',
  },
  {
    id: '25',
    organizationId: 'org-1',
    applicantNumber: 'APP-2026-0025',
    firstName: 'Grace',
    lastName: 'Adeyemi',
    email: 'grace.a@example.com',
    phone: '+234 806 000 0025',
    nationality: 'Nigerian',
    country: 'Nigeria',
    status: 'active',
    createdAt: '2026-05-10T00:00:00Z',
    updatedAt: '2026-05-10T00:00:00Z',
    createdBy: 'staff-1',
  },
  {
    id: '26',
    organizationId: 'org-1',
    applicantNumber: 'APP-2026-0026',
    firstName: 'Lior',
    lastName: 'Ben-David',
    email: 'lior.b@example.com',
    phone: '+972 50 000 0026',
    nationality: 'Israeli',
    country: 'Israel',
    status: 'active',
    createdAt: '2026-05-15T00:00:00Z',
    updatedAt: '2026-05-15T00:00:00Z',
    createdBy: 'staff-1',
  },
  {
    id: '27',
    organizationId: 'org-1',
    applicantNumber: 'APP-2026-0027',
    firstName: 'Amira',
    lastName: 'Khalil',
    email: 'amira.k@example.com',
    phone: '+20 110 000 0027',
    nationality: 'Egyptian',
    country: 'Egypt',
    status: 'inactive',
    createdAt: '2026-05-20T00:00:00Z',
    updatedAt: '2026-05-20T00:00:00Z',
    createdBy: 'staff-1',
  },
  {
    id: '28',
    organizationId: 'org-1',
    applicantNumber: 'APP-2026-0028',
    firstName: 'David',
    lastName: 'Okonkwo',
    email: 'david.o@example.com',
    phone: '+234 807 000 0028',
    nationality: 'Nigerian',
    country: 'Nigeria',
    status: 'active',
    createdAt: '2026-05-25T00:00:00Z',
    updatedAt: '2026-05-25T00:00:00Z',
    createdBy: 'staff-1',
  },
  {
    id: '29',
    organizationId: 'org-1',
    applicantNumber: 'APP-2026-0029',
    firstName: 'Sun',
    lastName: 'Li',
    email: 'sun.li@example.com',
    phone: '+86 139 0000 0029',
    nationality: 'Chinese',
    country: 'China',
    status: 'active',
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-06-01T00:00:00Z',
    createdBy: 'staff-1',
  },
  {
    id: '30',
    organizationId: 'org-1',
    applicantNumber: 'APP-2026-0030',
    firstName: 'Zara',
    lastName: 'Ahmed',
    email: 'zara.ahmed@example.com',
    phone: '+971 50 000 0030',
    nationality: 'Pakistani',
    country: 'Pakistan',
    status: 'active',
    createdAt: '2026-06-15T00:00:00Z',
    updatedAt: '2026-06-15T00:00:00Z',
    createdBy: 'staff-1',
  },
];

// Mutable working set so archive() removes entries and cache invalidation
// shows the removal — mirrors what the real backend would return.
let mockApplicants: Applicant[] = [...SEED_APPLICANTS];

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function buildQueryString(params: ApplicantListParams): string {
  const qs = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, String(v)]),
  ).toString();
  return qs ? `?${qs}` : '';
}

// ---------- service ----------
// All HTTP communication for applicants lives here. Components never import axios.
export const applicantService = {
  async list(params: ApplicantListParams = {}): Promise<PaginatedResponse<Applicant>> {
    if (env.isDev) {
      await delay(300);
      const {
        page = 1,
        pageSize = 25,
        search,
        status,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = params;

      let results = [...mockApplicants];

      // Filter
      if (search) {
        const q = search.toLowerCase();
        results = results.filter(
          (a) =>
            a.firstName.toLowerCase().includes(q) ||
            a.lastName.toLowerCase().includes(q) ||
            (a.email ?? '').toLowerCase().includes(q) ||
            a.applicantNumber.toLowerCase().includes(q),
        );
      }
      if (status) {
        results = results.filter((a) => a.status === status);
      }

      // Sort
      results.sort((a, b) => {
        let valA: string;
        let valB: string;
        switch (sortBy) {
          case 'firstName':
            valA = a.firstName.toLowerCase();
            valB = b.firstName.toLowerCase();
            break;
          case 'lastName':
            valA = a.lastName.toLowerCase();
            valB = b.lastName.toLowerCase();
            break;
          case 'applicantNumber':
            valA = a.applicantNumber;
            valB = b.applicantNumber;
            break;
          case 'status':
            valA = a.status;
            valB = b.status;
            break;
          default:
            valA = a.createdAt;
            valB = b.createdAt;
        }
        const cmp = valA < valB ? -1 : valA > valB ? 1 : 0;
        return sortOrder === 'asc' ? cmp : -cmp;
      });

      // Paginate
      const totalItems = results.length;
      const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
      const start = (page - 1) * pageSize;
      const paged = results.slice(start, start + pageSize);

      return {
        success: true,
        message: 'OK',
        data: paged,
        meta: { totalItems, page, pageSize, totalPages },
      };
    }
    const res = await http.get<PaginatedResponse<Applicant>>(
      `/applicants${buildQueryString(params)}`,
    );
    return res.data;
  },

  async getById(id: string): Promise<ApiResponse<Applicant>> {
    if (env.isDev) {
      await delay(300);
      // Strict lookup — no fallback, so invalid IDs surface the error state.
      const found = mockApplicants.find((a) => a.id === id);
      if (!found) {
        const err = Object.assign(new Error('Applicant not found'), { status: 404 });
        throw err;
      }
      return { success: true, message: 'OK', data: found };
    }
    const res = await http.get<ApiResponse<Applicant>>(`/applicants/${id}`);
    return res.data;
  },

  async create(data: CreateApplicantData): Promise<ApiResponse<CreatedApplicant>> {
    if (env.isDev) {
      await delay(400);
      const newApplicant: Applicant = {
        id: `mock-${Date.now()}`,
        organizationId: 'org-1',
        applicantNumber: `APP-2026-${String(mockApplicants.length + 1).padStart(4, '0')}`,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        nationality: data.nationality,
        country: data.country,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'staff-1',
      };
      mockApplicants = [newApplicant, ...mockApplicants];
      return {
        success: true,
        message: 'Applicant created successfully',
        data: { id: newApplicant.id, applicantNumber: newApplicant.applicantNumber },
      };
    }
    const res = await http.post<ApiResponse<CreatedApplicant>>('/applicants', data);
    return res.data;
  },

  async update(id: string, data: UpdateApplicantData): Promise<ApiResponse<Applicant>> {
    if (env.isDev) {
      await delay(300);
      const index = mockApplicants.findIndex((a) => a.id === id);
      if (index === -1) {
        const err = Object.assign(new Error('Applicant not found'), { status: 404 });
        throw err;
      }
      const updated = {
        ...mockApplicants[index],
        ...data,
        updatedAt: new Date().toISOString(),
      } as Applicant;
      mockApplicants = mockApplicants.map((a) => (a.id === id ? updated : a));
      return { success: true, message: 'Applicant updated successfully', data: updated };
    }
    const res = await http.patch<ApiResponse<Applicant>>(`/applicants/${id}`, data);
    return res.data;
  },

  async archive(id: string): Promise<ApiResponse<null>> {
    if (env.isDev) {
      await delay(300);
      const index = mockApplicants.findIndex((a) => a.id === id);
      if (index === -1) {
        const err = Object.assign(new Error('Applicant not found'), { status: 404 });
        throw err;
      }
      // Mark as archived rather than deleting — mirrors soft-delete on the backend.
      mockApplicants = mockApplicants.map((a) =>
        a.id === id
          ? { ...a, status: 'archived' as ApplicantStatus, updatedAt: new Date().toISOString() }
          : a,
      );
      return { success: true, message: 'Applicant archived successfully', data: null };
    }
    const res = await http.delete<ApiResponse<null>>(`/applicants/${id}`);
    return res.data;
  },
};
