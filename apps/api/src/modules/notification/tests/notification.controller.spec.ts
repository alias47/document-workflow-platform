import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';

import { NotificationController } from '../controllers/notification.controller';
import { NotificationService } from '../services/notification.service';

import { PERMISSIONS_KEY } from '@/common/decorators/permissions.decorator';

const notif = { id: 'n-1', organizationId: 'org-1', status: 'failed' };

const serviceMock = {
  list: jest.fn(),
  getById: jest.fn(),
  retry: jest.fn(),
};

const admin = {
  sub: 'staff-1',
  email: 'admin@test.com',
  organizationId: 'org-1',
  role: 'Admin',
  permissions: ['notification.view', 'notification.manage'],
};

describe('NotificationController', () => {
  let controller: NotificationController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [{ provide: NotificationService, useValue: serviceMock }],
    }).compile();
    controller = module.get(NotificationController);
    jest.clearAllMocks();
  });

  it('list returns paginated envelope', async () => {
    serviceMock.list.mockResolvedValue({ data: [notif], meta: { totalItems: 1 } });
    const result = await controller.list(admin as never, {});
    expect(result).toEqual(
      expect.objectContaining({ success: true, data: [notif], meta: { totalItems: 1 } }),
    );
    expect(serviceMock.list).toHaveBeenCalledWith('org-1', {});
  });

  it('getById returns the notification', async () => {
    serviceMock.getById.mockResolvedValue(notif);
    const result = await controller.getById(admin as never, 'n-1');
    expect(result).toEqual({ success: true, message: 'Notification retrieved', data: notif });
  });

  it('retry delegates to the service', async () => {
    serviceMock.retry.mockResolvedValue({ ...notif, retryCount: 1 });
    const result = await controller.retry(admin as never, 'n-1');
    expect(serviceMock.retry).toHaveBeenCalledWith('n-1', 'org-1', 'staff-1');
    expect(result.data.retryCount).toBe(1);
  });

  describe('authorization', () => {
    // Sprint 12.2: routes are gated by permissions, not the (unseeded) super_admin role.
    it('gates read routes on notification.view', () => {
      const reflector = new Reflector();
      for (const handler of [controller.list, controller.getById]) {
        const perms = reflector.get<string[]>(PERMISSIONS_KEY, handler);
        expect(perms).toEqual(['notification.view']);
      }
    });

    it('gates retry on notification.manage', () => {
      const reflector = new Reflector();
      const perms = reflector.get<string[]>(PERMISSIONS_KEY, controller.retry);
      expect(perms).toEqual(['notification.manage']);
    });
  });
});
