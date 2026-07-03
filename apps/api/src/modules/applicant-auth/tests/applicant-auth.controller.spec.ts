import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';

import { ApplicantAuthController } from '../controllers/applicant-auth.controller';
import { ApplicantAuthService } from '../services/applicant-auth.service';

import type { ApplicantJwtPayload } from '../interfaces/applicant-jwt-payload.interface';
import type { Request, Response } from 'express';

const ORG_ID = 'org-uuid-1';
const APPLICANT_ID = 'applicant-uuid-1';
const PORTAL_ACCOUNT_ID = 'portal-uuid-1';

const mockProfile = {
  portalAccountId: PORTAL_ACCOUNT_ID,
  applicantId: APPLICANT_ID,
  email: 'applicant@example.com',
  organizationId: ORG_ID,
  firstName: 'John',
  lastName: 'Doe',
  mustChangePass: false,
};

const mockUser: ApplicantJwtPayload = {
  sub: PORTAL_ACCOUNT_ID,
  applicantId: APPLICANT_ID,
  organizationId: ORG_ID,
  email: 'applicant@example.com',
  type: 'applicant',
};

function makeRes(): Response {
  return {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as unknown as Response;
}

function makeReq(cookies: Record<string, string> = {}): Request {
  return {
    cookies,
    ip: '127.0.0.1',
    headers: { 'user-agent': 'jest' },
  } as unknown as Request;
}

describe('ApplicantAuthController', () => {
  let controller: ApplicantAuthController;
  let authService: jest.Mocked<ApplicantAuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicantAuthController],
      providers: [
        {
          provide: ApplicantAuthService,
          useValue: {
            login: jest.fn(),
            refresh: jest.fn(),
            logout: jest.fn(),
            getMe: jest.fn(),
            changePassword: jest.fn(),
          } satisfies Partial<Record<keyof ApplicantAuthService, jest.Mock>>,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              if (key === 'app') return { defaultOrganizationId: ORG_ID };
              if (key === 'jwt') return { refreshExpiresIn: '7d' };
              return null;
            }),
          },
        },
      ],
    }).compile();

    controller = module.get(ApplicantAuthController);
    authService = module.get(ApplicantAuthService) as jest.Mocked<ApplicantAuthService>;
  });

  describe('login', () => {
    it('sets cookies and returns profile on success', async () => {
      authService.login.mockResolvedValue({
        tokens: { accessToken: 'at', refreshToken: 'rt' },
        mustChangePass: false,
        profile: mockProfile,
      });

      const res = makeRes();
      const result = await controller.login(
        { email: 'applicant@example.com', password: 'Pass123!' },
        makeReq(),
        res,
      );

      expect(res.cookie).toHaveBeenCalledWith('applicant_access_token', 'at', expect.any(Object));
      expect(res.cookie).toHaveBeenCalledWith('applicant_refresh_token', 'rt', expect.any(Object));
      expect(result.success).toBe(true);
      expect(result.data.profile.applicantId).toBe(APPLICANT_ID);
    });
  });

  describe('refresh', () => {
    it('rotates tokens from cookie', async () => {
      authService.refresh.mockResolvedValue({ accessToken: 'new-at', refreshToken: 'new-rt' });
      const res = makeRes();
      const result = await controller.refresh(makeReq({ applicant_refresh_token: 'raw-rt' }), res);
      expect(result.success).toBe(true);
      expect(res.cookie).toHaveBeenCalledTimes(2);
    });

    it('throws UnauthorizedException when no refresh cookie', async () => {
      await expect(controller.refresh(makeReq(), makeRes())).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('revokes token from cookie and clears cookies', async () => {
      authService.logout.mockResolvedValue(undefined);
      const res = makeRes();
      const result = await controller.logout(makeReq({ applicant_refresh_token: 'raw-rt' }), res);
      expect(authService.logout).toHaveBeenCalledWith('raw-rt');
      expect(res.clearCookie).toHaveBeenCalledTimes(2);
      expect(result.success).toBe(true);
    });
  });

  describe('me', () => {
    it('returns authenticated applicant profile', async () => {
      authService.getMe.mockResolvedValue(mockProfile);
      const result = await controller.me(mockUser);
      expect(result.data.applicantId).toBe(APPLICANT_ID);
      expect(authService.getMe).toHaveBeenCalledWith(PORTAL_ACCOUNT_ID);
    });
  });

  describe('changePassword', () => {
    it('changes password and clears cookies', async () => {
      authService.changePassword.mockResolvedValue(undefined);
      const res = makeRes();
      const result = await controller.changePassword(
        mockUser,
        { currentPassword: 'Old123!', newPassword: 'New456@Abc' },
        res,
      );
      expect(result.success).toBe(true);
      expect(res.clearCookie).toHaveBeenCalledTimes(2);
    });
  });
});
