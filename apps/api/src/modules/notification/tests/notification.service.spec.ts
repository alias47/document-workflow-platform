import { ConflictException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';

import { NotificationRepository } from '../repositories/notification.repository';
import { NotificationQueueService } from '../services/notification-queue.service';
import { NotificationService } from '../services/notification.service';
import { NOTIFICATION_TEMPLATES } from '../templates/notification-templates';

import type { Notification } from '@prisma/client';

import { AuditService } from '@/modules/audit/services/audit.service';
import { SystemSettingsService } from '@/modules/system-settings/services/system-settings.service';

const ORG = { id: 'org-1', name: 'Acme', emailEnabled: true };

const notif = {
  id: 'n-1',
  organizationId: 'org-1',
  status: 'failed',
  template: 'staff_welcome',
  recipient: 'a@test.com',
  subject: 'Hi',
  body: '<p>Hi</p>',
  retryCount: 0,
  maxRetries: 5,
} as unknown as Notification;

describe('NotificationService', () => {
  let service: NotificationService;
  const repoMock = {
    create: jest.fn(),
    findById: jest.fn(),
    list: jest.fn(),
    incrementRetry: jest.fn(),
  };
  const queueMock = { enqueue: jest.fn() };
  const settingsMock = { getSettings: jest.fn() };
  const auditMock = { log: jest.fn() };
  const configMock = { get: jest.fn().mockReturnValue({ appUrl: 'https://app.test' }) };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: NotificationRepository, useValue: repoMock },
        { provide: NotificationQueueService, useValue: queueMock },
        { provide: SystemSettingsService, useValue: settingsMock },
        { provide: AuditService, useValue: auditMock },
        { provide: ConfigService, useValue: configMock },
      ],
    }).compile();
    service = module.get(NotificationService);
    jest.clearAllMocks();
  });

  describe('notify', () => {
    it('creates a record and enqueues delivery when email is enabled', async () => {
      settingsMock.getSettings.mockResolvedValue(ORG);
      repoMock.create.mockResolvedValue(notif);

      await service.notify({
        organizationId: 'org-1',
        template: NOTIFICATION_TEMPLATES.STAFF_WELCOME,
        recipient: 'a@test.com',
        variables: { staffName: 'Bob' },
      });

      expect(repoMock.create).toHaveBeenCalled();
      expect(queueMock.enqueue).toHaveBeenCalledWith(notif);
    });

    it('enriches variables with consultancyName and portalUrl', async () => {
      settingsMock.getSettings.mockResolvedValue(ORG);
      repoMock.create.mockResolvedValue(notif);

      await service.notify({
        organizationId: 'org-1',
        template: NOTIFICATION_TEMPLATES.STAFF_WELCOME,
        recipient: 'a@test.com',
        variables: { staffName: 'Bob' },
      });

      const createArg = repoMock.create.mock.calls[0][0];
      expect(createArg.body).toContain('Acme');
      expect(createArg.body).toContain('https://app.test');
    });

    it('skips entirely when email is disabled for the org', async () => {
      settingsMock.getSettings.mockResolvedValue({ ...ORG, emailEnabled: false });

      await service.notify({
        organizationId: 'org-1',
        template: NOTIFICATION_TEMPLATES.STAFF_WELCOME,
        recipient: 'a@test.com',
        variables: {},
      });

      expect(repoMock.create).not.toHaveBeenCalled();
      expect(queueMock.enqueue).not.toHaveBeenCalled();
    });

    it('skips invalid recipient addresses', async () => {
      settingsMock.getSettings.mockResolvedValue(ORG);

      await service.notify({
        organizationId: 'org-1',
        template: NOTIFICATION_TEMPLATES.STAFF_WELCOME,
        recipient: 'not-an-email',
        variables: {},
      });

      expect(repoMock.create).not.toHaveBeenCalled();
    });

    it('never throws into the caller when settings lookup fails', async () => {
      settingsMock.getSettings.mockRejectedValue(new Error('db down'));

      await expect(
        service.notify({
          organizationId: 'org-1',
          template: NOTIFICATION_TEMPLATES.STAFF_WELCOME,
          recipient: 'a@test.com',
          variables: {},
        }),
      ).resolves.toBeUndefined();
    });
  });

  describe('getById', () => {
    it('returns the notification when found', async () => {
      repoMock.findById.mockResolvedValue(notif);
      const result = await service.getById('n-1', 'org-1');
      expect(result).toBe(notif);
    });

    it('throws NotFoundException when missing', async () => {
      repoMock.findById.mockResolvedValue(null);
      await expect(service.getById('missing', 'org-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('retry', () => {
    it('increments retry, audits, and re-enqueues a failed notification', async () => {
      repoMock.findById.mockResolvedValue(notif);
      repoMock.incrementRetry.mockResolvedValue({ ...notif, retryCount: 1, status: 'queued' });

      const result = await service.retry('n-1', 'org-1', 'staff-1');

      expect(repoMock.incrementRetry).toHaveBeenCalledWith('n-1');
      expect(auditMock.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'notification.retried' }),
      );
      expect(queueMock.enqueue).toHaveBeenCalled();
      expect(result.retryCount).toBe(1);
    });

    it('throws NotFoundException when the notification is missing', async () => {
      repoMock.findById.mockResolvedValue(null);
      await expect(service.retry('missing', 'org-1', 'staff-1')).rejects.toThrow(NotFoundException);
    });

    it('rejects retrying an already-sent notification (duplicate-send prevention)', async () => {
      repoMock.findById.mockResolvedValue({ ...notif, status: 'sent' });
      await expect(service.retry('n-1', 'org-1', 'staff-1')).rejects.toThrow(ConflictException);
      expect(repoMock.incrementRetry).not.toHaveBeenCalled();
    });

    it('rejects retrying beyond the max retry count', async () => {
      repoMock.findById.mockResolvedValue({ ...notif, retryCount: 5, maxRetries: 5 });
      await expect(service.retry('n-1', 'org-1', 'staff-1')).rejects.toThrow(ConflictException);
      expect(repoMock.incrementRetry).not.toHaveBeenCalled();
    });
  });

  describe('list', () => {
    it('returns paginated results with meta', async () => {
      repoMock.list.mockResolvedValue({ rows: [notif], total: 1 });
      const result = await service.list('org-1', { page: 1, pageSize: 25 });
      expect(result.data).toEqual([notif]);
      expect(result.meta.totalItems).toBe(1);
    });
  });
});
