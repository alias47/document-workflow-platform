import { Test, type TestingModule } from '@nestjs/testing';

import { ApplicantPortalController } from '../controllers/applicant-portal.controller';
import { ApplicantPortalService } from '../services/applicant-portal.service';

import type { ApplicantJwtPayload } from '@/modules/applicant-auth/interfaces/applicant-jwt-payload.interface';

const ORG_ID = 'org-uuid-1';
const APPLICANT_ID = 'applicant-uuid-1';
const PORTAL_ACCOUNT_ID = 'portal-uuid-1';

const mockUser: ApplicantJwtPayload = {
  sub: PORTAL_ACCOUNT_ID,
  applicantId: APPLICANT_ID,
  organizationId: ORG_ID,
  email: 'applicant@example.com',
  type: 'applicant',
};

describe('ApplicantPortalController', () => {
  let controller: ApplicantPortalController;
  let portalService: jest.Mocked<ApplicantPortalService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicantPortalController],
      providers: [
        {
          provide: ApplicantPortalService,
          useValue: {
            getDashboard: jest.fn(),
            getProfile: jest.fn(),
            updateProfile: jest.fn(),
            getDocumentRequirements: jest.fn(),
            uploadDocument: jest.fn(),
          } satisfies Partial<Record<keyof ApplicantPortalService, jest.Mock>>,
        },
      ],
    }).compile();

    controller = module.get(ApplicantPortalController);
    portalService = module.get(ApplicantPortalService) as jest.Mocked<ApplicantPortalService>;
  });

  describe('getDashboard', () => {
    it('calls service with applicantId from JWT and returns data', async () => {
      const dashboardData = { applicant: { id: APPLICANT_ID }, documentCounts: { required: 3 } };
      portalService.getDashboard.mockResolvedValue(dashboardData as never);

      const result = await controller.getDashboard(mockUser);

      expect(portalService.getDashboard).toHaveBeenCalledWith(APPLICANT_ID, ORG_ID);
      expect(result.success).toBe(true);
      expect(result.data).toBe(dashboardData);
    });
  });

  describe('getProfile', () => {
    it('calls service with applicantId from JWT', async () => {
      const profileData = { id: APPLICANT_ID, firstName: 'John' };
      portalService.getProfile.mockResolvedValue(profileData as never);

      const result = await controller.getProfile(mockUser);

      expect(portalService.getProfile).toHaveBeenCalledWith(APPLICANT_ID, ORG_ID);
      expect(result.data).toBe(profileData);
    });
  });

  describe('updateProfile', () => {
    it('calls service with only editable fields', async () => {
      const updated = { id: APPLICANT_ID, phone: '+1234567890' };
      portalService.updateProfile.mockResolvedValue(updated as never);

      const result = await controller.updateProfile(mockUser, { phone: '+1234567890' });

      expect(portalService.updateProfile).toHaveBeenCalledWith(
        APPLICANT_ID,
        ORG_ID,
        expect.objectContaining({ phone: '+1234567890' }),
      );
      expect(result.success).toBe(true);
    });
  });

  describe('getDocumentRequirements', () => {
    it('returns requirements derived from JWT — never from client input', async () => {
      const requirements = [{ id: 'req-1', status: 'pending' }];
      portalService.getDocumentRequirements.mockResolvedValue(requirements as never);

      const result = await controller.getDocumentRequirements(mockUser);

      // Applicant never supplies applicantId — it comes from JWT only.
      expect(portalService.getDocumentRequirements).toHaveBeenCalledWith(APPLICANT_ID, ORG_ID);
      expect(result.data).toBe(requirements);
    });
  });

  describe('uploadDocument', () => {
    it('calls service with applicantId from JWT', async () => {
      const doc = { id: 'doc-1' };
      portalService.uploadDocument.mockResolvedValue(doc as never);

      const mockFile = { buffer: Buffer.from('data') } as Express.Multer.File;
      const result = await controller.uploadDocument(mockUser, mockFile, 'req-uuid-1');

      expect(portalService.uploadDocument).toHaveBeenCalledWith(
        mockFile,
        APPLICANT_ID,
        ORG_ID,
        'req-uuid-1',
      );
      expect(result.success).toBe(true);
    });
  });
});
