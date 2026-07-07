import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';

import {
  ApplicantAuthRepository,
  type OrganizationPortalStatus,
  type PortalAccountWithApplicant,
} from '../repositories/applicant-auth.repository';
import { ApplicantJwtStrategy } from '../strategies/applicant-jwt.strategy';

import type { ApplicantJwtPayload } from '../interfaces/applicant-jwt-payload.interface';

const ORG_ID = 'org-uuid-1';
const PORTAL_ID = 'portal-uuid-1';
const APPLICANT_ID = 'applicant-uuid-1';

const payload: ApplicantJwtPayload = {
  sub: PORTAL_ID,
  applicantId: APPLICANT_ID,
  organizationId: ORG_ID,
  email: 'a@example.com',
  type: 'applicant',
};

const activeAccount: PortalAccountWithApplicant = {
  id: PORTAL_ID,
  organizationId: ORG_ID,
  applicantId: APPLICANT_ID,
  email: 'a@example.com',
  passwordHash: 'x',
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
  applicant: { id: APPLICANT_ID, firstName: 'John', lastName: 'Doe', email: 'a@example.com' },
};

const activeOrg: OrganizationPortalStatus = {
  id: ORG_ID,
  isActive: true,
  deletedAt: null,
  portalEnabled: true,
};

describe('ApplicantJwtStrategy (Sprint 12.1 per-request re-validation)', () => {
  let strategy: ApplicantJwtStrategy;
  let authRepo: jest.Mocked<ApplicantAuthRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicantJwtStrategy,
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue({ secret: 'test-secret' }) },
        },
        {
          provide: ApplicantAuthRepository,
          useValue: {
            findPortalAccountForValidation: jest.fn(),
            findOrganizationStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    strategy = module.get(ApplicantJwtStrategy);
    authRepo = module.get(ApplicantAuthRepository) as jest.Mocked<ApplicantAuthRepository>;
    authRepo.findPortalAccountForValidation.mockResolvedValue(activeAccount);
    authRepo.findOrganizationStatus.mockResolvedValue(activeOrg);
  });

  it('accepts an active, activated account in an active portal-enabled org', async () => {
    const result = await strategy.validate(payload);
    expect(result.sub).toBe(PORTAL_ID);
    expect(result.applicantId).toBe(APPLICANT_ID);
  });

  it('rejects a token that is not of applicant type', async () => {
    await expect(strategy.validate({ ...payload, type: 'staff' as never })).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rejects a deleted / non-existent portal account', async () => {
    authRepo.findPortalAccountForValidation.mockResolvedValue(null);
    await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
  });

  it('rejects a suspended account', async () => {
    authRepo.findPortalAccountForValidation.mockResolvedValue({
      ...activeAccount,
      status: 'suspended',
    });
    await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
  });

  it('rejects a not-yet-activated account', async () => {
    authRepo.findPortalAccountForValidation.mockResolvedValue({
      ...activeAccount,
      activatedAt: null,
    });
    await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
  });

  it('rejects when the organization is disabled', async () => {
    authRepo.findOrganizationStatus.mockResolvedValue({ ...activeOrg, isActive: false });
    await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
  });

  it('rejects when the applicant portal is disabled', async () => {
    authRepo.findOrganizationStatus.mockResolvedValue({ ...activeOrg, portalEnabled: false });
    await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
  });
});
