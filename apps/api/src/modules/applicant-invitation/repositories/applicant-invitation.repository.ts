import { Injectable } from '@nestjs/common';

import type { PortalAccount, PortalInvitation } from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';

export type InvitationWithRelations = PortalInvitation & {
  createdByStaff: { id: string; firstName: string; lastName: string };
  applicant: { id: string; firstName: string; lastName: string; email: string | null };
  portalAccount: { id: string; status: string; activatedAt: Date | null };
};

@Injectable()
export class ApplicantInvitationRepository {
  constructor(private readonly prisma: PrismaService) {}

  findActiveByApplicant(
    applicantId: string,
    organizationId: string,
  ): Promise<InvitationWithRelations | null> {
    return this.prisma.portalInvitation.findFirst({
      where: {
        applicantId,
        organizationId,
        revokedAt: null,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: {
        createdByStaff: { select: { id: true, firstName: true, lastName: true } },
        applicant: { select: { id: true, firstName: true, lastName: true, email: true } },
        portalAccount: { select: { id: true, status: true, activatedAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findLatestByApplicant(
    applicantId: string,
    organizationId: string,
  ): Promise<InvitationWithRelations | null> {
    return this.prisma.portalInvitation.findFirst({
      where: { applicantId, organizationId },
      include: {
        createdByStaff: { select: { id: true, firstName: true, lastName: true } },
        applicant: { select: { id: true, firstName: true, lastName: true, email: true } },
        portalAccount: { select: { id: true, status: true, activatedAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findByTokenHash(tokenHash: string): Promise<InvitationWithRelations | null> {
    return this.prisma.portalInvitation.findFirst({
      where: { tokenHash },
      include: {
        createdByStaff: { select: { id: true, firstName: true, lastName: true } },
        applicant: { select: { id: true, firstName: true, lastName: true, email: true } },
        portalAccount: { select: { id: true, status: true, activatedAt: true } },
      },
    });
  }

  create(data: {
    organizationId: string;
    applicantId: string;
    portalAccountId: string;
    tokenHash: string;
    expiresAt: Date;
    createdBy: string;
  }): Promise<PortalInvitation> {
    return this.prisma.portalInvitation.create({ data });
  }

  revokeAllActiveByApplicant(
    applicantId: string,
    organizationId: string,
  ): Promise<{ count: number }> {
    return this.prisma.portalInvitation.updateMany({
      where: {
        applicantId,
        organizationId,
        revokedAt: null,
        acceptedAt: null,
      },
      data: { revokedAt: new Date() },
    });
  }

  markAccepted(id: string): Promise<PortalInvitation> {
    return this.prisma.portalInvitation.update({
      where: { id },
      data: { acceptedAt: new Date() },
    });
  }

  findOrCreatePortalAccount(
    organizationId: string,
    applicantId: string,
    email: string,
  ): Promise<PortalAccount> {
    return this.prisma.portalAccount.upsert({
      where: { applicantId },
      create: {
        organizationId,
        applicantId,
        email,
        status: 'invitation_sent',
      },
      update: {
        status: 'invitation_sent',
      },
    });
  }

  updatePortalAccountPassword(
    portalAccountId: string,
    passwordHash: string,
  ): Promise<PortalAccount> {
    return this.prisma.portalAccount.update({
      where: { id: portalAccountId },
      data: {
        passwordHash,
        status: 'active',
        activatedAt: new Date(),
        mustChangePass: false,
        passwordChangedAt: new Date(),
        failedAttempts: 0,
        lockedUntil: null,
      },
    });
  }

  revokeAllPortalRefreshTokens(portalAccountId: string): Promise<{ count: number }> {
    return this.prisma.portalRefreshToken.updateMany({
      where: { portalAccountId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  findApplicant(
    applicantId: string,
    organizationId: string,
  ): Promise<{ id: string; firstName: string; lastName: string; email: string | null } | null> {
    return this.prisma.applicant.findFirst({
      where: { id: applicantId, organizationId, deletedAt: null },
      select: { id: true, firstName: true, lastName: true, email: true },
    });
  }
}
