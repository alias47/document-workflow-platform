import { Injectable } from '@nestjs/common';

import type { PortalAccount, PortalRefreshToken } from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';

export type PortalAccountWithApplicant = PortalAccount & {
  applicant: { id: string; firstName: string; lastName: string; email: string | null } | null;
};

export interface OrganizationPortalStatus {
  id: string;
  isActive: boolean;
  deletedAt: Date | null;
  portalEnabled: boolean;
}

@Injectable()
export class ApplicantAuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Load a portal account (with its applicant) for per-request JWT re-validation.
   * Returns null if the account is soft-deleted or absent. Organization status is
   * fetched separately via {@link findOrganizationStatus} — PortalAccount has no
   * `organization` relation field, only `organizationId`.
   */
  findPortalAccountForValidation(id: string): Promise<PortalAccountWithApplicant | null> {
    return this.prisma.portalAccount.findFirst({
      where: { id, deletedAt: null },
      include: {
        applicant: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
  }

  findPortalAccountByEmail(
    organizationId: string,
    email: string,
  ): Promise<PortalAccountWithApplicant | null> {
    return this.prisma.portalAccount.findFirst({
      where: { organizationId, email, deletedAt: null },
      include: {
        applicant: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
  }

  findOrganizationStatus(id: string): Promise<OrganizationPortalStatus | null> {
    return this.prisma.organization.findUnique({
      where: { id },
      select: { id: true, isActive: true, deletedAt: true, portalEnabled: true },
    });
  }

  findPortalAccountById(id: string): Promise<PortalAccountWithApplicant | null> {
    return this.prisma.portalAccount.findFirst({
      where: { id, deletedAt: null },
      include: {
        applicant: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
  }

  updateLastLogin(portalAccountId: string): Promise<PortalAccount> {
    return this.prisma.portalAccount.update({
      where: { id: portalAccountId },
      data: { lastLoginAt: new Date(), failedAttempts: 0, lockedUntil: null },
    });
  }

  incrementFailedAttempts(portalAccountId: string, lockUntil?: Date): Promise<PortalAccount> {
    return this.prisma.portalAccount.update({
      where: { id: portalAccountId },
      data: {
        failedAttempts: { increment: 1 },
        ...(lockUntil ? { lockedUntil: lockUntil } : {}),
      },
    });
  }

  createRefreshToken(data: {
    portalAccountId: string;
    tokenHash: string;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<PortalRefreshToken> {
    return this.prisma.portalRefreshToken.create({ data });
  }

  findRefreshToken(tokenHash: string): Promise<PortalRefreshToken | null> {
    return this.prisma.portalRefreshToken.findUnique({ where: { tokenHash } });
  }

  revokeRefreshToken(id: string, replacedById?: string): Promise<PortalRefreshToken> {
    return this.prisma.portalRefreshToken.update({
      where: { id },
      data: { revokedAt: new Date(), ...(replacedById ? { replacedBy: replacedById } : {}) },
    });
  }

  revokeAllPortalAccountTokens(portalAccountId: string): Promise<{ count: number }> {
    return this.prisma.portalRefreshToken.updateMany({
      where: { portalAccountId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  updatePassword(portalAccountId: string, passwordHash: string): Promise<PortalAccount> {
    return this.prisma.portalAccount.update({
      where: { id: portalAccountId },
      data: { passwordHash, passwordChangedAt: new Date(), mustChangePass: false },
    });
  }
}
