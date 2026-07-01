import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';

import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';

import type { LoginDto } from '../dto/login.dto';
import type { Request, Response } from 'express';

import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

const mockResponse = {
  cookie: jest.fn(),
  clearCookie: jest.fn(),
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
} as unknown as Response;

const makeRequest = (cookies: Record<string, string> = {}): Request =>
  ({
    ip: '127.0.0.1',
    headers: { 'user-agent': 'jest-test-runner' },
    cookies,
  }) as unknown as Request;

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
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              if (key === 'app') return { defaultOrganizationId: 'org-uuid-default' };
              if (key === 'jwt') return { refreshExpiresIn: '7d' };
              return undefined;
            },
          },
        },
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            refresh: jest.fn(),
            logout: jest.fn(),
            logoutAll: jest.fn(),
            getMe: jest.fn(),
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

    it('sets cookies and returns staff + mustChangePassword on valid credentials', async () => {
      authService.login.mockResolvedValue(mockLoginResult);
      const req = makeRequest();

      const result = await controller.login(dto, req, mockResponse);

      expect(result.success).toBe(true);
      expect(result.data.mustChangePassword).toBe(false);
      expect(result.data.staff.id).toBe('staff-uuid');
      expect(mockResponse.cookie as jest.Mock).toHaveBeenCalledWith(
        'access_token',
        mockTokenPair.accessToken,
        expect.objectContaining({ httpOnly: true }),
      );
      expect(authService.login).toHaveBeenCalledWith(
        dto,
        expect.any(String),
        req.ip,
        req.headers['user-agent'],
      );
    });

    it('propagates UnauthorizedException from service', async () => {
      authService.login.mockRejectedValue(new UnauthorizedException('Invalid email or password'));

      await expect(controller.login(dto, makeRequest(), mockResponse)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('POST /auth/refresh', () => {
    it('rotates cookies and returns success when refresh cookie is present', async () => {
      authService.refresh.mockResolvedValue(mockTokenPair);
      const req = makeRequest({ refresh_token: 'raw-refresh-token' });

      const result = await controller.refresh(req, mockResponse);

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
      expect(authService.refresh).toHaveBeenCalledWith(
        'raw-refresh-token',
        req.ip,
        req.headers['user-agent'],
      );
      expect(mockResponse.cookie as jest.Mock).toHaveBeenCalled();
    });

    it('throws UnauthorizedException when refresh cookie is absent', async () => {
      await expect(controller.refresh(makeRequest(), mockResponse)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.refresh).not.toHaveBeenCalled();
    });

    it('propagates UnauthorizedException when token is invalid', async () => {
      authService.refresh.mockRejectedValue(
        new UnauthorizedException('Invalid or expired refresh token'),
      );

      await expect(
        controller.refresh(makeRequest({ refresh_token: 'bad-token' }), mockResponse),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('POST /auth/logout', () => {
    it('revokes token and clears cookies', async () => {
      authService.logout.mockResolvedValue();
      const req = makeRequest({ refresh_token: 'raw-token' });

      const result = await controller.logout(req, mockResponse);

      expect(result.success).toBe(true);
      expect(authService.logout).toHaveBeenCalledWith('raw-token');
      expect(mockResponse.clearCookie as jest.Mock).toHaveBeenCalled();
    });

    it('clears cookies even when no refresh token cookie is present', async () => {
      const result = await controller.logout(makeRequest(), mockResponse);

      expect(result.success).toBe(true);
      expect(authService.logout).not.toHaveBeenCalled();
      expect(mockResponse.clearCookie as jest.Mock).toHaveBeenCalled();
    });
  });

  describe('POST /auth/logout-all', () => {
    it('revokes all sessions for current user and clears cookies', async () => {
      authService.logoutAll.mockResolvedValue();
      const user = {
        sub: 'staff-uuid',
        email: 'admin@test.com',
        organizationId: 'org-uuid',
        role: 'Admin',
        permissions: [],
      };

      const result = await controller.logoutAll(user, mockResponse);

      expect(result.success).toBe(true);
      expect(authService.logoutAll).toHaveBeenCalledWith('staff-uuid');
      expect(mockResponse.clearCookie as jest.Mock).toHaveBeenCalled();
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
