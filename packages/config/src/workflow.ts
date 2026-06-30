export const WORKFLOW_STAGES = {
  NEW: 'NEW',
  DOCUMENTS_PENDING: 'DOCUMENTS_PENDING',
  DOCUMENTS_UNDER_REVIEW: 'DOCUMENTS_UNDER_REVIEW',
  DOCUMENTS_COMPLETED: 'DOCUMENTS_COMPLETED',
} as const;

export type WorkflowStage = (typeof WORKFLOW_STAGES)[keyof typeof WORKFLOW_STAGES];

export const WORKFLOW_STAGE_LABELS: Record<WorkflowStage, string> = {
  NEW: 'New',
  DOCUMENTS_PENDING: 'Documents Pending',
  DOCUMENTS_UNDER_REVIEW: 'Documents Under Review',
  DOCUMENTS_COMPLETED: 'Documents Completed',
};

export const WORKFLOW_STAGE_ORDER: WorkflowStage[] = [
  WORKFLOW_STAGES.NEW,
  WORKFLOW_STAGES.DOCUMENTS_PENDING,
  WORKFLOW_STAGES.DOCUMENTS_UNDER_REVIEW,
  WORKFLOW_STAGES.DOCUMENTS_COMPLETED,
];

export const DOCUMENT_STATUSES = {
  PENDING: 'PENDING',
  UNDER_REVIEW: 'UNDER_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export type DocumentStatus = (typeof DOCUMENT_STATUSES)[keyof typeof DOCUMENT_STATUSES];

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  PENDING: 'Pending',
  UNDER_REVIEW: 'Under Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};
