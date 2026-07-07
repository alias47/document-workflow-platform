import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';

import { SystemSettingsController } from '../controllers/system-settings.controller';
import { SystemSettingsService } from '../services/system-settings.service';

import { PERMISSIONS_KEY } from '@/common/decorators/permissions.decorator';

const mockOrg = {
  id: 'org-1',
  name: 'Test Org',
  slug: 'test-org',
  contactEmail: 'admin@test.com',
  portalEnabled: true,
  uploadMaxSizeMb: 10,
  logoKey: null,
};

const serviceMock = {
  getSettings: jest.fn(),
  updateSettings: jest.fn(),
  uploadLogo: jest.fn(),
  removeLogo: jest.fn(),
};

const adminUser = {
  sub: 'staff-1',
  email: 'admin@test.com',
  organizationId: 'org-1',
  role: 'Admin',
  permissions: ['settings.manage'],
};

describe('SystemSettingsController', () => {
  let controller: SystemSettingsController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [SystemSettingsController],
      providers: [
        { provide: SystemSettingsService, useValue: serviceMock },
        { provide: Reflector, useValue: new Reflector() },
      ],
    }).compile();

    controller = module.get(SystemSettingsController);
    jest.clearAllMocks();
  });

  describe('getSettings', () => {
    it('returns settings for an admin', async () => {
      serviceMock.getSettings.mockResolvedValue(mockOrg);
      const result = await controller.getSettings(adminUser as never);
      expect(result).toEqual({ success: true, message: 'Settings retrieved', data: mockOrg });
      expect(serviceMock.getSettings).toHaveBeenCalledWith('org-1');
    });
  });

  describe('updateSettings', () => {
    it('delegates to service and returns updated settings', async () => {
      const updated = { ...mockOrg, name: 'New Name' };
      serviceMock.updateSettings.mockResolvedValue(updated);
      const result = await controller.updateSettings(adminUser as never, { name: 'New Name' });
      expect(result).toEqual({ success: true, message: 'Settings updated', data: updated });
      expect(serviceMock.updateSettings).toHaveBeenCalledWith(
        'org-1',
        { name: 'New Name' },
        'staff-1',
      );
    });
  });

  describe('uploadLogo', () => {
    it('delegates logo upload to service', async () => {
      const file: Partial<Express.Multer.File> = {
        buffer: Buffer.from('img'),
        mimetype: 'image/png',
        size: 100,
      };
      serviceMock.uploadLogo.mockResolvedValue({ ...mockOrg, logoKey: 'org/logo.png' });
      const result = await controller.uploadLogo(adminUser as never, file as Express.Multer.File);
      expect(result.data.logoKey).toBe('org/logo.png');
    });
  });

  describe('removeLogo', () => {
    it('delegates logo removal to service', async () => {
      serviceMock.removeLogo.mockResolvedValue({ ...mockOrg, logoKey: null });
      const result = await controller.removeLogo(adminUser as never);
      expect(result).toEqual({
        success: true,
        message: 'Logo removed',
        data: { ...mockOrg, logoKey: null },
      });
    });
  });

  describe('authorization', () => {
    // Sprint 12.2: settings are gated on the seeded settings.manage permission,
    // replacing the previously unreachable @Roles('super_admin').
    it('gates every route on settings.manage', () => {
      const reflector = new Reflector();
      for (const handler of [
        controller.getSettings,
        controller.updateSettings,
        controller.uploadLogo,
        controller.removeLogo,
      ]) {
        const perms = reflector.get<string[]>(PERMISSIONS_KEY, handler);
        expect(perms).toEqual(['settings.manage']);
      }
    });
  });
});
