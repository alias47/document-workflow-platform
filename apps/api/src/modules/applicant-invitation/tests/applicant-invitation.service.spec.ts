import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';

import { ApplicantInvitationRepository } from '../repositories/applicant-invitation.repository';
import { ApplicantInvitationService } from '../services/applicant-invitation.service';

import { ActivityService } from '@/modules/activity/services/activity.service';
import { AuditService } from '@/modules/audit/services/audit.service';
import { NotificationService } from '@/modules/notification/services/notification.service';
import { SystemSettingsService } from '@/modules/system-settings/services/system-settings.service';
import { PasswordService } from '@/providers/password/password.service';
import { TokenService } from '@/providers/token/token.service';

// Note: notificationService, tokenService, settingsService are intentionally used
// only for DI registration (via Test.createTestingModule providers) — their values
// are not needed in test-body assertions.

const ORG_ID = 'org-uuid';
const APPLICANT_ID = 'applicant-uuid';
const PORTAL_ACCOUNT_ID = 'portal-acc-uuid';
const STAFF_ID = 'staff-uuid';
const RAW_TOKEN = 'raw-token-hex';
const TOKEN_HASH = 'hashed-raw-token-hex';

const mockApplicant = {
  id: APPLICANT_ID,
  firstName: 'John',
  lastName: 'Smith',
  email: 'john@test.com',
};

const mockSettings = { name: 'Test Org', emailEnabled: true };

const mockInvitation = (overrides: Record<string, unknown> = {}) => ({
  id: 'inv-uuid',
  organizationId: ORG_ID,
  applicantId: APPLICANT_ID,
  portalAccountId: PORTAL_ACCOUNT_ID,
  tokenHash: TOKEN_HASH,
  expiresAt: new Date(Date.now() + 86400000 * 7),
  acceptedAt: null,
  revokedAt: null,
  createdBy: STAFF_ID,
  createdAt: new Date(),
  createdByStaff: { id: STAFF_ID, firstName: 'Jane', lastName: 'Doe' },
  applicant: mockApplicant,
  portalAccount: { id: PORTAL_ACCOUNT_ID, status: 'invitation_sent', activatedAt: null },
  ...overrides,
});

