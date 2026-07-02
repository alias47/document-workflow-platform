import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';

const RECENT_APPLICANTS_LIMIT = 10;
const RECENT_ACTIVITIES_LIMIT = 15;

export interface StatusCount {
  status: string;
  count: number;
}

/**
 * Shape of a single `groupBy(['status'], { _count: { status: true } })` row.
 * Declared explicitly because the array form of `$transaction` widens Prisma's
 * `_count` result to a union, which defeats inference at the `.map` call site —
 * so callers pass the groups through `unknown` into this precise structural type.
 */
interface StatusGroupRow {
  status: string;
  _count: { status: number };
}

function toStatusCounts(groups: readonly StatusGroupRow[]): StatusCount[] {
  return groups.map((g) => ({ status: g.status, count: g._count.status }));
}

export interface DashboardData {
  applicantStatusCounts: StatusCount[];
  documentStatusCounts: StatusCount[];
  recentApplicants: {
    id: string;
    applicantNumber: string;
    firstName: string;
    lastName: string;
    email: string | null;
    status: string;
    createdAt: Date;
  }[];
  recentActivities: {
    id: string;
    applicantId: string;
    type: string;
    title: string;
    description: string | null;
    createdAt: Date;
    actor: { id: string; firstName: string; lastName: string } | null;
  }[];
}

/**
 * DB access for the aggregated dashboard (TASK 9.1). Read-only. Every query is
 * scoped by organizationId and excludes soft-deleted records, and they are all
 * dispatched in a single $transaction batch so the endpoint issues one DB
 * round-trip with no N+1 (status counts use groupBy, and recent activities pull
 * the actor via a join rather than per-row lookups).
 */
@Injectable()
export class DashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardData(organizationId: string): Promise<DashboardData> {
    const [applicantGroups, documentGroups, recentApplicants, recentActivities] =
      await this.prisma.$transaction([
        this.prisma.applicant.groupBy({
          by: ['status'],
          where: { organizationId, deletedAt: null },
          _count: { status: true },
          orderBy: { status: 'asc' },
        }),
        this.prisma.document.groupBy({
          by: ['status'],
          where: { organizationId, deletedAt: null },
          _count: { status: true },
          orderBy: { status: 'asc' },
        }),
        this.prisma.applicant.findMany({
          where: { organizationId, deletedAt: null },
          select: {
            id: true,
            applicantNumber: true,
            firstName: true,
            lastName: true,
            email: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: RECENT_APPLICANTS_LIMIT,
        }),
        this.prisma.applicantActivity.findMany({
          where: { organizationId },
          select: {
            id: true,
            applicantId: true,
            type: true,
            title: true,
            description: true,
            createdAt: true,
            actor: { select: { id: true, firstName: true, lastName: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: RECENT_ACTIVITIES_LIMIT,
        }),
      ]);

    return {
      // Prisma's array-form $transaction widens the `_count` result type; the
      // runtime shape is exactly StatusGroupRow, so narrow through `unknown`.
      applicantStatusCounts: toStatusCounts(applicantGroups as unknown as StatusGroupRow[]),
      documentStatusCounts: toStatusCounts(documentGroups as unknown as StatusGroupRow[]),
      recentApplicants,
      recentActivities,
    };
  }
}
