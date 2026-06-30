import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';

import { AuthRepository, type StaffWithPermissions } from '../repositories/auth.repository';
import { AuthService } from '../services/auth.service';

import type { LoginDto } from '../dto/login.dto';

import { AuditService } from '@/modules/audit/services/audit.service';
import { EMAIL_PROVIDER } from '@/providers/email/email-provider.interface';
import { PasswordService } from '@/providers/password/password.service';
import { TokenService } from '@/providers/token/token.service';

const ORG_ID = 'org-uuid-001';
const STAFF_ID = 'staff-uuid-001';

const mockStaff: StaffWithPermissions = {
  id: STAFF_ID,
  organizationId: ORG_ID,
  email: 'admin@test.com',
  passwordHash: '$argon2id$hashed',
  firstName: 'Admin',
  lastName: 'User',
  phone: null,
  jobTitle: null,
  profileImage: null,
  status: 'active' as const,
  mustChangePass: false,
  failedAttempts: 0,
  lockedUntil: null,
  lastLoginAt: null,
  passwordChangedAt: null,
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  roleId: 'role-uuid-001',
  role: {
    name: 'Admin',
    permissions: [
      { permission: { action: 'staff.view' } },
      { permission: { action: 'staff.manage' } },
    ],
  },
};

const mockTokenPair = { accessToken: 'access-token', refreshToken: 'raw-refresh-token' };
const mockRefreshToken = {
  id: 'rt-uuid-001',
  staffId: STAFF_ID,
  tokenHash: 'hashed-token',
  expiresAt: new Date(Date.now() + 86400000),
  revokedAt: null,
  replacedBy: null,
  ipAddress: null,
  userAgent: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('AuthService', () => {
  let service: AuthService;
  let authRepo: jest.Mocked<AuthRepository>;
  let passwordService: jest.Mocked<PasswordService>;
  let tokenService: jest.Mocked<TokenService>;
  let emailProvider: { send: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AuthRepository,
          useValue: {
            findStaffByEmail: jest.fn(),
            findStaffById: jest.fn(),
            updateLastLogin: jest.fn(),
            incrementFailedAttempts: jest.fn(),
            createRefreshToken: jest.fn(),
            findRefreshToken: jest.fn(),
            revokeRefreshToken: jest.fn(),
            revokeAllStaffTokens: jest.fn(),
            updatePassword: jest.fn(),
            storePasswordResetToken: jest.fn(),
            findValidPasswordResetToken: jest.fn(),
            markPasswordResetTokenUsed: jest.fn(),
          } satisfies Partial<Record<keyof AuthRepository, jest.Mock>>,
        },
        {
          provide: PasswordService,
          useValue: {
            hash: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: TokenService,
          useValue: {
            generateAccessToken: jest.fn().mockReturnValue(mockTokenPair.accessToken),
            generateRefreshToken: jest.fn().mockReturnValue(mockTokenPair.refreshToken),
            hashToken: jest.fn().mockReturnValue('hashed-token'),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue({
              secret: 'test-secret',
              accessExpiresIn: '15m',
              refreshExpiresIn: '7d',
            }),
          },
        },
        {
          provide: AuditService,
          useValue: { log: jest.fn() },
        },
        {
          provide: EMAIL_PROVIDER,
          useValue: { send: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    authRepo = module.get(AuthRepository) as jest.Mocked<AuthRepository>;
    passwordService = module.get(PasswordService) as jest.Mocked<PasswordService>;
    tokenService = module.get(TokenService) as jest.Mocked<TokenService>;
    emailProvider = module.get(EMAIL_PROVIDER);
  });

  describe('login', () => {
    const dto: LoginDto = { email: 'admin@test.com', password: 'Password123!' };

    it('returns tokens and mustChangePass on valid credentials', async () => {
      authRepo.findStaffByEmail.mockResolvedValue(mockStaff);
      passwordService.verify.mockResolvedValue(true);
      authRepo.updateLastLogin.mockResolvedValue(mockStaff as never);
      authRepo.createRefreshToken.mockResolvedValue(mockRefreshToken as never);

      const result = await service.login(dto, ORG_ID);

      expect(result.tokens.accessToken).toBe(mockTokenPair.accessToken);
      expect(result.tokens.refreshToken).toBe(mockTokenPair.refreshToken);
      expect(result.mustChangePass).toBe(false);
      expect(authRepo.updateLastLogin).toHaveBeenCalledWith(STAFF_ID);
    });

    it('throws UnauthorizedException when staff not found', async () => {
      authRepo.findStaffByEmail.mockResolvedValue(null);

      await expect(service.login(dto, ORG_ID)).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when account is locked', async () => {
      const lockedStaff = { ...mockStaff, lockedUntil: new Date(Date.now() + 60000) };
      authRepo.findStaffByEmail.mockResolvedValue(lockedStaff as typeof mockStaff);

      await expect(service.login(dto, ORG_ID)).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when account is inactive', async () => {
      const inactiveStaff = { ...mockStaff, status: 'inactive' as const };
      authRepo.findStaffByEmail.mockResolvedValue(inactiveStaff);

      await expect(service.login(dto, ORG_ID)).rejects.toThrow(UnauthorizedException);
    });

    it('increments failed attempts and throws on wrong password', async () => {
      authRepo.findStaffByEmail.mockResolvedValue(mockStaff);
      passwordService.verify.mockResolvedValue(false);
      authRepo.incrementFailedAttempts.mockResolvedValue(mockStaff as never);

      await expect(service.login(dto, ORG_ID)).rejects.toThrow(UnauthorizedException);
      expect(authRepo.incrementFailedAttempts).toHaveBeenCalledWith(STAFF_ID, undefined);
    });

    it('sets lockUntil when reaching MAX_FAILED_ATTEMPTS', async () => {
      const almostLockedStaff = { ...mockStaff, failedAttempts: 4 };
      authRepo.findStaffByEmail.mockResolvedValue(almostLockedStaff);
      passwordService.verify.mockResolvedValue(false);
      authRepo.incrementFailedAttempts.mockResolvedValue(almostLockedStaff as never);

      await expect(service.login(dto, ORG_ID)).rejects.toThrow(UnauthorizedException);
      expect(authRepo.incrementFailedAttempts).toHaveBeenCalledWith(STAFF_ID, expect.any(Date));
    });

    it('includes permissions in JWT payload', async () => {
      authRepo.findStaffByEmail.mockResolvedValue(mockStaff);
      passwordService.verify.mockResolvedValue(true);
      authRepo.updateLastLogin.mockResolvedValue(mockStaff as never);
      authRepo.createRefreshToken.mockResolvedValue(mockRefreshToken as never);

      await service.login(dto, ORG_ID);

      expect(tokenService.generateAccessToken).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: STAFF_ID,
          email: 'admin@test.com',
          organizationId: ORG_ID,
          role: 'Admin',
          permissions: ['staff.view', 'staff.manage'],
        }),
      );
    });
  });

  describe('refresh', () => {
    it('rotates refresh token and returns new pair', async () => {
      authRepo.findRefreshToken.mockResolvedValue(mockRefreshToken as never);
      authRepo.findStaffById.mockResolvedValue(mockStaff);
      const newToken = { ...mockRefreshToken, id: 'rt-uuid-002' };
      authRepo.createRefreshToken.mockResolvedValue(newToken as never);
      authRepo.revokeRefreshToken.mockResolvedValue(mockRefreshToken as never);

      const result = await service.refresh('raw-token');

      expect(result.accessToken).toBe(mockTokenPair.accessToken);
      expect(result.refreshToken).toBe(mockTokenPair.refreshToken);
      expect(authRepo.revokeRefreshToken).toHaveBeenCalledWith(mockRefreshToken.id, newToken.id);
    });

    it('throws when token is already revoked', async () => {
      authRepo.findRefreshToken.mockResolvedValue({
        ...mockRefreshToken,
        revokedAt: new Date(),
      } as never);

      await expect(service.refresh('raw-token')).rejects.toThrow(UnauthorizedException);
    });

    it('throws when token is expired', async () => {
      authRepo.findRefreshToken.mockResolvedValue({
        ...mockRefreshToken,
        expiresAt: new Date(Date.now() - 1000),
      } as never);

      await expect(service.refresh('raw-token')).rejects.toThrow(UnauthorizedException);
    });

    it('throws when token not found', async () => {
      authRepo.findRefreshToken.mockResolvedValue(null);

      await expect(service.refresh('raw-token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('revokes the refresh token', async () => {
      authRepo.findRefreshToken.mockResolvedValue(mockRefreshToken as never);
      authRepo.revokeRefreshToken.mockResolvedValue(mockRefreshToken as never);

      await service.logout('raw-token');

      expect(authRepo.revokeRefreshToken).toHaveBeenCalledWith(mockRefreshToken.id);
    });

    it('does nothing when token not found', async () => {
      authRepo.findRefreshToken.mockResolvedValue(null);

      await expect(service.logout('raw-token')).resolves.toBeUndefined();
      expect(authRepo.revokeRefreshToken).not.toHaveBeenCalled();
    });
  });

  describe('changePassword', () => {
    it('updates password and revokes all tokens', async () => {
      authRepo.findStaffById.mockResolvedValue(mockStaff);
      passwordService.verify.mockResolvedValue(true);
      passwordService.hash.mockResolvedValue('new-hashed-password');
      authRepo.updatePassword.mockResolvedValue(mockStaff as never);
      authRepo.revokeAllStaffTokens.mockResolvedValue({ count: 1 });

      await service.changePassword(STAFF_ID, {
        currentPassword: 'OldPass123!',
        newPassword: 'NewPass456!',
      });

      expect(authRepo.updatePassword).toHaveBeenCalledWith(STAFF_ID, 'new-hashed-password');
      expect(authRepo.revokeAllStaffTokens).toHaveBeenCalledWith(STAFF_ID);
    });

    it('throws NotFoundException when staff not found', async () => {
      authRepo.findStaffById.mockResolvedValue(null);

      await expect(
        service.changePassword(STAFF_ID, {
          currentPassword: 'OldPass123!',
          newPassword: 'NewPass456!',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws UnauthorizedException on wrong current password', async () => {
      authRepo.findStaffById.mockResolvedValue(mockStaff);
      passwordService.verify.mockResolvedValue(false);

      await expect(
        service.changePassword(STAFF_ID, {
          currentPassword: 'WrongPass!',
          newPassword: 'NewPass456!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws ConflictException when new password equals current', async () => {
      authRepo.findStaffById.mockResolvedValue(mockStaff);
      passwordService.verify.mockResolvedValue(true);

      await expect(
        service.changePassword(STAFF_ID, {
          currentPassword: 'SamePass123!',
          newPassword: 'SamePass123!',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('forgotPassword', () => {
    it('sends reset email when staff found', async () => {
      authRepo.findStaffByEmail.mockResolvedValue(mockStaff);
      authRepo.storePasswordResetToken.mockResolvedValue(mockStaff as never);

      await service.forgotPassword('admin@test.com', ORG_ID);

      expect(emailProvider.send).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'admin@test.com' }),
      );
    });

    it('returns without error when staff not found (no email enumeration)', async () => {
      authRepo.findStaffByEmail.mockResolvedValue(null);

      await expect(service.forgotPassword('unknown@test.com', ORG_ID)).resolves.toBeUndefined();
      expect(emailProvider.send).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('updates password when token is valid', async () => {
      authRepo.findValidPasswordResetToken.mockResolvedValue(mockRefreshToken as never);
      passwordService.hash.mockResolvedValue('new-hashed-password');
      authRepo.findStaffById.mockResolvedValue(mockStaff);
      authRepo.updatePassword.mockResolvedValue(mockStaff as never);
      authRepo.markPasswordResetTokenUsed = jest.fn().mockResolvedValue(mockRefreshToken);
      authRepo.revokeAllStaffTokens.mockResolvedValue({ count: 1 });

      await service.resetPassword('valid-token', 'NewPass456!');

      expect(authRepo.updatePassword).toHaveBeenCalledWith(STAFF_ID, 'new-hashed-password');
      expect(authRepo.markPasswordResetTokenUsed).toHaveBeenCalledWith(mockRefreshToken.id);
    });

    it('throws UnauthorizedException when token is invalid', async () => {
      authRepo.findValidPasswordResetToken.mockResolvedValue(null);

      await expect(service.resetPassword('bad-token', 'NewPass456!')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
