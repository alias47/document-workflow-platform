import type { WorkflowStage } from './applicant';

export interface TimelineEvent {
  id: string;
  organizationId: string;
  applicantId: string;
  actorId: string;
  actorName: string;
  event: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface WorkflowStageTransition {
  from: WorkflowStage;
  to: WorkflowStage;
  performedById: string;
  createdAt: string;
}
