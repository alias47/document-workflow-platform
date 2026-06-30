import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';

import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';

import type { LoginDto } from '../dto/login.dto';
import type { RefreshTokenDto } from '../dto/refresh-token.dto';
import type { Request } from 'express';

import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

const mockRequest = {
  ip: '127.0.0.1',
  headers: { 'user-agent': 'jest-test-runner' },
} as unknown as Request;

const mockTokenPair = {
  accessToken: 'access-jwt',
  refreshToken: 'refresh-raw-token',
};

const mockLoginResult = {
  tokens: mockTokenPair,
  mustChangePass: false,
  staff: {
    id: 'staff-uuid',
    email: 'admin@test.com',
    firstName: 'System',
    lastName: 'Admin',
    role: 'Admin',
    organizationId: 'org-uuid',
  },
};

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: ConfigService,
          useValue: {
            get: () => ({ defaultOrganizationId: 'org-uuid-default' }),
          },
        },
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            refresh: jest.fn(),
            logout: jest.fn(),
            logoutAll: jest.fn(),
            changePassword: jest.fn(),
            forgotPassword: jest.fn(),
            resetPassword: jest.fn(),
          } satisfies Partial<Record<keyof AuthService, jest.Mock>>,
        },
      ],
    })
      // Skip JWT guard in controller unit tests — guard logic is tested separately
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(AuthController);
    authService = module.get(AuthService) as jest.Mocked<AuthService>;
  });

  describe('POST /auth/login', () => {
    const dto: LoginDto = { email: 'admin@test.com', password: 'Password123!' };

    it('returns 200 with tokens on valid credentials', async () => {
      authService.login.mockResolvedValue(mockLoginResult);

      const result = await controller.login(dto, mockRequest);

      expect(result.success).toBe(true);
      expect(result.data.accessToken).toBe(mockTokenPair.accessToken);
      expect(result.data.refreshToken).toBe(mockTokenPair.refreshToken);
      expect(result.data.mustChangePassword).toBe(false);
      expect(authService.login).toHaveBeenCalledWith(
        dto,
        expect.any(String), // DEFAULT_ORG_ID
        mockRequest.ip,
        mockRequest.headers['user-agent'],
      );
    });

    it('propagates UnauthorizedException from service', async () => {
      authService.login.mockRejectedValue(new UnauthorizedException('Invalid email or password'));

      await expect(controller.login(dto, mockRequest)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('POST /auth/refresh', () => {
    const dto: RefreshTokenDto = { refreshToken: 'raw-refresh-token' };

    it('returns new token pair', async () => {
      authService.refresh.mockResolvedValue(mockTokenPair);

      const result = await controller.refresh(dto, mockRequest);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockTokenPair);
    });

    it('propagates UnauthorizedException when token is invalid', async () => {
      authService.refresh.mockRejectedValue(
        new UnauthorizedException('Invalid or expired refresh token'),
      );

      await expect(controller.refresh(dto, mockRequest)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('POST /auth/logout', () => {
    it('revokes token and returns success', async () => {
      authService.logout.mockResolvedValue();

      const result = await controller.logout({ refreshToken: 'raw-token' });

      expect(result.success).toBe(true);
      expect(authService.logout).toHaveBeenCalledWith('raw-token');
    });
  });

  describe('POST /auth/logout-all', () => {
    it('revokes all sessions for current user', async () => {
      authService.logoutAll.mockResolvedValue();
      const user = {
        sub: 'staff-uuid',
        email: 'admin@test.com',
        organizationId: 'org-uuid',
        role: 'Admin',
        permissions: [],
      };

      const result = await controller.logoutAll(user);

      expect(result.success).toBe(true);
      expect(authService.logoutAll).toHaveBeenCalledWith('staff-uuid');
    });
  });

  describe('POST /auth/forgot-password', () => {
    it('always returns success (no email enumeration)', async () => {
      authService.forgotPassword.mockResolvedValue();

      const result = await controller.forgotPassword({ email: 'unknown@test.com' });

      expect(result.success).toBe(true);
      expect(result.message).toContain('If the email exists');
    });
  });

  describe('POST /auth/reset-password', () => {
    it('resets password and returns success', async () => {
      authService.resetPassword.mockResolvedValue();

      const result = await controller.resetPassword({
        token: 'reset-token',
        newPassword: 'NewPass456!',
      });

      expect(result.success).toBe(true);
      expect(authService.resetPassword).toHaveBeenCalledWith('reset-token', 'NewPass456!');
    });

    it('propagates UnauthorizedException when token is invalid', async () => {
      authService.resetPassword.mockRejectedValue(
        new UnauthorizedException('Invalid or expired reset token'),
      );

      await expect(
        controller.resetPassword({ token: 'bad-token', newPassword: 'NewPass456!' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
