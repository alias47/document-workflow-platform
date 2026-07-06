import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';

import {
  ApplicantAuthRepository,
  type PortalAccountWithApplicant,
} from '../repositories/applicant-auth.repository';
import { ApplicantAuthService } from '../services/applicant-auth.service';

import type { ApplicantLoginDto } from '../dto/applicant-login.dto';

import { AuditService } from '@/modules/audit/services/audit.service';
import { PasswordService } from '@/providers/password/password.service';
import { TokenService } from '@/providers/token/token.service';

const ORG_ID = 'org-uuid-1';
const PORTAL_ACCOUNT_ID = 'portal-uuid-1';
const APPLICANT_ID = 'applicant-uuid-1';

const mockPortalAccount: PortalAccountWithApplicant = {
  id: PORTAL_ACCOUNT_ID,
  organizationId: ORG_ID,
  applicantId: APPLICANT_ID,
  email: 'applicant@example.com',
  passwordHash: '$argon2id$hashed',
  status: 'active',
  invitationToken: null,
  invitationExpiresAt: null,
  activatedAt: new Date('2026-01-01'),
  failedAttempts: 0,
  lockedUntil: null,
  mustChangePass: false,
  passwordChangedAt: null,
  lastLoginAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  applicant: {
    id: APPLICANT_ID,
    firstName: 'John',
    lastName: 'Doe',
    email: 'applicant@example.com',
  },
};

const mockRefreshToken = {
  id: 'rt-uuid-1',
  portalAccountId: PORTAL_ACCOUNT_ID,
  tokenHash: 'hashed-token',
  expiresAt: new Date(Date.now() + 86400000),
  revokedAt: null,
  replacedBy: null,
  ipAddress: null,
  userAgent: null,
  createdAt: new Date(),
};

