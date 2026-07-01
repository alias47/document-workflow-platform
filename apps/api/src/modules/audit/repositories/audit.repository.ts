import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';

export interface CreateAuditLogInput {
  organizationId: string;
  actorId?: string | undefined;
  actorType?: string | undefined;
  action: string;
  resourceType?: string | undefined;
  resourceId?: string | undefined;
  metadata?: Record<string, Prisma.InputJsonValue> | undefined;
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
}

@Injectable()
export class AuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateAuditLogInput): Promise<void> {
    return this.prisma.auditLog
      .create({
        data: {
          organizationId: data.organizationId,
          action: data.action,
          ...(data.actorId !== undefined ? { actorId: data.actorId } : {}),
          ...(data.actorType !== undefined ? { actorType: data.actorType } : {}),
          ...(data.resourceType !== undefined ? { resourceType: data.resourceType } : {}),
          ...(data.resourceId !== undefined ? { resourceId: data.resourceId } : {}),
          ...(data.metadata !== undefined ? { metadata: data.metadata } : {}),
          ...(data.ipAddress !== undefined ? { ipAddress: data.ipAddress } : {}),
          ...(data.userAgent !== undefined ? { userAgent: data.userAgent } : {}),
        },
      })
      .then(() => undefined);
  }
}
