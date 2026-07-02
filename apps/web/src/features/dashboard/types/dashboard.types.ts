export interface DashboardSummary {
  totalApplicants: number;
  activeApplicants: number;
  archivedApplicants: number;
  totalDocuments: number;
  pendingDocuments: number;
  verifiedDocuments: number;
  rejectedDocuments: number;
}

export interface RecentApplicant {
  id: string;
  applicantNumber: string;
  firstName: string;
  lastName: string;
  email: string | null;
  status: string;
  createdAt: string;
}

export interface RecentActivityActor {
  id: string;
  firstName: string;
  lastName: string;
}

export interface RecentActivity {
  id: string;
  applicantId: string;
  type: string;
  title: string;
  description: string | null;
  actor: RecentActivityActor | null;
  createdAt: string;
}

export interface ApplicantSummary {
  active: number;
  archived: number;
}

export interface DocumentSummary {
  pending: number;
  verified: number;
  rejected: number;
  expired: number;
}

export interface DashboardResponse {
  summary: DashboardSummary;
  recentApplicants: RecentApplicant[];
  recentActivities: RecentActivity[];
  applicantSummary: ApplicantSummary;
  documentSummary: DocumentSummary;
}