describe('ApplicantAuthService', () => {
  let service: ApplicantAuthService;
  let authRepo: jest.Mocked<ApplicantAuthRepository>;
  let passwordService: jest.Mocked<PasswordService>;
  let tokenService: jest.Mocked<TokenService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicantAuthService,
        {
          provide: ApplicantAuthRepository,
          useValue: {
            findPortalAccountByEmail: jest.fn(),
            findPortalAccountById: jest.fn(),
            updateLastLogin: jest.fn().mockResolvedValue(undefined),
            incrementFailedAttempts: jest.fn().mockResolvedValue(undefined),
            createRefreshToken: jest.fn().mockResolvedValue(mockRefreshToken),
            findRefreshToken: jest.fn(),
            revokeRefreshToken: jest.fn().mockResolvedValue(undefined),
            revokeAllPortalAccountTokens: jest.fn().mockResolvedValue({ count: 1 }),
            updatePassword: jest.fn().mockResolvedValue(undefined),
          } satisfies Partial<Record<keyof ApplicantAuthRepository, jest.Mock>>,
        },
        {
          provide: PasswordService,
          useValue: {
            verify: jest.fn(),
            hash: jest.fn(),
          } satisfies Partial<Record<keyof PasswordService, jest.Mock>>,
        },
        {
          provide: TokenService,
          useValue: {
            generateAccessToken: jest.fn().mockReturnValue('access-token'),
            generateRefreshToken: jest.fn().mockReturnValue('raw-refresh'),
            hashToken: jest.fn().mockReturnValue('hashed-token'),
          } satisfies Partial<Record<keyof TokenService, jest.Mock>>,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue({ refreshExpiresIn: '7d' }),
          },
        },
        {
          provide: AuditService,
          useValue: { log: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    service = module.get(ApplicantAuthService);
    authRepo = module.get(ApplicantAuthRepository) as jest.Mocked<ApplicantAuthRepository>;
    passwordService = module.get(PasswordService) as jest.Mocked<PasswordService>;
    tokenService = module.get(TokenService) as jest.Mocked<TokenService>;
  });

  describe('login', () => {
    const loginDto: ApplicantLoginDto = {
      email: 'applicant@example.com',
      password: 'Password123!',
    };

    it('returns tokens and profile on valid credentials', async () => {
      authRepo.findPortalAccountByEmail.mockResolvedValue(mockPortalAccount);
      passwordService.verify.mockResolvedValue(true);

      const result = await service.login(loginDto, ORG_ID);

      expect(result.tokens.accessToken).toBe('access-token');
      expect(result.profile.applicantId).toBe(APPLICANT_ID);
      expect(result.mustChangePass).toBe(false);
      expect(authRepo.updateLastLogin).toHaveBeenCalledWith(PORTAL_ACCOUNT_ID);
      expect(tokenService.generateAccessToken).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'applicant', applicantId: APPLICANT_ID }),
      );
    });

    it('throws UnauthorizedException when account not found', async () => {
      authRepo.findPortalAccountByEmail.mockResolvedValue(null);
      await expect(service.login(loginDto, ORG_ID)).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when account is locked', async () => {
      authRepo.findPortalAccountByEmail.mockResolvedValue({
        ...mockPortalAccount,
        lockedUntil: new Date(Date.now() + 900000),
      });
      await expect(service.login(loginDto, ORG_ID)).rejects.toThrow(/locked/i);
    });

    it('throws UnauthorizedException when account is suspended', async () => {
      authRepo.findPortalAccountByEmail.mockResolvedValue({
        ...mockPortalAccount,
        status: 'suspended',
      });
      await expect(service.login(loginDto, ORG_ID)).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when account is not activated', async () => {
      authRepo.findPortalAccountByEmail.mockResolvedValue({
        ...mockPortalAccount,
        activatedAt: null,
        passwordHash: null,
      });
      await expect(service.login(loginDto, ORG_ID)).rejects.toThrow(/not yet activated/i);
    });

    it('increments failedAttempts and throws on wrong password', async () => {
      authRepo.findPortalAccountByEmail.mockResolvedValue(mockPortalAccount);
      passwordService.verify.mockResolvedValue(false);

      await expect(service.login(loginDto, ORG_ID)).rejects.toThrow(UnauthorizedException);
      expect(authRepo.incrementFailedAttempts).toHaveBeenCalledWith(PORTAL_ACCOUNT_ID, undefined);
    });

    it('locks account after max failed attempts', async () => {
      authRepo.findPortalAccountByEmail.mockResolvedValue({
        ...mockPortalAccount,
        failedAttempts: 4,
      });
      passwordService.verify.mockResolvedValue(false);

      await expect(service.login(loginDto, ORG_ID)).rejects.toThrow(UnauthorizedException);
      expect(authRepo.incrementFailedAttempts).toHaveBeenCalledWith(
        PORTAL_ACCOUNT_ID,
        expect.any(Date),
      );
    });
  });

  describe('logout', () => {
    it('revokes the refresh token', async () => {
      authRepo.findRefreshToken.mockResolvedValue(mockRefreshToken);
      authRepo.findPortalAccountById.mockResolvedValue(mockPortalAccount);

      await service.logout('raw-refresh');
      expect(authRepo.revokeRefreshToken).toHaveBeenCalledWith(mockRefreshToken.id);
    });

    it('does nothing if token not found', async () => {
      authRepo.findRefreshToken.mockResolvedValue(null);
      await service.logout('bad-token');
      expect(authRepo.revokeRefreshToken).not.toHaveBeenCalled();
    });
  });

  describe('getMe', () => {
    it('returns profile when account found', async () => {
      authRepo.findPortalAccountById.mockResolvedValue(mockPortalAccount);
      const result = await service.getMe(PORTAL_ACCOUNT_ID);
      expect(result.applicantId).toBe(APPLICANT_ID);
      expect(result.email).toBe('applicant@example.com');
    });

    it('throws NotFoundException when not found', async () => {
      authRepo.findPortalAccountById.mockResolvedValue(null);
      await expect(service.getMe('bad')).rejects.toThrow(NotFoundException);
    });
  });

  describe('changePassword', () => {
    const changeDto = { currentPassword: 'OldPass123!', newPassword: 'NewPass456@' };

    it('changes password and revokes all tokens', async () => {
      authRepo.findPortalAccountById.mockResolvedValue(mockPortalAccount);
      passwordService.verify.mockResolvedValue(true);
      passwordService.hash.mockResolvedValue('new-hash');

      await service.changePassword(PORTAL_ACCOUNT_ID, changeDto);

      expect(authRepo.updatePassword).toHaveBeenCalledWith(PORTAL_ACCOUNT_ID, 'new-hash');
      expect(authRepo.revokeAllPortalAccountTokens).toHaveBeenCalledWith(PORTAL_ACCOUNT_ID);
    });

    it('throws UnauthorizedException if current password is wrong', async () => {
      authRepo.findPortalAccountById.mockResolvedValue(mockPortalAccount);
      passwordService.verify.mockResolvedValue(false);

      await expect(service.changePassword(PORTAL_ACCOUNT_ID, changeDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws ConflictException if new password equals current', async () => {
      authRepo.findPortalAccountById.mockResolvedValue(mockPortalAccount);
      passwordService.verify.mockResolvedValue(true);

      await expect(
        service.changePassword(PORTAL_ACCOUNT_ID, {
          currentPassword: 'Same123!',
          newPassword: 'Same123!',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });
});
