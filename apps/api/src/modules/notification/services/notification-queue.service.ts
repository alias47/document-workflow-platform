import { Inject, Injectable, Logger } from '@nestjs/common';

import { EMAIL_PROVIDER, type EmailProvider } from '../interfaces/email-provider.interface';
import { NotificationRepository } from '../repositories/notification.repository';

import type { Notification } from '@prisma/client';

/**
 * Asynchronous notification processor (Sprint 11.2 §11.2.3).
 *
 * A notification row is persisted synchronously by NotificationService; delivery
 * is handed to this queue so the originating business request never waits on
 * email I/O. The MVP uses an in-process microtask queue (setImmediate) rather
 * than external infra — the modular-monolith rule (CLAUDE.md §3). The processing
 * contract (claim → deliver → sent | failed) is transport-agnostic, so this can
 * later back onto a real job runner without touching callers.
 */
@Injectable()
export class NotificationQueueService {
  private readonly logger = new Logger(NotificationQueueService.name);

  constructor(
    private readonly notificationRepo: NotificationRepository,
    @Inject(EMAIL_PROVIDER) private readonly emailProvider: EmailProvider,
  ) {}

  /**
   * Schedule delivery without blocking the caller. Any processing error is
   * swallowed here — it is already recorded on the notification row, and a
   * delivery failure must never surface into the business transaction.
   */
  enqueue(notification: Notification): void {
    setImmediate(() => {
      void this.process(notification).catch((err) => {
        this.logger.error(`Unhandled error processing notification ${notification.id}`, err);
      });
    });
  }

  /**
   * Deliver a single notification. Claims it (processing), attempts delivery,
   * and records the terminal state. Returns true on delivery, false on failure.
   * Safe to call directly (used by retry) — idempotency is guarded by the
   * caller only enqueuing rows that are queued/failed.
   */
  async process(notification: Notification): Promise<boolean> {
    await this.notificationRepo.markProcessing(notification.id);

    try {
      await this.emailProvider.send({
        to: notification.recipient,
        subject: notification.subject,
        html: notification.body,
      });
      await this.notificationRepo.markSent(notification.id);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown delivery error';
      await this.notificationRepo.markFailed(notification.id, message);
      this.logger.warn(`Notification ${notification.id} delivery failed: ${message}`);
      return false;
    }
  }
}
