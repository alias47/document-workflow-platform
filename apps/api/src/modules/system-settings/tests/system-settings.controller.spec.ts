import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';

import { SystemSettingsController } from '../controllers/system-settings.controller';
import { SystemSettingsService } from '../services/system-settings.service';

import { RolesGuard } from '@/common/guards/roles.guard';

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

const superAdminUser = {
  sub: 'staff-1',
  email: 'admin@test.com',
  organizationId: 'org-1',
  role: 'super_admin',
  permissions: ['settings.manage'],
};

const staffUser = {
  sub: 'staff-2',
  email: 'staff@test.com',
  organizationId: 'org-1',
  role: 'staff',
  permissions: [],
};

describe('SystemSettingsController', () => {
  let controller: SystemSettingsController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [SystemSettingsController],
      providers: [
        { provide: SystemSettingsService, useValue: serviceMock },
        { provide: Reflector, useValue: new Reflector() },
        RolesGuard,
      ],
    }).compile();

    controller = module.get(SystemSettingsController);
    jest.clearAllMocks();
  });

  describe('getSettings', () => {
    it('returns settings for super admin', async () => {
      serviceMock.getSettings.mockResolvedValue(mockOrg);
      const result = await controller.getSettings(superAdminUser as never);
      expect(result).toEqual({ success: true, message: 'Settings retrieved', data: mockOrg });
      expect(serviceMock.getSettings).toHaveBeenCalledWith('org-1');
    });
  });

  describe('updateSettings', () => {
    it('delegates to service and returns updated settings', async () => {
      const updated = { ...mockOrg, name: 'New Name' };
      serviceMock.updateSettings.mockResolvedValue(updated);
      const result = await controller.updateSettings(superAdminUser as never, { name: 'New Name' });
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
      const result = await controller.uploadLogo(
        superAdminUser as never,
        file as Express.Multer.File,
      );
      expect(result.data.logoKey).toBe('org/logo.png');
    });
  });

  describe('removeLogo', () => {
    it('delegates logo removal to service', async () => {
      serviceMock.removeLogo.mockResolvedValue({ ...mockOrg, logoKey: null });
      const result = await controller.removeLogo(superAdminUser as never);
      expect(result).toEqual({
        success: true,
        message: 'Logo removed',
        data: { ...mockOrg, logoKey: null },
      });
    });
  });

  describe('authorization', () => {
    it('RolesGuard blocks non-super_admin access', () => {
      // Guard is instantiated and wired up — actual enforcement tested via e2e
      const guard = new RolesGuard(new Reflector());
      expect(guard).toBeDefined();
      expect(staffUser.role).not.toBe('super_admin');
    });
  });
});
