import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { NotificationQueueService } from './notification-queue.service';
import { NotificationRepository } from '../repositories/notification.repository';
import {
  type NotificationTemplateKey,
  type TemplateVariables,
  renderTemplate,
} from '../templates/notification-templates';

import type { NotificationQueryDto } from '../dto/notification-query.dto';
import type { Notification, NotificationStatus, Prisma } from '@prisma/client';

import { APP_CONFIG_KEY, type AppConfig } from '@/config/app.config';
import { AuditService } from '@/modules/audit/services/audit.service';
import { SystemSettingsService } from '@/modules/system-settings/services/system-settings.service';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;
const MAX_RETRIES = 5;

/** Everything a business module must supply to send one notification. */
export interface NotifyInput {
  organizationId: string;
  template: NotificationTemplateKey;
  recipient: string;
  variables: TemplateVariables;
  /** Non-sensitive context stored on the record for auditing. Never secrets. */
  metadata?: Record<string, Prisma.InputJsonValue>;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * The single gateway every business module uses to send notifications
 * (Sprint 11.2 §11.2.1). Modules never touch EmailProvider or templates
 * directly. Responsibilities:
 *  - honor the org's "Email Enabled" master switch
 *  - render the template, persist an immutable record synchronously
 *  - hand delivery to the async queue (callers never wait on email)
 *  - never throw into the caller: a notification failure must not fail business.
 */
@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly notificationRepo: NotificationRepository,
    private readonly queueService: NotificationQueueService,
    private readonly settingsService: SystemSettingsService,
    private readonly auditService: AuditService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Best-effort entry point for business modules. Swallows all errors so a
   * notification problem never breaks the originating transaction.
   */
  async notify(input: NotifyInput): Promise<void> {
    try {
      await this.createAndQueue(input);
    } catch (err) {
      this.logger.error(`Failed to enqueue notification (${input.template})`, err);
    }
  }

  private async createAndQueue(input: NotifyInput): Promise<Notification | null> {
    // Respect the org-level master switch. When disabled, no record is created
    // and nothing is sent.
    const settings = await this.settingsService.getSettings(input.organizationId);
    if (!settings.emailEnabled) {
      this.logger.debug(
        `Email disabled for org ${input.organizationId}; skipping ${input.template}`,
      );
      return null;
    }

    // Validate the recipient before persisting so malformed addresses never queue.
    if (!EMAIL_PATTERN.test(input.recipient)) {
      this.logger.warn(`Invalid recipient "${input.recipient}" for ${input.template}; skipping`);
      return null;
    }

    // Enrich with common variables every template may reference. Caller-supplied
    // values win so a trigger can still override (e.g. a deep-link portalUrl).
    const appConfig = this.config.get<AppConfig>(APP_CONFIG_KEY);
    const enrichedVariables: TemplateVariables = {
      consultancyName: settings.name,
      portalUrl: appConfig?.appUrl ?? '',
      ...input.variables,
    };

    const { subject, html } = renderTemplate(input.template, enrichedVariables);

    const notification = await this.notificationRepo.create({
      organizationId: input.organizationId,
      template: input.template,
      recipient: input.recipient,
      subject,
      body: html,
      maxRetries: MAX_RETRIES,
      ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
    });

    // Async delivery — the business request does not block on this.
    this.queueService.enqueue(notification);

    return notification;
  }

  // --- Read API (Super Admin) --------------------------------------------

  async list(organizationId: string, query: NotificationQueryDto) {
    const page = query.page ?? DEFAULT_PAGE;
    const pageSize = Math.min(query.pageSize ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);

    const { rows, total } = await this.notificationRepo.list({
      organizationId,
      page,
      pageSize,
      ...(query.status !== undefined ? { status: query.status as NotificationStatus } : {}),
      ...(query.template !== undefined ? { template: query.template } : {}),
      ...(query.search !== undefined ? { search: query.search } : {}),
    });

    return {
      data: rows,
      meta: {
        page,
        pageSize,
        totalItems: total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async getById(id: string, organizationId: string): Promise<Notification> {
    const notification = await this.notificationRepo.findById(id, organizationId);
    if (!notification) throw new NotFoundException('Notification not found');
    return notification;
  }

  /**
   * Manually retry a failed notification. Increments retryCount, re-queues, and
   * audits the operation. Guards against retrying beyond the max, and against
   * re-sending an already-delivered notification (duplicate-send prevention).
   */
  async retry(id: string, organizationId: string, actorId: string): Promise<Notification> {
    const notification = await this.notificationRepo.findById(id, organizationId);
    if (!notification) throw new NotFoundException('Notification not found');

    if (notification.status === 'sent') {
      throw new ConflictException('Notification has already been sent');
    }

    if (notification.retryCount >= notification.maxRetries) {
      throw new ConflictException(
        `Notification has reached the maximum retry count of ${notification.maxRetries}`,
      );
    }

    const updated = await this.notificationRepo.incrementRetry(id);

    void this.auditService.log({
      organizationId,
      actorId,
      actorType: 'staff',
      action: 'notification.retried',
      resourceType: 'notification',
      resourceId: id,
      metadata: { retryCount: updated.retryCount },
    });

    // Re-attempt delivery asynchronously.
    this.queueService.enqueue(updated);

    return updated;
  }
}
