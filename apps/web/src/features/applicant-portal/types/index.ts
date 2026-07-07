export type PortalAccountStatus =
  | 'pending'
  | 'invitation_sent'
  | 'invitation_accepted'
  | 'active'
  | 'suspended'
  | 'disabled'
  | 'locked';

export type RequirementStatus = 'pending' | 'uploaded' | 'approved' | 'rejected';

export interface ApplicantPortalProfile {
  portalAccountId: string;
  applicantId: string;
  email: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  mustChangePass: boolean;
}

export interface ApplicantProfile {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  gender?: string;
  dateOfBirth?: string;
  nationality?: string;
  applicantNumber: string;
  status: string;
  portalAllowProfileEdit?: boolean;
  assignedConsultant?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
}

export interface ApplicantDocument {
  id: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  status: string;
  category: string;
  createdAt: string;
  verifiedAt?: string | null;
  verificationNotes?: string | null;
  requirementId?: string | null;
}

export interface ApplicantDocumentRequirement {
  id: string;
  applicantId: string;
  requirementId: string;
  status: RequirementStatus;
  assignedAt: string;
  completedAt?: string | null;
  requirement: {
    id: string;
    name: string;
    description?: string | null;
    category: string;
    isRequired: boolean;
  };
  documents: ApplicantDocument[];
}

export interface ApplicantDocumentListMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface ApplicantDocumentListResponse {
  data: ApplicantDocument[];
  meta: ApplicantDocumentListMeta;
}

export interface ApplicantDashboard {
  applicant: {
    id: string;
    firstName: string;
    lastName: string;
    applicantNumber: string;
    email?: string | null;
  };
  assignedConsultant?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  documentCounts: {
    required: number;
    uploaded: number;
    approved: number;
    rejected: number;
    pending: number;
  };
  recentRequirements: ApplicantDocumentRequirement[];
}

export interface UpdateApplicantProfileData {
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
}
