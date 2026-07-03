import { Test } from '@nestjs/testing';

import { SystemSettingsRepository } from '../repositories/system-settings.repository';

import type { PrismaClient } from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';

const mockOrg = {
  id: 'org-1',
  name: 'Test Org',
  slug: 'test-org',
  contactEmail: 'admin@test.com',
  deletedAt: null,
  logoKey: null,
  portalEnabled: true,
  uploadMaxSizeMb: 10,
};

const prismaMock = {
  organization: {
    findFirst: jest.fn(),
    update: jest.fn(),
  },
};

describe('SystemSettingsRepository', () => {
  let repo: SystemSettingsRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SystemSettingsRepository,
        { provide: PrismaService, useValue: prismaMock as unknown as PrismaClient },
      ],
    }).compile();

    repo = module.get(SystemSettingsRepository);
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('returns organization when found', async () => {
      prismaMock.organization.findFirst.mockResolvedValue(mockOrg);
      const result = await repo.findById('org-1');
      expect(result).toBe(mockOrg);
      expect(prismaMock.organization.findFirst).toHaveBeenCalledWith({
        where: { id: 'org-1', deletedAt: null },
      });
    });

    it('returns null when not found', async () => {
      prismaMock.organization.findFirst.mockResolvedValue(null);
      const result = await repo.findById('missing');
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('updates and returns organization', async () => {
      const updated = { ...mockOrg, name: 'New Name' };
      prismaMock.organization.update.mockResolvedValue(updated);
      const result = await repo.update('org-1', { name: 'New Name' });
      expect(result).toBe(updated);
      expect(prismaMock.organization.update).toHaveBeenCalledWith({
        where: { id: 'org-1' },
        data: { name: 'New Name' },
      });
    });
  });
});
