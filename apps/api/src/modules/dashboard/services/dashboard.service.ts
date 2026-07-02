import { Injectable } from '@nestjs/common';

import { DashboardRepository, type StatusCount } from '../repositories/dashboard.repository';

import type { DashboardResponseDto } from '../dto/dashboard-response.dto';

function sumCounts(counts: StatusCount[]): number {
  return counts.reduce((total, c) => total + c.count, 0);
}

function countFor(counts: StatusCount[], status: string): number {
  return counts.find((c) => c.status === status)?.count ?? 0;
}

@Injectable()
export class DashboardService {
  constructor(private readonly dashboardRepo: DashboardRepository) {}

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
