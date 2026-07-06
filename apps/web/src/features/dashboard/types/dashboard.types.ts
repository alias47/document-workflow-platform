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

// ── Sprint 11.5 analytics dashboard ─────────────────────────────────────────

export interface DashboardKpis {
  totalApplicants: number;
  activeApplicants: number;
  completedApplicants: number;
  pendingDocuments: number;
  completedDocuments: number;
  activeWorkflows: number;
  completedWorkflows: number;
  totalStaff: number;
}

export interface StageCount {
  stageId: string;
  stageName: string;
  color: string | null;
  applicantCount: number;
}

export interface DocumentCompletion {
  fullyComplete: number;
  incomplete: number;
  averageCompletion: number;
  awaitingUpload: number;
  missingDocuments: number;
}

export interface DashboardSummaryResponse {
  kpis: DashboardKpis;
  applicantStatus: StageCount[];
  documentCompletion: DocumentCompletion;
  workflowDistribution: StageCount[];
}

export interface ActivityParty {
  id: string;
  firstName: string;
  lastName: string;
}

export interface DashboardActivity {
  id: string;
  type: string;
  title: string;
  description: string | null;
  createdAt: string;
  actor: ActivityParty | null;
  target: ActivityParty | null;
}

export interface StaffWorkloadItem {
  staffId: string;
  name: string;
  role: string;
  assignedApplicants: number;
  workloadPercent: number;
}
