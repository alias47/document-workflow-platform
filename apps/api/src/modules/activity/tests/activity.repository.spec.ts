import { Test, type TestingModule } from '@nestjs/testing';

import { ACTIVITY_TYPES } from '../interfaces/activity-type';
import { ActivityRepository } from '../repositories/activity.repository';

import { PrismaService } from '@/prisma/prisma.service';

const ORG = 'org-uuid-1';
const APPLICANT = 'app-uuid-1';
const STAFF = 'staff-uuid-1';

const mockActivity = {
  id: 'act-1',
  organizationId: ORG,
  applicantId: APPLICANT,
  type: ACTIVITY_TYPES.DOCUMENT_UPLOADED,
  title: 'Document uploaded',
  description: 'passport.pdf',
  actorId: STAFF,
  metadata: null,
  createdAt: new Date(),
  actor: { id: STAFF, firstName: 'Jane', lastName: 'Smith' },
};

describe('ActivityRepository', () => {
  let repo: ActivityRepository;
  let prisma: {
    applicantActivity: { create: jest.Mock; findMany: jest.Mock; count: jest.Mock };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      applicantActivity: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
      // Array-form $transaction: resolve the passed operation promises together.
      $transaction: jest.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ActivityRepository, { provide: PrismaService, useValue: prisma }],
    }).compile();

    repo = module.get(ActivityRepository);
  });

  describe('create', () => {
    it('appends an activity row with actor and metadata', async () => {
      prisma.applicantActivity.create.mockResolvedValue(mockActivity);
      const result = await repo.create({
        organizationId: ORG,
        applicantId: APPLICANT,
        actorId: STAFF,
        type: ACTIVITY_TYPES.DOCUMENT_UPLOADED,
        title: 'Document uploaded',
        description: 'passport.pdf',
        metadata: { documentId: 'doc-1' },
      });
      expect(result.id).toBe('act-1');
      expect(prisma.applicantActivity.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            organizationId: ORG,
            applicantId: APPLICANT,
            type: 'document.uploaded',
            title: 'Document uploaded',
            actorId: STAFF,
          }),
        }),
      );
    });

    it('omits optional fields when not provided', async () => {
      prisma.applicantActivity.create.mockResolvedValue(mockActivity);
      await repo.create({
        organizationId: ORG,
        applicantId: APPLICANT,
        type: ACTIVITY_TYPES.APPLICANT_CREATED,
        title: 'Applicant created',
      });
      const callArg = prisma.applicantActivity.create.mock.calls[0]?.[0] as {
        data: Record<string, unknown>;
      };
      expect(callArg.data).not.toHaveProperty('description');
      expect(callArg.data).not.toHaveProperty('actorId');
      expect(callArg.data).not.toHaveProperty('metadata');
    });
  });

  describe('listByApplicant', () => {
    it('returns rows and total, newest first, scoped to org + applicant', async () => {
      prisma.applicantActivity.findMany.mockResolvedValue([mockActivity]);
      prisma.applicantActivity.count.mockResolvedValue(1);

      const result = await repo.listByApplicant({
        applicantId: APPLICANT,
        organizationId: ORG,
        page: 1,
        pageSize: 20,
      });

      expect(result.total).toBe(1);
      expect(result.rows).toHaveLength(1);
      expect(prisma.applicantActivity.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { applicantId: APPLICANT, organizationId: ORG },
          orderBy: { createdAt: 'desc' },
          skip: 0,
          take: 20,
        }),
      );
    });

    it('computes skip from page and pageSize', async () => {
      prisma.applicantActivity.findMany.mockResolvedValue([]);
      prisma.applicantActivity.count.mockResolvedValue(0);

      await repo.listByApplicant({
        applicantId: APPLICANT,
        organizationId: ORG,
        page: 3,
        pageSize: 20,
      });

      expect(prisma.applicantActivity.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 40, take: 20 }),
      );
    });
  });

  it('exposes no update or delete methods (append-only)', () => {
    const proto = repo as unknown as Record<string, unknown>;
    expect(proto['update']).toBeUndefined();
    expect(proto['delete']).toBeUndefined();
    expect(proto['softDelete']).toBeUndefined();
  });
});
