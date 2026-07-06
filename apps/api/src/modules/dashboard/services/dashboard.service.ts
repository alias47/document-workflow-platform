import { Injectable } from '@nestjs/common';

import { DashboardRepository, type StatusCount } from '../repositories/dashboard.repository';

import type { DashboardActivityDto } from '../dto/dashboard-activity.dto';
import type { DashboardResponseDto } from '../dto/dashboard-response.dto';
import type { DashboardSummaryDto } from '../dto/dashboard-summary.dto';
import type { StaffWorkloadItemDto } from '../dto/dashboard-workload.dto';

import { ActivityService } from '@/modules/activity/services/activity.service';
import { ApplicantService } from '@/modules/applicant/services/applicant.service';
import { DocumentService } from '@/modules/document/services/document.service';
import { DocumentRequirementService } from '@/modules/document-requirement/services/document-requirement.service';
import { StaffService } from '@/modules/staff/services/staff.service';
import { WorkflowService } from '@/modules/workflow/services/workflow.service';

const RECENT_ACTIVITY_LIMIT = 20;

function sumCounts(counts: StatusCount[]): number {
  return counts.reduce((total, c) => total + c.count, 0);
}

function countFor(counts: StatusCount[], status: string): number {
  return counts.find((c) => c.status === status)?.count ?? 0;
}

/**
 * Aggregation layer for the operational dashboard (Sprint 11.5).
 *
 * DashboardService owns no business logic and issues no business Prisma queries.
 * It composes read-only aggregates exposed by the domain services
 * (Applicant/Document/DocumentRequirement/Workflow/Staff/Activity), running the
 * independent calls in parallel. Every downstream call is organization-scoped by
 * the domain service, so isolation is preserved end to end.
 *
 * The legacy {@link getDashboard} method is retained for the existing
 * `GET /dashboard` endpoint and delegates to the lightweight dashboard aggregate
 * repository (permitted by TASK.md §5 for aggregate-only queries that don't
 * belong to a single domain module).
 */
@Injectable()
export class DashboardService {
  constructor(
    private readonly dashboardRepo: DashboardRepository,
    private readonly applicantService: ApplicantService,
    private readonly documentService: DocumentService,
    private readonly requirementService: DocumentRequirementService,
    private readonly workflowService: WorkflowService,
    private readonly staffService: StaffService,
    private readonly activityService: ActivityService,
  ) {}

  /**
   * KPI cards + applicant status, document completion, and workflow distribution
   * summaries. All aggregates are fetched in parallel.
   */
  async getSummary(organizationId: string): Promise<DashboardSummaryDto> {
    const [applicantStatusCounts, documentStatusCounts, completion, stageDistribution, totalStaff] =
      await Promise.all([
        this.applicantService.countByStatus(organizationId),
        this.documentService.countByStatus(organizationId),
        this.requirementService.getCompletionSummary(organizationId),
        this.workflowService.getStageDistribution(organizationId),
        this.staffService.countStaff(organizationId),
      ]);

    const totalApplicants = sumCounts(applicantStatusCounts);
    const activeApplicants = countFor(applicantStatusCounts, 'active');
    // "Completed" has no dedicated applicant status in this domain; the archived
    // lifecycle state is the closest completed/closed signal.
    const completedApplicants = countFor(applicantStatusCounts, 'archived');

    const pendingDocuments = countFor(documentStatusCounts, 'pending');
    const completedDocuments = countFor(documentStatusCounts, 'verified');

    // Workflows are "completed" when the applicant sits in a final stage.
    const completedWorkflows = stageDistribution
      .filter((s) => s.isFinal)
      .reduce((sum, s) => sum + s.applicantCount, 0);
    const activeWorkflows = stageDistribution
      .filter((s) => !s.isFinal)
      .reduce((sum, s) => sum + s.applicantCount, 0);

    return {
      kpis: {
        totalApplicants,
        activeApplicants,
        completedApplicants,
        pendingDocuments,
        completedDocuments,
        activeWorkflows,
        completedWorkflows,
        totalStaff,
      },
      applicantStatus: stageDistribution.map((s) => ({
        stageId: s.stageId,
        stageName: s.stageName,
        color: s.color,
        applicantCount: s.applicantCount,
      })),
      documentCompletion: {
        fullyComplete: completion.fullyComplete,
        incomplete: completion.incomplete,
        averageCompletion: completion.averageCompletion,
        awaitingUpload: completion.awaitingUpload,
        missingDocuments: completion.missingDocuments,
      },
      workflowDistribution: stageDistribution.map((s) => ({
        stageId: s.stageId,
        stageName: s.stageName,
        color: s.color,
        applicantCount: s.applicantCount,
      })),
    };
  }

  /** Latest 20 organization activities, newest first, no pagination. */
  async getActivity(organizationId: string): Promise<DashboardActivityDto[]> {
    const activities = await this.activityService.listRecent(organizationId, RECENT_ACTIVITY_LIMIT);

    return activities.map((a) => ({
      id: a.id,
      type: a.type,
      title: a.title,
      description: a.description,
      createdAt: a.createdAt,
      actor: a.actor
        ? { id: a.actor.id, firstName: a.actor.firstName, lastName: a.actor.lastName }
        : null,
      target: a.applicant
        ? { id: a.applicant.id, firstName: a.applicant.firstName, lastName: a.applicant.lastName }
        : null,
    }));
  }

  /** Per-staff workload. Manager/admin-gated at the controller. */
  async getWorkload(organizationId: string): Promise<StaffWorkloadItemDto[]> {
    return this.staffService.getWorkload(organizationId);
  }

  // --- Legacy aggregated dashboard (existing GET /dashboard endpoint) --------

  async getDashboard(organizationId: string): Promise<DashboardResponseDto> {
    const data = await this.dashboardRepo.getDashboardData(organizationId);

    const { applicantStatusCounts, documentStatusCounts } = data;

    const activeApplicants = countFor(applicantStatusCounts, 'active');
    const archivedApplicants = countFor(applicantStatusCounts, 'archived');

    const pendingDocuments = countFor(documentStatusCounts, 'pending');
    const verifiedDocuments = countFor(documentStatusCounts, 'verified');
    const rejectedDocuments = countFor(documentStatusCounts, 'rejected');
    const expiredDocuments = countFor(documentStatusCounts, 'expired');

    return {
      summary: {
        totalApplicants: sumCounts(applicantStatusCounts),
        activeApplicants,
        archivedApplicants,
        totalDocuments: sumCounts(documentStatusCounts),
        pendingDocuments,
        verifiedDocuments,
        rejectedDocuments,
      },
      recentApplicants: data.recentApplicants,
      recentActivities: data.recentActivities,
      applicantSummary: {
        active: activeApplicants,
        archived: archivedApplicants,
      },
      documentSummary: {
        pending: pendingDocuments,
        verified: verifiedDocuments,
        rejected: rejectedDocuments,
        expired: expiredDocuments,
      },
    };
  }
}
