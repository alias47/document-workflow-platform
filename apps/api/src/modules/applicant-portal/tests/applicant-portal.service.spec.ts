import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { ApplicantPortalService } from '../services/applicant-portal.service';

import { ApplicantRepository } from '@/modules/applicant/repositories/applicant.repository';
import { DocumentUploadService } from '@/modules/document/services/document-upload.service';
import { DocumentRequirementRepository } from '@/modules/document-requirement/repositories/document-requirement.repository';

const ORG_ID = 'org-uuid-1';
const APPLICANT_ID = 'applicant-uuid-1';
const REQUIREMENT_ID = 'req-uuid-1';

const mockApplicant = {
  id: APPLICANT_ID,
  organizationId: ORG_ID,
  applicantNumber: 'APP-2026-0001',
  firstName: 'John',
  lastName: 'Doe',
  middleName: null,
  email: 'applicant@example.com',
  phone: null,
  address: null,
  city: null,
  country: null,
  gender: null,
  dateOfBirth: null,
  nationality: null,
  status: 'active',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: null,
  updatedBy: null,
  deletedBy: null,
  assignments: [
    {
      isPrimary: true,
      staff: { id: 'staff-1', firstName: 'Jane', lastName: 'Smith' },
    },
  ],
};

const mockApplicantRequirement = {
  id: REQUIREMENT_ID,
  applicantId: APPLICANT_ID,
  requirementId: 'req-def-1',
  status: 'pending',
  assignedAt: new Date(),
  completedAt: null,
  requirement: {
    id: 'req-def-1',
    name: 'Passport',
    category: 'identity',
    isRequired: true,
    deletedAt: null,
  },
  documents: [],
};

describe('ApplicantPortalService', () => {
  let service: ApplicantPortalService;
  let applicantRepo: jest.Mocked<ApplicantRepository>;
  let requirementRepo: jest.Mocked<DocumentRequirementRepository>;
  let uploadService: jest.Mocked<DocumentUploadService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicantPortalService,
        {
          provide: ApplicantRepository,
          useValue: {
            findById: jest.fn(),
            update: jest.fn(),
          } satisfies Partial<Record<keyof ApplicantRepository, jest.Mock>>,
        },
        {
          provide: DocumentRequirementRepository,
          useValue: {
            listApplicantRequirements: jest.fn(),
            findApplicantRequirement: jest.fn(),
          } satisfies Partial<Record<keyof DocumentRequirementRepository, jest.Mock>>,
        },
        {
          provide: DocumentUploadService,
          useValue: {
            upload: jest.fn(),
          } satisfies Partial<Record<keyof DocumentUploadService, jest.Mock>>,
        },
      ],
    }).compile();

    service = module.get(ApplicantPortalService);
    applicantRepo = module.get(ApplicantRepository) as jest.Mocked<ApplicantRepository>;
    requirementRepo = module.get(
      DocumentRequirementRepository,
    ) as jest.Mocked<DocumentRequirementRepository>;
    uploadService = module.get(DocumentUploadService) as jest.Mocked<DocumentUploadService>;
  });

  describe('getDashboard', () => {
    it('returns summary with counts and primary consultant', async () => {
      applicantRepo.findById.mockResolvedValue(mockApplicant as never);
      requirementRepo.listApplicantRequirements.mockResolvedValue([
        { ...mockApplicantRequirement, status: 'approved' },
        { ...mockApplicantRequirement, status: 'pending' },
        { ...mockApplicantRequirement, status: 'uploaded' },
      ] as never);

      const result = await service.getDashboard(APPLICANT_ID, ORG_ID);

      expect(result.documentCounts.approved).toBe(1);
      expect(result.documentCounts.pending).toBe(1);
      expect(result.documentCounts.uploaded).toBe(1);
      expect(result.assignedConsultant?.firstName).toBe('Jane');
    });

    it('throws NotFoundException when applicant not found', async () => {
      applicantRepo.findById.mockResolvedValue(null);
      await expect(service.getDashboard(APPLICANT_ID, ORG_ID)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getProfile', () => {
    it('returns applicant profile with consultant', async () => {
      applicantRepo.findById.mockResolvedValue(mockApplicant as never);
      const result = await service.getProfile(APPLICANT_ID, ORG_ID);
      expect(result.firstName).toBe('John');
      expect(result.assignedConsultant?.id).toBe('staff-1');
    });
  });

  describe('updateProfile', () => {
    it('updates only editable fields', async () => {
      applicantRepo.findById.mockResolvedValue(mockApplicant as never);
      applicantRepo.update.mockResolvedValue({ ...mockApplicant, phone: '+1234567890' } as never);

      const result = await service.updateProfile(APPLICANT_ID, ORG_ID, { phone: '+1234567890' });
      expect(applicantRepo.update).toHaveBeenCalledWith(
        APPLICANT_ID,
        expect.objectContaining({ phone: '+1234567890' }),
      );
      expect(result).toBeDefined();
    });
  });

  describe('uploadDocument — ownership and status validation', () => {
    const mockFile = { buffer: Buffer.from('data') } as Express.Multer.File;

    it('throws ForbiddenException when requirement does not belong to applicant', async () => {
      requirementRepo.findApplicantRequirement.mockResolvedValue({
        ...mockApplicantRequirement,
        applicantId: 'other-applicant',
      } as never);

      await expect(
        service.uploadDocument(mockFile, APPLICANT_ID, ORG_ID, REQUIREMENT_ID),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws BadRequestException when requirement is archived', async () => {
      requirementRepo.findApplicantRequirement.mockResolvedValue({
        ...mockApplicantRequirement,
        requirement: { ...mockApplicantRequirement.requirement, deletedAt: new Date() },
      } as never);

      await expect(
        service.uploadDocument(mockFile, APPLICANT_ID, ORG_ID, REQUIREMENT_ID),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when requirement is already approved', async () => {
      requirementRepo.findApplicantRequirement.mockResolvedValue({
        ...mockApplicantRequirement,
        status: 'approved',
      } as never);

      await expect(
        service.uploadDocument(mockFile, APPLICANT_ID, ORG_ID, REQUIREMENT_ID),
      ).rejects.toThrow(BadRequestException);
    });

    it('calls uploadService.upload with correct args when valid', async () => {
      requirementRepo.findApplicantRequirement.mockResolvedValue(mockApplicantRequirement as never);
      uploadService.upload.mockResolvedValue({ id: 'doc-1' } as never);

      const result = await service.uploadDocument(mockFile, APPLICANT_ID, ORG_ID, REQUIREMENT_ID);

      expect(uploadService.upload).toHaveBeenCalledWith(
        mockFile,
        expect.objectContaining({ applicantId: APPLICANT_ID, requirementId: REQUIREMENT_ID }),
        ORG_ID,
        APPLICANT_ID,
      );
      expect(result).toEqual({ id: 'doc-1' });
    });
  });
});
