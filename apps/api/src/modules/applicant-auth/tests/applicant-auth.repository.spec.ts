import { Test, type TestingModule } from '@nestjs/testing';

import { ApplicantAuthRepository } from '../repositories/applicant-auth.repository';

import { PrismaService } from '@/prisma/prisma.service';

const PORTAL_ACCOUNT_ID = 'portal-uuid-1';
const ORG_ID = 'org-uuid-1';
const EMAIL = 'applicant@example.com';

const mockPortalAccount = {
  id: PORTAL_ACCOUNT_ID,
  organizationId: ORG_ID,
  applicantId: 'applicant-uuid-1',
  email: EMAIL,
  passwordHash: '$argon2id$hashed',
  status: 'active',
  invitationToken: null,
  invitationExpiresAt: null,
  activatedAt: null,
  failedAttempts: 0,
  lockedUntil: null,
  mustChangePass: false,
  passwordChangedAt: null,
  lastLoginAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  applicant: {
    id: 'applicant-uuid-1',
    firstName: 'John',
    lastName: 'Doe',
    email: EMAIL,
  },
};

describe('ApplicantAuthRepository', () => {
  let repo: ApplicantAuthRepository;
  let prisma: {
    portalAccount: { findFirst: jest.Mock; update: jest.Mock };
    portalRefreshToken: {
      create: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      portalAccount: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      portalRefreshToken: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ApplicantAuthRepository, { provide: PrismaService, useValue: prisma }],
    }).compile();

    repo = module.get(ApplicantAuthRepository);
  });

  describe('findPortalAccountByEmail', () => {
    it('finds portal account by org and email', async () => {
      prisma.portalAccount.findFirst.mockResolvedValue(mockPortalAccount);
      const result = await repo.findPortalAccountByEmail(ORG_ID, EMAIL);
      expect(result).toEqual(mockPortalAccount);
      expect(prisma.portalAccount.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ organizationId: ORG_ID, email: EMAIL }),
        }),
      );
    });

    it('returns null when not found', async () => {
      prisma.portalAccount.findFirst.mockResolvedValue(null);
      const result = await repo.findPortalAccountByEmail(ORG_ID, 'none@example.com');
      expect(result).toBeNull();
    });
  });

  describe('updateLastLogin', () => {
    it('resets failedAttempts and sets lastLoginAt', async () => {
      prisma.portalAccount.update.mockResolvedValue({ ...mockPortalAccount, failedAttempts: 0 });
      await repo.updateLastLogin(PORTAL_ACCOUNT_ID);
      expect(prisma.portalAccount.update).toHaveBeenCalledWith({
        where: { id: PORTAL_ACCOUNT_ID },
        data: expect.objectContaining({ failedAttempts: 0, lockedUntil: null }),
      });
    });
  });

  describe('incrementFailedAttempts', () => {
    it('increments failedAttempts without lockUntil', async () => {
      prisma.portalAccount.update.mockResolvedValue(mockPortalAccount);
      await repo.incrementFailedAttempts(PORTAL_ACCOUNT_ID);
      expect(prisma.portalAccount.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ failedAttempts: { increment: 1 } }),
        }),
      );
    });

    it('sets lockedUntil when provided', async () => {
      const lockUntil = new Date(Date.now() + 900000);
      prisma.portalAccount.update.mockResolvedValue(mockPortalAccount);
      await repo.incrementFailedAttempts(PORTAL_ACCOUNT_ID, lockUntil);
      expect(prisma.portalAccount.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ lockedUntil: lockUntil }) }),
      );
    });
  });

  describe('createRefreshToken', () => {
    it('creates a portal refresh token', async () => {
      const tokenData = {
        portalAccountId: PORTAL_ACCOUNT_ID,
        tokenHash: 'hashed',
        expiresAt: new Date(Date.now() + 86400000),
      };
      prisma.portalRefreshToken.create.mockResolvedValue({ id: 'rt-1', ...tokenData });
      const result = await repo.createRefreshToken(tokenData);
      expect(result.portalAccountId).toBe(PORTAL_ACCOUNT_ID);
    });
  });

  describe('revokeAllPortalAccountTokens', () => {
    it('revokes all non-revoked tokens for the portal account', async () => {
      prisma.portalRefreshToken.updateMany.mockResolvedValue({ count: 2 });
      const result = await repo.revokeAllPortalAccountTokens(PORTAL_ACCOUNT_ID);
      expect(result.count).toBe(2);
      expect(prisma.portalRefreshToken.updateMany).toHaveBeenCalledWith({
        where: { portalAccountId: PORTAL_ACCOUNT_ID, revokedAt: null },
        data: { revokedAt: expect.any(Date) },
      });
    });
  });

  describe('updatePassword', () => {
    it('updates password hash and clears mustChangePass', async () => {
      prisma.portalAccount.update.mockResolvedValue({
        ...mockPortalAccount,
        mustChangePass: false,
      });
      await repo.updatePassword(PORTAL_ACCOUNT_ID, 'new-hash');
      expect(prisma.portalAccount.update).toHaveBeenCalledWith({
        where: { id: PORTAL_ACCOUNT_ID },
        data: expect.objectContaining({ passwordHash: 'new-hash', mustChangePass: false }),
      });
    });
  });
});
