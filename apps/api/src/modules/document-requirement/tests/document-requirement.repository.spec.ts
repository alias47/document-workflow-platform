import { Test, type TestingModule } from '@nestjs/testing';

import { DocumentRequirementRepository } from '../repositories/document-requirement.repository';

import type { Prisma } from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';

const ORG_ID = 'org-uuid-1';
const REQ_ID = 'req-uuid-1';
const APPLICANT_ID = 'applicant-uuid-1';

const mockRequirement = {
  id: REQ_ID,
  organizationId: ORG_ID,
  name: 'Passport',
  description: null,
  category: 'identity' as const,
  isRequired: true,
  isActive: true,
  sortOrder: 0,
  createdAt: new Date(),
  createdBy: 'staff-1',
  updatedAt: new Date(),
  updatedBy: null,
  deletedAt: null,
  deletedBy: null,
  _count: { applicantRequirements: 0 },
};

const prismaMock = {
  documentRequirement: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  applicantDocumentRequirement: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    createMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
  },
};

describe('DocumentRequirementRepository', () => {
  let repo: DocumentRequirementRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocumentRequirementRepository, { provide: PrismaService, useValue: prismaMock }],
    }).compile();

    repo = module.get(DocumentRequirementRepository);

    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('returns the requirement when found', async () => {
      prismaMock.documentRequirement.findFirst.mockResolvedValue(mockRequirement);
      const result = await repo.findById(REQ_ID, ORG_ID);
      expect(result).toEqual(mockRequirement);
      expect(prismaMock.documentRequirement.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id: REQ_ID, organizationId: ORG_ID, deletedAt: null }),
        }),
      );
    });

    it('returns null when not found', async () => {
      prismaMock.documentRequirement.findFirst.mockResolvedValue(null);
      const result = await repo.findById('missing', ORG_ID);
      expect(result).toBeNull();
    });
  });

  describe('list', () => {
    it('returns paginated requirements', async () => {
      prismaMock.documentRequirement.findMany.mockResolvedValue([mockRequirement]);
      prismaMock.documentRequirement.count.mockResolvedValue(1);

      const result = await repo.list(ORG_ID, { page: 1, pageSize: 25 });
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('filters by isActive', async () => {
      prismaMock.documentRequirement.findMany.mockResolvedValue([]);
      prismaMock.documentRequirement.count.mockResolvedValue(0);

      await repo.list(ORG_ID, { page: 1, pageSize: 25, isActive: false });
      expect(prismaMock.documentRequirement.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ isActive: false }) }),
      );
    });
  });

  describe('countAssignedApplicants', () => {
    it('returns the count', async () => {
      prismaMock.applicantDocumentRequirement.count.mockResolvedValue(3);
      const count = await repo.countAssignedApplicants(REQ_ID);
      expect(count).toBe(3);
    });
  });

  describe('assignRequirementsInTransaction', () => {
    it('calls createMany with skipDuplicates', async () => {
      const createMany = jest.fn();
      const tx = {
        applicantDocumentRequirement: { createMany },
      } as unknown as Prisma.TransactionClient;
      await repo.assignRequirementsInTransaction(tx, APPLICANT_ID, ['req-1', 'req-2']);
      expect(createMany).toHaveBeenCalledWith({
        data: [
          { applicantId: APPLICANT_ID, requirementId: 'req-1' },
          { applicantId: APPLICANT_ID, requirementId: 'req-2' },
        ],
        skipDuplicates: true,
      });
    });

    it('does nothing when requirementIds is empty', async () => {
      const createMany = jest.fn();
      const tx = {
        applicantDocumentRequirement: { createMany },
      } as unknown as Prisma.TransactionClient;
      await repo.assignRequirementsInTransaction(tx, APPLICANT_ID, []);
      expect(createMany).not.toHaveBeenCalled();
    });
  });

  describe('updateApplicantRequirementStatus', () => {
    it('sets completedAt on approved', async () => {
      prismaMock.applicantDocumentRequirement.update.mockResolvedValue({
        id: 'adr-1',
        status: 'approved',
        completedAt: new Date(),
        requirement: {},
      });
      await repo.updateApplicantRequirementStatus('adr-1', 'approved');
      expect(prismaMock.applicantDocumentRequirement.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ status: 'approved' }) }),
      );
    });

    it('clears completedAt on pending', async () => {
      prismaMock.applicantDocumentRequirement.update.mockResolvedValue({
        id: 'adr-1',
        status: 'pending',
        completedAt: null,
        requirement: {},
      });
      await repo.updateApplicantRequirementStatus('adr-1', 'pending');
      expect(prismaMock.applicantDocumentRequirement.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ completedAt: null }) }),
      );
    });
  });
});
