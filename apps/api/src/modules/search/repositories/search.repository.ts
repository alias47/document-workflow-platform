import { Injectable } from '@nestjs/common';

import type {
  ApplicantSearchResult,
  DocumentSearchResult,
  WorkflowSearchResult,
} from '../interfaces/search-provider.interface';

import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class SearchRepository {
  constructor(private readonly prisma: PrismaService) {}

  async searchApplicants(
    query: string,
    organizationId: string,
    skip: number,
    take: number,
  ): Promise<{ results: ApplicantSearchResult[]; total: number }> {
    const term = `%${query}%`;
    const where = {
      organizationId,
      deletedAt: null,
      OR: [
        { applicantNumber: { contains: query, mode: 'insensitive' as const } },
        { firstName: { contains: query, mode: 'insensitive' as const } },
        { middleName: { contains: query, mode: 'insensitive' as const } },
        { lastName: { contains: query, mode: 'insensitive' as const } },
        { email: { contains: query, mode: 'insensitive' as const } },
        { phone: { contains: term } },
      ],
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.applicant.findMany({
        where,
        select: {
          id: true,
          applicantNumber: true,
          firstName: true,
          middleName: true,
          lastName: true,
          email: true,
          phone: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.applicant.count({ where }),
    ]);

    return {
      results: rows.map((r) => ({ type: 'applicant' as const, ...r })),
      total,
    };
  }

  async searchDocuments(
    query: string,
    organizationId: string,
    skip: number,
    take: number,
  ): Promise<{ results: DocumentSearchResult[]; total: number }> {
    const where = {
      organizationId,
      deletedAt: null,
      OR: [
        { title: { contains: query, mode: 'insensitive' as const } },
        { originalFilename: { contains: query, mode: 'insensitive' as const } },
        { description: { contains: query, mode: 'insensitive' as const } },
        { tags: { has: query } },
        { category: { equals: query as never } },
      ],
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.document.findMany({
        where,
        select: {
          id: true,
          applicantId: true,
          title: true,
          originalFilename: true,
          description: true,
          tags: true,
          category: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.document.count({ where }),
    ]);

    return {
      results: rows.map((r) => ({ type: 'document' as const, ...r })),
      total,
    };
  }

  async searchWorkflows(
    query: string,
    organizationId: string,
    skip: number,
    take: number,
  ): Promise<{ results: WorkflowSearchResult[]; total: number }> {
    const where = {
      organizationId,
      deletedAt: null,
      currentStage: {
        name: { contains: query, mode: 'insensitive' as const },
        deletedAt: null,
      },
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.applicantWorkflow.findMany({
        where,
        select: {
          id: true,
          applicantId: true,
          enteredStageAt: true,
          applicant: {
            select: { applicantNumber: true, firstName: true, lastName: true },
          },
          currentStage: { select: { name: true } },
        },
        orderBy: { enteredStageAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.applicantWorkflow.count({ where }),
    ]);

    return {
      results: rows.map((r) => ({
        type: 'workflow' as const,
        id: r.id,
        applicantId: r.applicantId,
        applicantNumber: r.applicant.applicantNumber,
        firstName: r.applicant.firstName,
        lastName: r.applicant.lastName,
        currentStageName: r.currentStage.name,
        enteredStageAt: r.enteredStageAt,
      })),
      total,
    };
  }
}
