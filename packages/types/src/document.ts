export type DocumentStatus = 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

export type DocumentMimeType = 'application/pdf' | 'image/jpeg' | 'image/png';

export interface Document {
  id: string;
  organizationId: string;
  applicantId: string;
  name: string;
  storageKey: string;
  mimeType: DocumentMimeType;
  sizeBytes: number;
  status: DocumentStatus;
  rejectionReason: string | null;
  uploadedById: string;
  reviewedById: string | null;
  createdAt: string;
  updatedAt: string;
}
