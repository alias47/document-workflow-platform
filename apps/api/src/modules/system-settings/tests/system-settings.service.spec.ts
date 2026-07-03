import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { SystemSettingsRepository } from '../repositories/system-settings.repository';
import { SystemSettingsService } from '../services/system-settings.service';

import { ACTIVITY_TYPES } from '@/modules/activity/interfaces/activity-type';
import { AuditService } from '@/modules/audit/services/audit.service';
import {
  STORAGE_PROVIDER,
  type StorageProvider,
} from '@/modules/storage/interfaces/storage-provider.interface';

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

const repoMock = {
  findById: jest.fn(),
  update: jest.fn(),
};

const auditMock = { log: jest.fn() };

const storageMock: jest.Mocked<StorageProvider> = {
  upload: jest.fn(),
  download: jest.fn(),
  delete: jest.fn(),
  exists: jest.fn(),
};

describe('SystemSettingsService', () => {
  let service: SystemSettingsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SystemSettingsService,
        { provide: SystemSettingsRepository, useValue: repoMock },
        { provide: AuditService, useValue: auditMock },
        { provide: STORAGE_PROVIDER, useValue: storageMock },
      ],
    }).compile();

    service = module.get(SystemSettingsService);
    jest.clearAllMocks();
  });

  describe('getSettings', () => {
    it('returns organization settings', async () => {
      repoMock.findById.mockResolvedValue(mockOrg);
      const result = await service.getSettings('org-1');
      expect(result).toBe(mockOrg);
    });

    it('throws NotFoundException when org missing', async () => {
      repoMock.findById.mockResolvedValue(null);
      await expect(service.getSettings('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateSettings', () => {
    it('updates settings and writes audit log', async () => {
      const updated = { ...mockOrg, name: 'New Name' };
      repoMock.findById.mockResolvedValue(mockOrg);
      repoMock.update.mockResolvedValue(updated);
      auditMock.log.mockResolvedValue(undefined);

      const result = await service.updateSettings('org-1', { name: 'New Name' }, 'staff-1');
      expect(result).toBe(updated);
      // Audit log is fired asynchronously
      await Promise.resolve();
      expect(auditMock.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: ACTIVITY_TYPES.SETTINGS_UPDATED }),
      );
    });

    it('throws NotFoundException when org missing', async () => {
      repoMock.findById.mockResolvedValue(null);
      await expect(service.updateSettings('missing', {}, 'staff-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('uploadLogo', () => {
    const validFile: Express.Multer.File = {
      fieldname: 'logo',
      originalname: 'logo.png',
      encoding: '7bit',
      mimetype: 'image/png',
      buffer: Buffer.from('fake-image-data'),
      size: 100,
      stream: null as never,
      destination: '',
      filename: '',
      path: '',
    };

    it('uploads logo and updates org', async () => {
      repoMock.findById.mockResolvedValue(mockOrg);
      storageMock.upload.mockResolvedValue({ storageKey: 'org/branding/logo.png' });
      repoMock.update.mockResolvedValue({ ...mockOrg, logoKey: 'org/branding/logo.png' });
      auditMock.log.mockResolvedValue(undefined);

      const result = await service.uploadLogo('org-1', validFile, 'staff-1');
      expect(storageMock.upload).toHaveBeenCalled();
      expect(repoMock.update).toHaveBeenCalledWith('org-1', {
        logoKey: 'org/branding/logo.png',
      });
      expect(result.logoKey).toBe('org/branding/logo.png');
    });

    it('deletes old logo before persisting new key', async () => {
      const orgWithLogo = { ...mockOrg, logoKey: 'old/logo.png' };
      repoMock.findById.mockResolvedValue(orgWithLogo);
      storageMock.upload.mockResolvedValue({ storageKey: 'new/logo.png' });
      storageMock.delete.mockResolvedValue(undefined);
      repoMock.update.mockResolvedValue({ ...orgWithLogo, logoKey: 'new/logo.png' });
      auditMock.log.mockResolvedValue(undefined);

      await service.uploadLogo('org-1', validFile, 'staff-1');
      expect(storageMock.delete).toHaveBeenCalledWith('old/logo.png');
    });

    it('throws BadRequestException when no file provided', async () => {
      await expect(service.uploadLogo('org-1', undefined, 'staff-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws BadRequestException for unsupported mime type', async () => {
      const badFile = { ...validFile, mimetype: 'image/gif' };
      await expect(service.uploadLogo('org-1', badFile, 'staff-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws BadRequestException when file exceeds 5 MB', async () => {
      const bigFile = { ...validFile, size: 6 * 1024 * 1024 };
      await expect(service.uploadLogo('org-1', bigFile, 'staff-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('removeLogo', () => {
    it('deletes the physical file and clears logoKey', async () => {
      const orgWithLogo = { ...mockOrg, logoKey: 'org/branding/logo.png' };
      repoMock.findById.mockResolvedValue(orgWithLogo);
      storageMock.delete.mockResolvedValue(undefined);
      repoMock.update.mockResolvedValue({ ...mockOrg, logoKey: null });
      auditMock.log.mockResolvedValue(undefined);

      const result = await service.removeLogo('org-1', 'staff-1');
      expect(storageMock.delete).toHaveBeenCalledWith('org/branding/logo.png');
      expect(repoMock.update).toHaveBeenCalledWith('org-1', { logoKey: null });
      expect(result.logoKey).toBeNull();
    });

    it('succeeds even when no logo was set', async () => {
      repoMock.findById.mockResolvedValue(mockOrg);
      repoMock.update.mockResolvedValue(mockOrg);
      auditMock.log.mockResolvedValue(undefined);

      await service.removeLogo('org-1', 'staff-1');
      expect(storageMock.delete).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when org missing', async () => {
      repoMock.findById.mockResolvedValue(null);
      await expect(service.removeLogo('missing', 'staff-1')).rejects.toThrow(NotFoundException);
    });
  });
});
