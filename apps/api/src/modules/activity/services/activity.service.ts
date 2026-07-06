import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { ActivityRepository, type CreateActivityData } from '../repositories/activity.repository';

import type { ActivityQueryDto } from '../dto/activity-query.dto';

import { PrismaService } from '@/prisma/prisma.service';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

/**
 * Shared entry point for recording and reading applicant activity (TASK 8.4).
 *
 * Business modules call {@link record} to append an activity; they must never
 * write to the repository directly. Recording is best-effort — a failure here
 * must never break the originating action, so errors are swallowed and logged
 * (same contract as AuditService).
 */
@Injectable()
export class ActivityService {
  private readonly logger = new Logger(ActivityService.name);

  constructor(
    private readonly activityRepo: ActivityRepository,
    private readonly prisma: PrismaService,
  ) {}

  async record(input: CreateActivityData): Promise<void> {
    try {
      await this.activityRepo.create(input);
    } catch (err) {
      // Activity recording is append-only history; never break the main flow.
      this.logger.error('Failed to record applicant activity', err);
    }
  }

  /**
   * Latest activities across the organization for the dashboard feed. Newest
   * first, no pagination, capped at `limit` (default 20). Each row includes the
   * actor and the target applicant.
   */
  async listRecent(organizationId: string, limit: number = DEFAULT_PAGE_SIZE) {
    return this.activityRepo.listRecentByOrganization(organizationId, limit);
  }

  async listByApplicant(applicantId: string, organizationId: string, query: ActivityQueryDto) {
    // Organization isolation: only surface activity for an applicant that lives
    // in the caller's org. Soft-deleted applicants still retain their history,
    // so we intentionally do not filter on deletedAt here.
    const applicant = await this.prisma.applicant.findFirst({
      where: { id: applicantId, organizationId },
      select: { id: true },
    });
    if (!applicant) throw new NotFoundException('Applicant not found');

    const page = query.page ?? DEFAULT_PAGE;
    const pageSize = query.pageSize ?? DEFAULT_PAGE_SIZE;

    const { rows, total } = await this.activityRepo.listByApplicant({
      applicantId,
      organizationId,
      page,
      pageSize,
    });

    return {
      data: rows,
      meta: {
        page,
        pageSize,
        totalItems: total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }
}
