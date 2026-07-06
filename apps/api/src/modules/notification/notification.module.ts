import { forwardRef, Module } from '@nestjs/common';

import { NotificationController } from './controllers/notification.controller';
import { EMAIL_PROVIDER } from './interfaces/email-provider.interface';
import { LocalEmailProvider } from './providers/local-email.provider';
import { NotificationRepository } from './repositories/notification.repository';
import { NotificationQueueService } from './services/notification-queue.service';
import { NotificationService } from './services/notification.service';

import { AuditModule } from '@/modules/audit/audit.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { SystemSettingsModule } from '@/modules/system-settings/system-settings.module';

/**
 * Central notification module (Sprint 11.2). Owns the EmailProvider binding so
 * future transports (SMTP/SES/SendGrid) swap here only. Exports NotificationService
 * so business modules can send notifications without any email/template knowledge.
 */
@Module({
  imports: [forwardRef(() => AuthModule), AuditModule, SystemSettingsModule],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationQueueService,
    NotificationRepository,
    LocalEmailProvider,
    { provide: EMAIL_PROVIDER, useExisting: LocalEmailProvider },
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
