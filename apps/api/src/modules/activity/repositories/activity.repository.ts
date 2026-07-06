import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import type { ActivityType } from '../interfaces/activity-type';

import { PrismaService } from '@/prisma/prisma.service';

export interface CreateActivityData {
  organizationId: string;
  applicantId: string;
  type: ActivityType;
  title: string;
  description?: string | undefined;
  actorId?: string | undefined;
  metadata?: Record<string, Prisma.InputJsonValue> | undefined;
}

export interface ListActivityParams {
  applicantId: string;
  organizationId: string;
  page: number;
  pageSize: number;
}

const ACTOR_SELECT = {
  actor: { select: { id: true, firstName: true, lastName: true } },
} as const;

/**
 * DB access for applicant activities. Append-only by design: this repository
 * intentionally exposes no update or delete methods (TASK 8.4 business rule).
 */
@Injectable()
export class ActivityRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateActivityData) {
    return this.prisma.applicantActivity.create({
      data: {
        organizationId: data.organizationId,
        applicantId: data.applicantId,
        type: data.type,
        title: data.title,
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.actorId !== undefined ? { actorId: data.actorId } : {}),
        ...(data.metadata !== undefined ? { metadata: data.metadata } : {}),
      },
    });
  }

  /**
   * Most-recent activities across the whole organization (dashboard feed).
   * Newest first, capped by `limit`, no pagination. Actor and the target
   * applicant are pulled via joins to avoid per-row lookups (no N+1).
   */
  async listRecentByOrganization(organizationId: string, limit: number) {
    return this.prisma.applicantActivity.findMany({
      where: { organizationId },
      include: {
        ...ACTOR_SELECT,
        applicant: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async listByApplicant(params: ListActivityParams) {
    const { applicantId, organizationId, page, pageSize } = params;
    const where = { applicantId, organizationId };
    const skip = (page - 1) * pageSize;

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.applicantActivity.findMany({
        where,
        include: ACTOR_SELECT,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.applicantActivity.count({ where }),
    ]);

    return { rows, total };
  }
}