describe('ApplicantInvitationService', () => {
  let service: ApplicantInvitationService;
  let repo: jest.Mocked<ApplicantInvitationRepository>;
  let auditService: jest.Mocked<AuditService>;
  let activityService: jest.Mocked<ActivityService>;
  let passwordService: jest.Mocked<PasswordService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicantInvitationService,
        {
          provide: ApplicantInvitationRepository,
          useValue: {
            findApplicant: jest.fn(),
            findActiveByApplicant: jest.fn(),
            findLatestByApplicant: jest.fn(),
            findByTokenHash: jest.fn(),
            findOrCreatePortalAccount: jest.fn(),
            create: jest.fn(),
            markAccepted: jest.fn(),
            revokeAllActiveByApplicant: jest.fn(),
            revokeAllPortalRefreshTokens: jest.fn(),
            updatePortalAccountPassword: jest.fn(),
          },
        },
        {
          provide: NotificationService,
          useValue: { notify: jest.fn().mockResolvedValue(undefined) },
        },
        {
          provide: AuditService,
          useValue: { log: jest.fn().mockResolvedValue(undefined) },
        },
        {
          provide: ActivityService,
          useValue: { record: jest.fn().mockResolvedValue(undefined) },
        },
        {
          provide: TokenService,
          useValue: {
            hashToken: jest.fn().mockReturnValue(TOKEN_HASH),
            generateRefreshToken: jest.fn().mockReturnValue(RAW_TOKEN),
          },
        },
        {
          provide: PasswordService,
          useValue: { hash: jest.fn().mockResolvedValue('hashed-password') },
        },
        {
          provide: SystemSettingsService,
          useValue: { getSettings: jest.fn().mockResolvedValue(mockSettings) },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue({ appUrl: 'http://localhost:3000' }) },
        },
      ],
    }).compile();

    service = module.get(ApplicantInvitationService);
    repo = module.get(ApplicantInvitationRepository);
    auditService = module.get(AuditService);
    activityService = module.get(ActivityService);
    passwordService = module.get(PasswordService);
  });

  // ─── getInvitation ──────────────────────────────────────────────────────

  describe('getInvitation', () => {
    it('returns none status when no invitation exists', async () => {
      repo.findLatestByApplicant.mockResolvedValue(null);
      const result = await service.getInvitation(APPLICANT_ID, ORG_ID);
      expect(result.status).toBe('none');
      expect(result.invitedBy).toBeNull();
    });

    it('returns pending status for active invitation', async () => {
      repo.findLatestByApplicant.mockResolvedValue(mockInvitation() as never);
      const result = await service.getInvitation(APPLICANT_ID, ORG_ID);
      expect(result.status).toBe('pending');
    });

    it('returns accepted status when acceptedAt is set', async () => {
      repo.findLatestByApplicant.mockResolvedValue(
        mockInvitation({ acceptedAt: new Date() }) as never,
      );
      const result = await service.getInvitation(APPLICANT_ID, ORG_ID);
      expect(result.status).toBe('accepted');
    });

    it('returns revoked status when revokedAt is set', async () => {
      repo.findLatestByApplicant.mockResolvedValue(
        mockInvitation({ revokedAt: new Date() }) as never,
      );
      const result = await service.getInvitation(APPLICANT_ID, ORG_ID);
      expect(result.status).toBe('revoked');
    });

    it('returns expired status when expiresAt is in the past', async () => {
      repo.findLatestByApplicant.mockResolvedValue(
        mockInvitation({ expiresAt: new Date(Date.now() - 1000) }) as never,
      );
      const result = await service.getInvitation(APPLICANT_ID, ORG_ID);
      expect(result.status).toBe('expired');
    });
  });

  // ─── sendInvitation ──────────────────────────────────────────────────────

  describe('sendInvitation', () => {
    it('creates invitation and sends email', async () => {
      repo.findApplicant.mockResolvedValue(mockApplicant);
      repo.findLatestByApplicant.mockResolvedValue(null);
      repo.findActiveByApplicant.mockResolvedValue(null);
      repo.findOrCreatePortalAccount.mockResolvedValue({ id: PORTAL_ACCOUNT_ID } as never);
      repo.create.mockResolvedValue(mockInvitation() as never);

      await service.sendInvitation(APPLICANT_ID, ORG_ID, STAFF_ID);

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ applicantId: APPLICANT_ID, organizationId: ORG_ID }),
      );
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'invitation.created' }),
      );
      expect(activityService.record).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'portal.invitation_sent' }),
      );
    });

    it('throws NotFoundException when applicant not found', async () => {
      repo.findApplicant.mockResolvedValue(null);
      await expect(service.sendInvitation(APPLICANT_ID, ORG_ID, STAFF_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws BadRequestException when applicant has no email', async () => {
      repo.findApplicant.mockResolvedValue({ ...mockApplicant, email: null });
      await expect(service.sendInvitation(APPLICANT_ID, ORG_ID, STAFF_ID)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws ConflictException when portal account already activated', async () => {
      repo.findApplicant.mockResolvedValue(mockApplicant);
      repo.findLatestByApplicant.mockResolvedValue(
        mockInvitation({
          portalAccount: { id: PORTAL_ACCOUNT_ID, status: 'active', activatedAt: new Date() },
        }) as never,
      );
      await expect(service.sendInvitation(APPLICANT_ID, ORG_ID, STAFF_ID)).rejects.toThrow(
        ConflictException,
      );
    });

    it('throws ConflictException when active invitation already exists', async () => {
      repo.findApplicant.mockResolvedValue(mockApplicant);
      repo.findLatestByApplicant.mockResolvedValue(null);
      repo.findActiveByApplicant.mockResolvedValue(mockInvitation() as never);
      await expect(service.sendInvitation(APPLICANT_ID, ORG_ID, STAFF_ID)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  // ─── resendInvitation ────────────────────────────────────────────────────

  describe('resendInvitation', () => {
    it('revokes old invitation, creates new one, sends email', async () => {
      repo.findApplicant.mockResolvedValue(mockApplicant);
      repo.findLatestByApplicant.mockResolvedValue(mockInvitation() as never);
      repo.revokeAllActiveByApplicant.mockResolvedValue({ count: 1 });
      repo.findOrCreatePortalAccount.mockResolvedValue({ id: PORTAL_ACCOUNT_ID } as never);
      repo.create.mockResolvedValue(mockInvitation() as never);

      await service.resendInvitation(APPLICANT_ID, ORG_ID, STAFF_ID);

      expect(repo.revokeAllActiveByApplicant).toHaveBeenCalledWith(APPLICANT_ID, ORG_ID);
      expect(repo.create).toHaveBeenCalled();
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'invitation.resent' }),
      );
    });

    it('throws NotFoundException when no previous invitation exists', async () => {
      repo.findApplicant.mockResolvedValue(mockApplicant);
      repo.findLatestByApplicant.mockResolvedValue(null);
      await expect(service.resendInvitation(APPLICANT_ID, ORG_ID, STAFF_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ConflictException when account already activated', async () => {
      repo.findApplicant.mockResolvedValue(mockApplicant);
      repo.findLatestByApplicant.mockResolvedValue(
        mockInvitation({
          portalAccount: { id: PORTAL_ACCOUNT_ID, status: 'active', activatedAt: new Date() },
        }) as never,
      );
      await expect(service.resendInvitation(APPLICANT_ID, ORG_ID, STAFF_ID)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  // ─── revokeInvitation ────────────────────────────────────────────────────

  describe('revokeInvitation', () => {
    it('revokes active invitation and audits', async () => {
      repo.findActiveByApplicant.mockResolvedValue(mockInvitation() as never);
      repo.revokeAllActiveByApplicant.mockResolvedValue({ count: 1 });

      await service.revokeInvitation(APPLICANT_ID, ORG_ID, STAFF_ID);

      expect(repo.revokeAllActiveByApplicant).toHaveBeenCalledWith(APPLICANT_ID, ORG_ID);
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'invitation.revoked' }),
      );
    });

    it('throws NotFoundException when no active invitation exists', async () => {
      repo.findActiveByApplicant.mockResolvedValue(null);
      await expect(service.revokeInvitation(APPLICANT_ID, ORG_ID, STAFF_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── validateToken ───────────────────────────────────────────────────────

  describe('validateToken', () => {
    it('returns valid=true for a valid pending invitation', async () => {
      repo.findByTokenHash.mockResolvedValue(mockInvitation() as never);
      const result = await service.validateToken(RAW_TOKEN);
      expect(result.valid).toBe(true);
      expect(result.applicantName).toBe('John Smith');
      expect(result.organizationName).toBe('Test Org');
    });

    it('returns valid=false with reason=invalid when not found', async () => {
      repo.findByTokenHash.mockResolvedValue(null);
      const result = await service.validateToken('bad-token');
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('invalid');
    });

    it('returns valid=false with reason=revoked', async () => {
      repo.findByTokenHash.mockResolvedValue(mockInvitation({ revokedAt: new Date() }) as never);
      const result = await service.validateToken(RAW_TOKEN);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('revoked');
    });

    it('returns valid=false with reason=expired', async () => {
      repo.findByTokenHash.mockResolvedValue(
        mockInvitation({ expiresAt: new Date(Date.now() - 1000) }) as never,
      );
      const result = await service.validateToken(RAW_TOKEN);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('expired');
    });

    it('returns valid=false with reason=already_activated', async () => {
      repo.findByTokenHash.mockResolvedValue(mockInvitation({ acceptedAt: new Date() }) as never);
      const result = await service.validateToken(RAW_TOKEN);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('already_activated');
    });

    it('never returns token hash in response', async () => {
      repo.findByTokenHash.mockResolvedValue(mockInvitation() as never);
      const result = await service.validateToken(RAW_TOKEN);
      expect(JSON.stringify(result)).not.toContain(TOKEN_HASH);
      expect(JSON.stringify(result)).not.toContain(RAW_TOKEN);
    });
  });

  // ─── activateAccount ─────────────────────────────────────────────────────

  describe('activateAccount', () => {
    it('activates account, marks invitation accepted, revokes sessions', async () => {
      repo.findByTokenHash.mockResolvedValue(mockInvitation() as never);
      repo.updatePortalAccountPassword.mockResolvedValue({ id: PORTAL_ACCOUNT_ID } as never);
      repo.markAccepted.mockResolvedValue(mockInvitation({ acceptedAt: new Date() }) as never);
      repo.revokeAllActiveByApplicant.mockResolvedValue({ count: 0 });
      repo.revokeAllPortalRefreshTokens.mockResolvedValue({ count: 0 });

      await service.activateAccount(RAW_TOKEN, 'ValidPass1!');

      expect(passwordService.hash).toHaveBeenCalledWith('ValidPass1!');
      expect(repo.updatePortalAccountPassword).toHaveBeenCalledWith(
        PORTAL_ACCOUNT_ID,
        'hashed-password',
      );
      expect(repo.markAccepted).toHaveBeenCalledWith('inv-uuid');
      expect(repo.revokeAllPortalRefreshTokens).toHaveBeenCalledWith(PORTAL_ACCOUNT_ID);
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'invitation.accepted' }),
      );
      expect(activityService.record).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'portal.invitation_accepted' }),
      );
    });

    it('throws BadRequestException for invalid token', async () => {
      repo.findByTokenHash.mockResolvedValue(null);
      await expect(service.activateAccount('bad', 'ValidPass1!')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws BadRequestException for revoked invitation', async () => {
      repo.findByTokenHash.mockResolvedValue(mockInvitation({ revokedAt: new Date() }) as never);
      await expect(service.activateAccount(RAW_TOKEN, 'ValidPass1!')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws ConflictException for already-activated invitation', async () => {
      repo.findByTokenHash.mockResolvedValue(mockInvitation({ acceptedAt: new Date() }) as never);
      await expect(service.activateAccount(RAW_TOKEN, 'ValidPass1!')).rejects.toThrow(
        ConflictException,
      );
    });

    it('throws BadRequestException for expired invitation', async () => {
      repo.findByTokenHash.mockResolvedValue(
        mockInvitation({ expiresAt: new Date(Date.now() - 1000) }) as never,
      );
      await expect(service.activateAccount(RAW_TOKEN, 'ValidPass1!')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ─── Organization isolation ───────────────────────────────────────────────

  describe('organization isolation', () => {
    it('sendInvitation calls repo methods with correct organizationId', async () => {
      repo.findApplicant.mockResolvedValue(mockApplicant);
      repo.findLatestByApplicant.mockResolvedValue(null);
      repo.findActiveByApplicant.mockResolvedValue(null);
      repo.findOrCreatePortalAccount.mockResolvedValue({ id: PORTAL_ACCOUNT_ID } as never);
      repo.create.mockResolvedValue(mockInvitation() as never);

      await service.sendInvitation(APPLICANT_ID, ORG_ID, STAFF_ID);

      expect(repo.findApplicant).toHaveBeenCalledWith(APPLICANT_ID, ORG_ID);
      expect(repo.findLatestByApplicant).toHaveBeenCalledWith(APPLICANT_ID, ORG_ID);
      expect(repo.findActiveByApplicant).toHaveBeenCalledWith(APPLICANT_ID, ORG_ID);
      const createCall = repo.create.mock.calls[0]?.[0];
      expect(createCall?.organizationId).toBe(ORG_ID);
    });
  });
});
