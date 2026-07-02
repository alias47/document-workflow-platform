import { NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { ACTIVITY_TYPES } from '../interfaces/activity-type';
import { ActivityRepository } from '../repositories/activity.repository';
import { ActivityService } from '../services/activity.service';

import { PrismaService } from '@/prisma/prisma.service';

const ORG = 'org-1';
const APPLICANT = 'app-1';
const STAFF = 'staff-1';

describe('ActivityService', () => {
  let service: ActivityService;
  let repo: jest.Mocked<ActivityRepository>;
  let prisma: { applicant: { findFirst: jest.Mock } };

  beforeEach(async () => {
    prisma = { applicant: { findFirst: jest.fn() } };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityService,
        {
          provide: ActivityRepository,
          useValue: { create: jest.fn(), listByApplicant: jest.fn() },
        },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(ActivityService);
    repo = module.get(ActivityRepository);
  });

  describe('record', () => {
    it('delegates to the repository', async () => {
      repo.create.mockResolvedValue({} as never);
      await service.record({
        organizationId: ORG,
        applicantId: APPLICANT,
        actorId: STAFF,
        type: ACTIVITY_TYPES.NOTE_CREATED,
        title: 'Note added',
      });
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'note.created', title: 'Note added' }),
      );
    });

    it('swallows repository errors so the main flow is never broken', async () => {
      repo.create.mockRejectedValue(new Error('db down'));
      await expect(
        service.record({
          organizationId: ORG,
          applicantId: APPLICANT,
          type: ACTIVITY_TYPES.APPLICANT_CREATED,
          title: 'Applicant created',
        }),
      ).resolves.toBeUndefined();
    });
  });

  describe('listByApplicant', () => {
    it('throws NotFoundException when applicant is outside the org', async () => {
      prisma.applicant.findFirst.mockResolvedValue(null);
      await expect(service.listByApplicant(APPLICANT, ORG, {})).rejects.toThrow(NotFoundException);
      expect(repo.listByApplicant).not.toHaveBeenCalled();
    });

    it('returns paginated data with meta when applicant belongs to the org', async () => {
      prisma.applicant.findFirst.mockResolvedValue({ id: APPLICANT });
      repo.listByApplicant.mockResolvedValue({
        rows: [{ id: 'act-1' }] as never,
        total: 21,
      });

      const result = await service.listByApplicant(APPLICANT, ORG, { page: 1, pageSize: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.meta).toEqual({ page: 1, pageSize: 20, totalItems: 21, totalPages: 2 });
    });

    it('applies default page and pageSize when omitted', async () => {
      prisma.applicant.findFirst.mockResolvedValue({ id: APPLICANT });
      repo.listByApplicant.mockResolvedValue({ rows: [], total: 0 });

      const result = await service.listByApplicant(APPLICANT, ORG, {});

      expect(repo.listByApplicant).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, pageSize: 20 }),
      );
      expect(result.meta.page).toBe(1);
      expect(result.meta.pageSize).toBe(20);
    });
  });
});
