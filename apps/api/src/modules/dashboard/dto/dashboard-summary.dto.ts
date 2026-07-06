import { ApiProperty } from '@nestjs/swagger';

/**
 * KPI figures for the dashboard summary endpoint (Sprint 11.5 §7).
 *
 * Task-based KPIs (overdueTasks / dueTodayTasks / dueThisWeekTasks) from the
 * TASK.md spec are intentionally omitted: this codebase has no Task module, so
 * there is no data to back them (decision recorded in the sprint report).
 * "completed" applicants map to the archived lifecycle status; "active/completed
 * workflows" are derived from workflow stages flagged `isFinal`.
 */
export class DashboardKpiDto {
  @ApiProperty()
  totalApplicants: number = 0;

  @ApiProperty()
  activeApplicants: number = 0;

  @ApiProperty()
  completedApplicants: number = 0;

  @ApiProperty()
  pendingDocuments: number = 0;

  @ApiProperty()
  completedDocuments: number = 0;

  @ApiProperty()
  activeWorkflows: number = 0;

  @ApiProperty()
  completedWorkflows: number = 0;

  @ApiProperty()
  totalStaff: number = 0;
}

export class ApplicantStageCountDto {
  @ApiProperty()
  stageId: string = '';

  @ApiProperty()
  stageName: string = '';

  @ApiProperty({ nullable: true })
  color: string | null = null;

  @ApiProperty()
  applicantCount: number = 0;
}

export class DocumentCompletionDto {
  @ApiProperty()
  fullyComplete: number = 0;

  @ApiProperty()
  incomplete: number = 0;

  @ApiProperty({ description: 'Average approved-requirement ratio, 0–100' })
  averageCompletion: number = 0;

  @ApiProperty()
  awaitingUpload: number = 0;

  @ApiProperty()
  missingDocuments: number = 0;
}

export class WorkflowDistributionItemDto {
  @ApiProperty()
  stageId: string = '';

  @ApiProperty()
  stageName: string = '';

  @ApiProperty({ nullable: true })
  color: string | null = null;

  @ApiProperty()
  applicantCount: number = 0;
}

export class DashboardSummaryDto {
  @ApiProperty({ type: DashboardKpiDto })
  kpis: DashboardKpiDto = new DashboardKpiDto();

  @ApiProperty({ type: [ApplicantStageCountDto] })
  applicantStatus: ApplicantStageCountDto[] = [];

  @ApiProperty({ type: DocumentCompletionDto })
  documentCompletion: DocumentCompletionDto = new DocumentCompletionDto();

  @ApiProperty({ type: [WorkflowDistributionItemDto] })
  workflowDistribution: WorkflowDistributionItemDto[] = [];
}
