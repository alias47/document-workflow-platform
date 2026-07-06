import { Test, type TestingModule } from '@nestjs/testing';

import { ApplicantInvitationRepository } from '../repositories/applicant-invitation.repository';

import { PrismaService } from '@/prisma/prisma.service';

const ORG_ID = 'org-uuid';
const APPLICANT_ID = 'applicant-uuid';
const PORTAL_ACCOUNT_ID = 'portal-acc-uuid';
const STAFF_ID = 'staff-uuid';
const TOKEN_HASH = 'hashed-token';

const mockInvitation = {
  id: 'inv-uuid',
  organizationId: ORG_ID,
  applicantId: APPLICANT_ID,
  portalAccountId: PORTAL_ACCOUNT_ID,
  tokenHash: TOKEN_HASH,
  expiresAt: new Date(Date.now() + 86400000),
  acceptedAt: null,
  revokedAt: null,
  createdBy: STAFF_ID,
  createdAt: new Date(),
  createdByStaff: { id: STAFF_ID, firstName: 'Jane', lastName: 'Doe' },
  applicant: { id: APPLICANT_ID, firstName: 'John', lastName: 'Smith', email: 'john@test.com' },
  portalAccount: { id: PORTAL_ACCOUNT_ID, status: 'invitation_sent', activatedAt: null },
};

describe('ApplicantInvitationRepository', () => {
  let repo: ApplicantInvitationRepository;
  let prisma: {
    portalInvitation: {
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
    };
    portalAccount: {
      upsert: jest.Mock;
      update: jest.Mock;
    };
    portalRefreshToken: {
      updateMany: jest.Mock;
    };
    applicant: {
      findFirst: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      portalInvitation: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      portalAccount: {
        upsert: jest.fn(),
        update: jest.fn(),
      },
      portalRefreshToken: {
        updateMany: jest.fn(),
      },
      applicant: {
        findFirst: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ApplicantInvitationRepository, { provide: PrismaService, useValue: prisma }],
    }).compile();

    repo = module.get(ApplicantInvitationRepository);
  });

  describe('findActiveByApplicant', () => {
    it('returns active invitation scoped to org', async () => {
      prisma.portalInvitation.findFirst.mockResolvedValue(mockInvitation);
      const result = await repo.findActiveByApplicant(APPLICANT_ID, ORG_ID);
      expect(result).toEqual(mockInvitation);
      const { where } = prisma.portalInvitation.findFirst.mock.calls[0][0] as {
        where: Record<string, unknown>;
      };
      expect(where).toMatchObject({
        applicantId: APPLICANT_ID,
        organizationId: ORG_ID,
        revokedAt: null,
        acceptedAt: null,
      });
    });

    it('returns null when no active invitation exists', async () => {
      prisma.portalInvitation.findFirst.mockResolvedValue(null);
      const result = await repo.findActiveByApplicant(APPLICANT_ID, ORG_ID);
      expect(result).toBeNull();
    });
  });

  describe('findByTokenHash', () => {
    it('returns invitation by token hash', async () => {
      prisma.portalInvitation.findFirst.mockResolvedValue(mockInvitation);
      const result = await repo.findByTokenHash(TOKEN_HASH);
      expect(result).toEqual(mockInvitation);
      expect(prisma.portalInvitation.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tokenHash: TOKEN_HASH } }),
      );
    });
  });

  describe('create', () => {
    it('persists a new invitation', async () => {
      prisma.portalInvitation.create.mockResolvedValue(mockInvitation);
      const expiresAt = new Date(Date.now() + 86400000);
      const result = await repo.create({
        organizationId: ORG_ID,
        applicantId: APPLICANT_ID,
        portalAccountId: PORTAL_ACCOUNT_ID,
        tokenHash: TOKEN_HASH,
        expiresAt,
        createdBy: STAFF_ID,
      });
      expect(result).toEqual(mockInvitation);
    });
  });

  describe('revokeAllActiveByApplicant', () => {
    it('bulk-revokes with revokedAt timestamp', async () => {
      prisma.portalInvitation.updateMany.mockResolvedValue({ count: 1 });
      const result = await repo.revokeAllActiveByApplicant(APPLICANT_ID, ORG_ID);
      expect(result).toEqual({ count: 1 });
      const call = prisma.portalInvitation.updateMany.mock.calls[0][0] as {
        where: Record<string, unknown>;
        data: Record<string, unknown>;
      };
      expect(call.where).toMatchObject({ applicantId: APPLICANT_ID, organizationId: ORG_ID });
      expect(call.data).toHaveProperty('revokedAt');
    });
  });

  describe('markAccepted', () => {
    it('sets acceptedAt on the invitation', async () => {
      prisma.portalInvitation.update.mockResolvedValue({
        ...mockInvitation,
        acceptedAt: new Date(),
      });
      const result = await repo.markAccepted('inv-uuid');
      expect(result.acceptedAt).toBeDefined();
    });
  });

  describe('findOrCreatePortalAccount', () => {
    it('upserts portal account', async () => {
      const account = { id: PORTAL_ACCOUNT_ID, status: 'invitation_sent' };
      prisma.portalAccount.upsert.mockResolvedValue(account);
      const result = await repo.findOrCreatePortalAccount(ORG_ID, APPLICANT_ID, 'a@b.com');
      expect(result).toEqual(account);
    });
  });

  describe('findApplicant', () => {
    it('returns applicant scoped to org', async () => {
      const applicant = {
        id: APPLICANT_ID,
        firstName: 'John',
        lastName: 'Smith',
        email: 'j@test.com',
      };
      prisma.applicant.findFirst.mockResolvedValue(applicant);
      const result = await repo.findApplicant(APPLICANT_ID, ORG_ID);
      expect(result).toEqual(applicant);
    });

    it('returns null for wrong org', async () => {
      prisma.applicant.findFirst.mockResolvedValue(null);
      const result = await repo.findApplicant(APPLICANT_ID, 'other-org');
      expect(result).toBeNull();
    });
  });
});
