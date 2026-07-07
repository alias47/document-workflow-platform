import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, type TestingModule } from '@nestjs/testing';

import { ApplicantInvitationController } from '../controllers/applicant-invitation.controller';
import { ApplicantInvitationService } from '../services/applicant-invitation.service';

import { PERMISSIONS_KEY } from '@/common/decorators/permissions.decorator';
import { IS_PUBLIC_KEY } from '@/common/decorators/public.decorator';

const ORG_ID = 'org-uuid';
const APPLICANT_ID = 'applicant-uuid';
const STAFF_ID = 'staff-uuid';

const mockUser = {
  sub: STAFF_ID,
  organizationId: ORG_ID,
  role: 'staff',
  email: 'staff@org.com',
  permissions: [],
};

describe('ApplicantInvitationController', () => {
  let controller: ApplicantInvitationController;
  let service: jest.Mocked<ApplicantInvitationService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicantInvitationController],
      providers: [
        {
          provide: ApplicantInvitationService,
          useValue: {
            getInvitation: jest.fn(),
            sendInvitation: jest.fn(),
            resendInvitation: jest.fn(),
            revokeInvitation: jest.fn(),
            validateToken: jest.fn(),
            activateAccount: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(ApplicantInvitationController);
    service = module.get(ApplicantInvitationService);
  });

  describe('getInvitation', () => {
    it('returns invitation data', async () => {
      const invData = {
        status: 'pending',
        expiresAt: new Date().toISOString(),
        acceptedAt: null,
        invitedBy: null,
        createdAt: null,
        portalAccountExists: true,
        portalAccountActivated: false,
      };
      service.getInvitation.mockResolvedValue(invData as never);
      const result = await controller.getInvitation(APPLICANT_ID, mockUser as never);
      expect(result).toEqual({ success: true, message: 'Invitation retrieved', data: invData });
      expect(service.getInvitation).toHaveBeenCalledWith(APPLICANT_ID, ORG_ID);
    });
  });

  describe('sendInvitation', () => {
    it('returns success on send', async () => {
      service.sendInvitation.mockResolvedValue(undefined);
      const result = await controller.sendInvitation(APPLICANT_ID, mockUser as never);
      expect(result).toEqual({ success: true, message: 'Invitation sent', data: null });
      expect(service.sendInvitation).toHaveBeenCalledWith(APPLICANT_ID, ORG_ID, STAFF_ID);
    });

    it('propagates NotFoundException from service', async () => {
      service.sendInvitation.mockRejectedValue(new NotFoundException());
      await expect(controller.sendInvitation(APPLICANT_ID, mockUser as never)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('propagates ConflictException for duplicate invite', async () => {
      service.sendInvitation.mockRejectedValue(new ConflictException());
      await expect(controller.sendInvitation(APPLICANT_ID, mockUser as never)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('resendInvitation', () => {
    it('returns success on resend', async () => {
      service.resendInvitation.mockResolvedValue(undefined);
      const result = await controller.resendInvitation(APPLICANT_ID, mockUser as never);
      expect(result).toEqual({ success: true, message: 'Invitation resent', data: null });
    });
  });

  describe('revokeInvitation', () => {
    it('returns success on revoke', async () => {
      service.revokeInvitation.mockResolvedValue(undefined);
      const result = await controller.revokeInvitation(APPLICANT_ID, mockUser as never);
      expect(result).toEqual({ success: true, message: 'Invitation revoked', data: null });
    });

    it('propagates NotFoundException when no active invitation', async () => {
      service.revokeInvitation.mockRejectedValue(new NotFoundException());
      await expect(controller.revokeInvitation(APPLICANT_ID, mockUser as never)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('validateToken', () => {
    it('returns valid token response', async () => {
      const tokenData = {
        valid: true,
        reason: null,
        applicantName: 'John Smith',
        organizationName: 'Test Org',
      };
      service.validateToken.mockResolvedValue(tokenData);
      const result = await controller.validateToken('some-token');
      expect(result.data).toEqual(tokenData);
      expect(service.validateToken).toHaveBeenCalledWith('some-token');
    });

    it('returns invalid response for bad token', async () => {
      const tokenData = {
        valid: false,
        reason: 'expired',
        applicantName: null,
        organizationName: null,
      };
      service.validateToken.mockResolvedValue(tokenData);
      const result = await controller.validateToken('expired-token');
      expect(result.data.valid).toBe(false);
      expect(result.data.reason).toBe('expired');
    });

    it('passes empty string when token query param is missing', async () => {
      service.validateToken.mockResolvedValue({
        valid: false,
        reason: 'invalid',
        applicantName: null,
        organizationName: null,
      });
      await controller.validateToken(undefined as unknown as string);
      expect(service.validateToken).toHaveBeenCalledWith('');
    });
  });

  describe('activateAccount', () => {
    it('returns success on activation', async () => {
      service.activateAccount.mockResolvedValue(undefined);
      const result = await controller.activateAccount({ token: 'tok', password: 'ValidPass1!' });
      expect(result).toEqual({
        success: true,
        message: 'Account activated successfully',
        data: null,
      });
    });

    it('propagates BadRequestException for invalid token', async () => {
      service.activateAccount.mockRejectedValue(new BadRequestException());
      await expect(
        controller.activateAccount({ token: 'bad', password: 'ValidPass1!' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('propagates ConflictException for already-activated account', async () => {
      service.activateAccount.mockRejectedValue(new ConflictException());
      await expect(
        controller.activateAccount({ token: 'tok', password: 'ValidPass1!' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  // Sprint 12.2: the four staff invitation endpoints previously had guards but no
  // permission metadata, making them reachable by any authenticated staff. They
  // are now explicitly gated; the two applicant activation routes stay public.
  describe('authorization', () => {
    const reflector = new Reflector();

    it('gates read of invitation status on applicant.view', () => {
      expect(reflector.get<string[]>(PERMISSIONS_KEY, controller.getInvitation)).toEqual([
        'applicant.view',
      ]);
    });

    it('gates send/resend/revoke on applicant.update', () => {
      for (const handler of [
        controller.sendInvitation,
        controller.resendInvitation,
        controller.revokeInvitation,
      ]) {
        expect(reflector.get<string[]>(PERMISSIONS_KEY, handler)).toEqual(['applicant.update']);
      }
    });

    it('leaves the public activation routes ungated by permissions and marked public', () => {
      for (const handler of [controller.validateToken, controller.activateAccount]) {
        expect(reflector.get<string[]>(PERMISSIONS_KEY, handler)).toBeUndefined();
        expect(reflector.get<boolean>(IS_PUBLIC_KEY, handler)).toBe(true);
      }
    });
  });
});
