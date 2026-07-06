import { Test } from '@nestjs/testing';

import { NotificationRepository } from '../repositories/notification.repository';

import type { PrismaClient } from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';

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
};

const prismaMock = {
  notification: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
  },
  $transaction: jest.fn(),
};

describe('NotificationRepository', () => {
  let repo: NotificationRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        NotificationRepository,
        { provide: PrismaService, useValue: prismaMock as unknown as PrismaClient },
      ],
    }).compile();
    repo = module.get(NotificationRepository);
    jest.clearAllMocks();
  });

  it('create persists a queued notification', async () => {
    prismaMock.notification.create.mockResolvedValue(notif);
    const result = await repo.create({
      organizationId: 'org-1',
      template: 'staff_welcome',
      recipient: 'a@test.com',
      subject: 'Hi',
      body: '<p>Hi</p>',
      maxRetries: 5,
    });
    expect(result).toBe(notif);
    expect(prismaMock.notification.create).toHaveBeenCalled();
  });

  it('findById scopes by organization (isolation)', async () => {
    prismaMock.notification.findFirst.mockResolvedValue(notif);
    await repo.findById('n-1', 'org-1');
    expect(prismaMock.notification.findFirst).toHaveBeenCalledWith({
      where: { id: 'n-1', organizationId: 'org-1' },
    });
  });

  it('list applies pagination and filters', async () => {
    prismaMock.$transaction.mockResolvedValue([[notif], 1]);
    const result = await repo.list({
      organizationId: 'org-1',
      page: 2,
      pageSize: 10,
      status: 'failed',
    });
    expect(result.total).toBe(1);
    expect(result.rows).toEqual([notif]);
  });

  it('markSent sets sent status and clears error', async () => {
    prismaMock.notification.update.mockResolvedValue(notif);
    await repo.markSent('n-1');
    expect(prismaMock.notification.update).toHaveBeenCalledWith({
      where: { id: 'n-1' },
      data: expect.objectContaining({ status: 'sent', errorMessage: null }),
    });
  });

  it('markFailed records error message', async () => {
    prismaMock.notification.update.mockResolvedValue(notif);
    await repo.markFailed('n-1', 'SMTP down');
    expect(prismaMock.notification.update).toHaveBeenCalledWith({
      where: { id: 'n-1' },
      data: { status: 'failed', errorMessage: 'SMTP down' },
    });
  });

  it('incrementRetry bumps retryCount and re-queues', async () => {
    prismaMock.notification.update.mockResolvedValue({ ...notif, retryCount: 1 });
    const result = await repo.incrementRetry('n-1');
    expect(result.retryCount).toBe(1);
    expect(prismaMock.notification.update).toHaveBeenCalledWith({
      where: { id: 'n-1' },
      data: { retryCount: { increment: 1 }, status: 'queued', errorMessage: null },
    });
  });
});
