import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';

export interface ApplicantReportFilters {
  search?: string | undefined;
  consultantId?: string | undefined;
  workflowStageId?: string | undefined;
  status?: string | undefined;
  country?: string | undefined;
  intake?: string | undefined;
  startDate?: string | undefined;
  endDate?: string | undefined;
  sort?: 'newest' | 'oldest' | 'name' | undefined;
  page: number;
  pageSize: number;
}

export interface DocumentReportFilters {
  search?: string | undefined;
  consultantId?: string | undefined;
  workflowStageId?: string | undefined;
  status?: string | undefined;
  page: number;
  pageSize: number;
}

export interface StaffWorkloadFilters {
  search?: string | undefined;
  roleId?: string | undefined;
  page: number;
  pageSize: number;
}

@Injectable()
export class ReportRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getApplicantReport(organizationId: string, filters: ApplicantReportFilters) {
    const {
      search,
      consultantId,
      workflowStageId,
      status,
      country,
      startDate,
      endDate,
      sort,
      page,
      pageSize,
    } = filters;

    const where: Prisma.ApplicantWhereInput = {
      organizationId,
      deletedAt: null,
      ...(status ? { status: status as 'active' | 'inactive' | 'archived' } : {}),
      ...(country ? { country: { equals: country, mode: 'insensitive' } } : {}),
      ...(startDate ? { createdAt: { gte: new Date(startDate) } } : {}),
      ...(endDate ? { createdAt: { lte: new Date(endDate) } } : {}),
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { applicantNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (consultantId) {
      where.assignments = { some: { staffId: consultantId } };
    }

    if (workflowStageId) {
      where.workflow = { currentStageId: workflowStageId };
    }

    const orderBy: Prisma.ApplicantOrderByWithRelationInput =
      sort === 'oldest'
        ? { createdAt: 'asc' }
        : sort === 'name'
          ? { firstName: 'asc' }
          : { createdAt: 'desc' };

    const [data, total] = await Promise.all([
      this.prisma.applicant.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          applicantNumber: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          country: true,
          status: true,
          createdAt: true,
          assignments: {
            where: { isPrimary: true },
            select: {
              staff: { select: { id: true, firstName: true, lastName: true } },
            },
            take: 1,
          },
          workflow: {
            select: {
              currentStage: { select: { id: true, name: true } },
            },
          },
        },
      }),
      this.prisma.applicant.count({ where }),
    ]);

    return { data, total };
  }

  async getApplicantReportAll(
    organizationId: string,
    filters: Omit<ApplicantReportFilters, 'page' | 'pageSize'>,
  ) {
    return this.getApplicantReport(organizationId, { ...filters, page: 1, pageSize: 10_000 });
  }

  async getDocumentReport(organizationId: string, filters: DocumentReportFilters) {
    const { search, consultantId, workflowStageId, page, pageSize } = filters;

    const applicantWhere: Prisma.ApplicantWhereInput = {
      organizationId,
      deletedAt: null,
    };

    if (search) {
      applicantWhere.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (consultantId) {
      applicantWhere.assignments = { some: { staffId: consultantId } };
    }

    if (workflowStageId) {
      applicantWhere.workflow = { currentStageId: workflowStageId };
    }

    const [applicants, total] = await Promise.all([
      this.prisma.applicant.findMany({
        where: applicantWhere,
        orderBy: { firstName: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          documentRequirements: {
            select: { status: true },
          },
        },
      }),
      this.prisma.applicant.count({ where: applicantWhere }),
    ]);

    return { data: applicants, total };
  }

  async getDocumentReportAll(
    organizationId: string,
    filters: Omit<DocumentReportFilters, 'page' | 'pageSize'>,
  ) {
    return this.getDocumentReport(organizationId, { ...filters, page: 1, pageSize: 10_000 });
  }

  async getWorkflowReport(organizationId: string) {
    const stages = await this.prisma.workflowStage.findMany({
      where: { organizationId, deletedAt: null },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        name: true,
        color: true,
        order: true,
        currentWorkflows: {
          where: {
            applicant: { deletedAt: null, organizationId },
          },
          select: { id: true },
        },
      },
    });

    return stages.map((s) => ({
      stageId: s.id,
      stageName: s.name,
      color: s.color,
      order: s.order,
      applicantCount: s.currentWorkflows.length,
    }));
  }

  async getStaffWorkloadReport(organizationId: string, filters: StaffWorkloadFilters) {
    const { search, roleId, page, pageSize } = filters;

    const where: Prisma.StaffWhereInput = {
      organizationId,
      deletedAt: null,
      ...(roleId ? { roleId } : {}),
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [staff, total] = await Promise.all([
      this.prisma.staff.findMany({
        where,
        orderBy: { firstName: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          jobTitle: true,
          role: { select: { id: true, name: true } },
          assignments: {
            where: { applicant: { deletedAt: null, organizationId } },
            select: {
              applicant: { select: { status: true } },
            },
          },
        },
      }),
      this.prisma.staff.count({ where }),
    ]);

    return { data: staff, total };
  }

  async getStaffWorkloadReportAll(
    organizationId: string,
    filters: Omit<StaffWorkloadFilters, 'page' | 'pageSize'>,
  ) {
    return this.getStaffWorkloadReport(organizationId, { ...filters, page: 1, pageSize: 10_000 });
  }
}
