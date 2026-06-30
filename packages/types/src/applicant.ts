export type WorkflowStage =
  'NEW' | 'DOCUMENTS_PENDING' | 'DOCUMENTS_UNDER_REVIEW' | 'DOCUMENTS_COMPLETED';

export interface Applicant {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  nationality: string | null;
  passportNumber: string | null;
  destinationCountry: string | null;
  workflowStage: WorkflowStage;
  assignedConsultantId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateApplicantPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  destinationCountry?: string;
}

export interface UpdateApplicantPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  nationality?: string;
  passportNumber?: string;
  destinationCountry?: string;
  workflowStage?: WorkflowStage;
  assignedConsultantId?: string;
}
