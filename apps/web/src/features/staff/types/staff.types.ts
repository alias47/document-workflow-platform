export type StaffStatus = 'active' | 'inactive' | 'suspended';

export interface StaffRole {
  id: string;
  name: string;
  description: string | null;
}

export interface Staff {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  jobTitle: string | null;
  avatarUrl: string | null;
  status: StaffStatus;
  isActive: boolean;
  role: StaffRole | null;
  assignedApplicantCount: number;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StaffListParams {
  page?: number | undefined;
  pageSize?: number | undefined;
  search?: string | undefined;
  status?: StaffStatus | undefined;
  roleId?: string | undefined;
  sortBy?: 'firstName' | 'lastName' | 'createdAt' | 'lastLoginAt' | undefined;
  sortOrder?: 'asc' | 'desc' | undefined;
}

export interface CreateStaffData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | undefined;
  jobTitle?: string | undefined;
  roleId: string;
  password?: string | undefined;
  isActive?: boolean | undefined;
}

export interface UpdateStaffData {
  firstName?: string | undefined;
  lastName?: string | undefined;
  phone?: string | undefined;
  jobTitle?: string | undefined;
  roleId?: string | undefined;
  avatarUrl?: string | null | undefined;
  password?: string | undefined;
  isActive?: boolean | undefined;
}

export interface UpdateStaffStatusData {
  status: StaffStatus;
}

export interface AssignApplicantsData {
  applicantIds: string[];
}

export interface AssignedApplicant {
  id: string;
  applicantNumber: string;
  firstName: string;
  lastName: string;
  email: string | null;
  status: string;
  createdAt: string;
  assignments: Array<{ isPrimary: boolean; assignedAt: string }>;
}
