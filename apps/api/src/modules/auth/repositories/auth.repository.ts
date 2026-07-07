import { Injectable } from '@nestjs/common';

import type { Staff, RefreshToken, PasswordResetToken } from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';

export type StaffWithPermissions = Staff & {
  role: { name: string; permissions: { permission: { action: string } }[] };
};

export type StaffWithOrgStatus = Staff & {
  role: { id: string; name: string };
  organization: { id: string; isActive: boolean; deletedAt: Date | null };
};

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Load a staff member together with their organization's active/deleted state
   * and current role, for per-request JWT re-validation. Returns null if the
   * staff row is soft-deleted or absent.
   */
  findStaffForValidation(id: string): Promise<StaffWithOrgStatus | null> {
    return this.prisma.staff.findFirst({
      where: { id, deletedAt: null },
      include: {
        role: { select: { id: true, name: true } },
        organization: { select: { id: true, isActive: true, deletedAt: true } },
      },
    });
  }

  findStaffByEmail(organizationId: string, email: string): Promise<StaffWithPermissions | null> {
    return this.prisma.staff.findFirst({
      where: { organizationId, email, deletedAt: null },
      include: {
        role: {
          include: { permissions: { include: { permission: true } } },
        },
      },
    });
  }

  findOrganizationStatus(
    id: string,
  ): Promise<{ id: string; isActive: boolean; deletedAt: Date | null } | null> {
    return this.prisma.organization.findUnique({
      where: { id },
      select: { id: true, isActive: true, deletedAt: true },
    });
  }

  findStaffById(id: string): Promise<StaffWithPermissions | null> {
    return this.prisma.staff.findFirst({
      where: { id, deletedAt: null },
      include: {
        role: {
          include: { permissions: { include: { permission: true } } },
        },
      },
    });
  }

  updateLastLogin(staffId: string): Promise<Staff> {
    return this.prisma.staff.update({
      where: { id: staffId },
      data: { lastLoginAt: new Date(), failedAttempts: 0, lockedUntil: null },
    });
  }

  incrementFailedAttempts(staffId: string, lockUntil?: Date): Promise<Staff> {
    return this.prisma.staff.update({
      where: { id: staffId },
      data: {
        failedAttempts: { increment: 1 },
        ...(lockUntil ? { lockedUntil: lockUntil } : {}),
      },
    });
  }

  createRefreshToken(data: {
    staffId: string;
    tokenHash: string;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<RefreshToken> {
    return this.prisma.refreshToken.create({ data });
  }

  findRefreshToken(tokenHash: string): Promise<RefreshToken | null> {
    return this.prisma.refreshToken.findUnique({ where: { tokenHash } });
  }

  revokeRefreshToken(id: string, replacedById?: string): Promise<RefreshToken> {
    return this.prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date(), ...(replacedById ? { replacedBy: replacedById } : {}) },
    });
  }

  revokeAllStaffTokens(staffId: string): Promise<{ count: number }> {
    return this.prisma.refreshToken.updateMany({
      where: { staffId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  updatePassword(staffId: string, passwordHash: string): Promise<Staff> {
    return this.prisma.staff.update({
      where: { id: staffId },
      data: { passwordHash, passwordChangedAt: new Date(), mustChangePass: false },
    });
  }

  storePasswordResetToken(
    staffId: string,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<PasswordResetToken> {
    return this.prisma.passwordResetToken.create({
      data: { staffId, tokenHash, expiresAt },
    });
  }

  findValidPasswordResetToken(tokenHash: string): Promise<PasswordResetToken | null> {
    return this.prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
  }

  markPasswordResetTokenUsed(id: string): Promise<PasswordResetToken> {
    return this.prisma.passwordResetToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }
}
