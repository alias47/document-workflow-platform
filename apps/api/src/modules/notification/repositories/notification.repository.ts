import { Injectable } from '@nestjs/common';
import { type Notification, type NotificationStatus, Prisma } from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';

export interface CreateNotificationData {
  organizationId: string;
  template: string;
  recipient: string;
  subject: string;
  body: string;
  maxRetries: number;
  metadata?: Record<string, Prisma.InputJsonValue> | undefined;
}

export interface ListNotificationParams {
  organizationId: string;
  page: number;
  pageSize: number;
  status?: NotificationStatus | undefined;
  template?: string | undefined;
  search?: string | undefined;
}

@Injectable()
export class NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateNotificationData): Promise<Notification> {
    return this.prisma.notification.create({
      data: {
        organizationId: data.organizationId,
        template: data.template,
        recipient: data.recipient,
        subject: data.subject,
        body: data.body,
        maxRetries: data.maxRetries,
        ...(data.metadata !== undefined ? { metadata: data.metadata } : {}),
      },
    });
  }

  findById(id: string, organizationId: string): Promise<Notification | null> {
    return this.prisma.notification.findFirst({ where: { id, organizationId } });
  }

  async list(params: ListNotificationParams): Promise<{ rows: Notification[]; total: number }> {
    const { organizationId, page, pageSize, status, template, search } = params;
    const where: Prisma.NotificationWhereInput = {
      organizationId,
      ...(status !== undefined ? { status } : {}),
      ...(template !== undefined ? { template } : {}),
      ...(search !== undefined
        ? {
            OR: [
              { recipient: { contains: search, mode: 'insensitive' } },
              { subject: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const skip = (page - 1) * pageSize;

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return { rows, total };
  }

  /** Atomically claim a queued/failed notification for processing (idempotency guard). */
  async markProcessing(id: string): Promise<void> {
    await this.prisma.notification.update({
      where: { id },
      data: { status: 'processing', processedAt: new Date() },
    });
  }

  async markSent(id: string): Promise<void> {
    await this.prisma.notification.update({
      where: { id },
      data: { status: 'sent', sentAt: new Date(), errorMessage: null },
    });
  }

  async markFailed(id: string, errorMessage: string): Promise<void> {
    await this.prisma.notification.update({
      where: { id },
      data: { status: 'failed', errorMessage },
    });
  }

  async incrementRetry(id: string): Promise<Notification> {
    return this.prisma.notification.update({
      where: { id },
      data: { retryCount: { increment: 1 }, status: 'queued', errorMessage: null },
    });
  }
}
