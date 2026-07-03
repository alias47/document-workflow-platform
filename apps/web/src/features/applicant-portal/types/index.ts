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
  assignedConsultant?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
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
  documents: {
    id: string;
    originalFilename: string;
    uploadedAt: string;
    status: string;
  }[];
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
