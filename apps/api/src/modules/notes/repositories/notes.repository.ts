import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';

export interface CreateNoteData {
  organizationId: string;
  applicantId: string;
  authorId: string;
  content: string;
  createdBy: string;
}

export interface UpdateNoteData {
  content: string;
  updatedBy: string;
}

const AUTHOR_SELECT = {
  author: { select: { id: true, firstName: true, lastName: true } },
} as const;

@Injectable()
export class NotesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listByApplicant(applicantId: string, organizationId: string) {
    return this.prisma.applicantNote.findMany({
      where: { applicantId, organizationId, deletedAt: null },
      include: AUTHOR_SELECT,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, organizationId: string) {
    return this.prisma.applicantNote.findFirst({
      where: { id, organizationId, deletedAt: null },
      include: AUTHOR_SELECT,
    });
  }

  async create(data: CreateNoteData) {
    return this.prisma.applicantNote.create({
      data: {
        organizationId: data.organizationId,
        applicantId: data.applicantId,
        authorId: data.authorId,
        content: data.content,
        createdBy: data.createdBy,
      },
      include: AUTHOR_SELECT,
    });
  }

  async update(id: string, data: UpdateNoteData) {
    return this.prisma.applicantNote.update({
      where: { id },
      data: { content: data.content, updatedBy: data.updatedBy },
      include: AUTHOR_SELECT,
    });
  }

  async softDelete(id: string, deletedBy: string) {
    return this.prisma.applicantNote.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy },
    });
  }
}
