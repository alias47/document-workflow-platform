export type ApplicantStatus = 'active' | 'on_hold' | 'completed' | 'archived';

export type PortalAccountStatus = 'pending' | 'invitation_sent' | 'active' | 'suspended';

export type WorkflowStage =
  | 'inquiry'
  | 'document_collection'
  | 'application_submitted'
  | 'offer_received'
  | 'visa_processing'
  | 'completed';

export type DocumentStatus = 'missing' | 'uploaded' | 'under_review' | 'approved' | 'rejected';

export interface DocumentSummary {
  total: number;
  approved: number;
  underReview: number;
  missing: number;
  rejected: number;
}

export interface WorkflowProgress {
  currentStage: WorkflowStage;
  stageName: string;
  completionPercentage: number;
  startedAt: string;
}

export interface TimelineEntry {
  id: string;
  eventType: string;
  eventTitle: string;
  eventDescription: string;
  createdBy: string;
  createdAt: string;
}

export interface Applicant {
  id: string;
  applicantNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  nationality: string;
  country: string;
  gender: 'male' | 'female' | 'other';
  status: ApplicantStatus;
  portalStatus: PortalAccountStatus;
  assignedStaff: string;
  workflow: WorkflowProgress;
  documents: DocumentSummary;
  timeline: TimelineEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface ApplicantFilters {
  search: string;
  status: ApplicantStatus | 'all';
  stage: WorkflowStage | 'all';
  assignedStaff: string | 'all';
}

export type ApplicantSortField = 'name' | 'applicantNumber' | 'status' | 'createdAt' | 'updatedAt';
export type SortDirection = 'asc' | 'desc';

export interface ApplicantSort {
  field: ApplicantSortField;
  direction: SortDirection;
}
