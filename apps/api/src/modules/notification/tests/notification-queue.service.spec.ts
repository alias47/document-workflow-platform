import { Test } from '@nestjs/testing';

import { EMAIL_PROVIDER } from '../interfaces/email-provider.interface';
import { NotificationRepository } from '../repositories/notification.repository';
import { NotificationQueueService } from '../services/notification-queue.service';

import type { Notification } from '@prisma/client';

const notif = {
  id: 'n-1',
  organizationId: 'org-1',
  status: 'queued',
  template: 'staff_welcome',
  recipient: 'a@test.com',
  subject: 'Hi',
  body: '<p>Hi</p>',
  retryCount: 0,
  maxRetries: 5,
} as unknown as Notification;

describe('NotificationQueueService', () => {
  let queue: NotificationQueueService;
  const repoMock = {
    markProcessing: jest.fn(),
    markSent: jest.fn(),
    markFailed: jest.fn(),
  };
  const emailMock = { send: jest.fn() };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        NotificationQueueService,
        { provide: NotificationRepository, useValue: repoMock },
        { provide: EMAIL_PROVIDER, useValue: emailMock },
      ],
    }).compile();
    queue = module.get(NotificationQueueService);
    jest.clearAllMocks();
  });

  describe('process', () => {
    it('marks processing then sent on successful delivery', async () => {
      emailMock.send.mockResolvedValue(undefined);

      const ok = await queue.process(notif);

      expect(ok).toBe(true);
      expect(repoMock.markProcessing).toHaveBeenCalledWith('n-1');
      expect(emailMock.send).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'a@test.com', subject: 'Hi' }),
      );
      expect(repoMock.markSent).toHaveBeenCalledWith('n-1');
      expect(repoMock.markFailed).not.toHaveBeenCalled();
    });

    it('records failure when the provider throws (never propagates)', async () => {
      emailMock.send.mockRejectedValue(new Error('SMTP down'));

      const ok = await queue.process(notif);

      expect(ok).toBe(false);
      expect(repoMock.markFailed).toHaveBeenCalledWith('n-1', 'SMTP down');
      expect(repoMock.markSent).not.toHaveBeenCalled();
    });
  });

  describe('enqueue', () => {
    it('schedules processing without blocking the caller', async () => {
      emailMock.send.mockResolvedValue(undefined);

      queue.enqueue(notif);
      // enqueue returns immediately; delivery runs on the next tick.
      expect(repoMock.markSent).not.toHaveBeenCalled();

      await new Promise((resolve) => setImmediate(resolve));
      expect(repoMock.markSent).toHaveBeenCalledWith('n-1');
    });
  });
});
