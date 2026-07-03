import { Test, type TestingModule } from '@nestjs/testing';

import {
  ApplicantDocumentRequirementController,
  DocumentRequirementController,
} from '../controllers/document-requirement.controller';
import { DocumentRequirementService } from '../services/document-requirement.service';

import type { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';

const ORG_ID = 'org-uuid-1';
const STAFF_ID = 'staff-uuid-1';
const REQ_ID = 'req-uuid-1';

const mockUser: JwtPayload = {
  sub: STAFF_ID,
  organizationId: ORG_ID,
  email: 'staff@example.com',
  role: 'admin',
  permissions: ['document.view', 'document.create', 'document.update', 'document.archive'],
};

type RequirementResult = Awaited<ReturnType<DocumentRequirementService['getById']>>;
type ApplicantReqResult = Awaited<
  ReturnType<DocumentRequirementService['updateApplicantRequirementStatus']>
>;

const mockRequirement = {
  id: REQ_ID,
  organizationId: ORG_ID,
  name: 'Passport',
  category: 'identity',
  isRequired: true,
  isActive: true,
  sortOrder: 0,
} as unknown as RequirementResult;

describe('DocumentRequirementController', () => {
  let controller: DocumentRequirementController;
  let service: jest.Mocked<DocumentRequirementService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentRequirementController],
      providers: [
        {
          provide: DocumentRequirementService,
          useValue: {
            list: jest.fn(),
            getById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            archive: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(DocumentRequirementController);
    service = module.get(DocumentRequirementService);
  });

  describe('list', () => {
    it('returns paginated requirements', async () => {
      type ListResult = Awaited<ReturnType<DocumentRequirementService['list']>>;
      service.list.mockResolvedValue({
        data: [mockRequirement],
        meta: { page: 1, pageSize: 25, totalItems: 1, totalPages: 1 },
      } as unknown as ListResult);
      const result = await controller.list(mockUser, { page: 1, pageSize: 25 });
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });
  });

  describe('getById', () => {
    it('returns a single requirement', async () => {
      service.getById.mockResolvedValue(mockRequirement);
      const result = await controller.getById(mockUser, REQ_ID);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockRequirement);
    });
  });

  describe('create', () => {
    it('creates and returns requirement', async () => {
      service.create.mockResolvedValue(mockRequirement);
      const result = await controller.create(mockUser, { name: 'Passport', category: 'identity' });
      expect(result.success).toBe(true);
      expect(service.create).toHaveBeenCalledWith(
        { name: 'Passport', category: 'identity' },
        ORG_ID,
        STAFF_ID,
      );
    });
  });

  describe('update', () => {
    it('updates and returns requirement', async () => {
      service.update.mockResolvedValue({
        ...mockRequirement,
        name: 'Updated',
      } as unknown as RequirementResult);
      const result = await controller.update(mockUser, REQ_ID, { name: 'Updated' });
      expect(result.success).toBe(true);
      expect(service.update).toHaveBeenCalledWith(REQ_ID, ORG_ID, { name: 'Updated' }, STAFF_ID);
    });
  });

  describe('archive', () => {
    it('archives requirement', async () => {
      service.archive.mockResolvedValue(undefined);
      const result = await controller.archive(mockUser, REQ_ID);
      expect(result.success).toBe(true);
      expect(service.archive).toHaveBeenCalledWith(REQ_ID, ORG_ID, STAFF_ID);
    });
  });
});

describe('ApplicantDocumentRequirementController', () => {
  let controller: ApplicantDocumentRequirementController;
  let service: jest.Mocked<DocumentRequirementService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicantDocumentRequirementController],
      providers: [
        {
          provide: DocumentRequirementService,
          useValue: {
            updateApplicantRequirementStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(ApplicantDocumentRequirementController);
    service = module.get(DocumentRequirementService);
  });

  describe('updateStatus', () => {
    it('updates status and returns result', async () => {
      service.updateApplicantRequirementStatus.mockResolvedValue({
        id: 'adr-1',
        status: 'approved',
      } as unknown as ApplicantReqResult);
      const result = await controller.updateStatus(mockUser, 'adr-1', { status: 'approved' });
      expect(result.success).toBe(true);
      expect(service.updateApplicantRequirementStatus).toHaveBeenCalledWith(
        'adr-1',
        ORG_ID,
        { status: 'approved' },
        STAFF_ID,
      );
    });
  });
});
