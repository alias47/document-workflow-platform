import { forwardRef, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { NotificationController } from './controllers/notification.controller';
import { EMAIL_PROVIDER } from './interfaces/email-provider.interface';
import { LocalEmailProvider } from './providers/local-email.provider';
import { SmtpEmailProvider } from './providers/smtp-email.provider';
import { NotificationRepository } from './repositories/notification.repository';
import { NotificationQueueService } from './services/notification-queue.service';
import { NotificationService } from './services/notification.service';

import { AuditModule } from '@/modules/audit/audit.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { SystemSettingsModule } from '@/modules/system-settings/system-settings.module';

/**
 * Central notification module. Owns the EmailProvider binding so future
 * transports (SMTP/SES/SendGrid) swap here only. When SMTP_HOST is set in env
 * the real SMTP provider is used; otherwise falls back to the local logger stub
 * for environments that don't need real email delivery.
 */
@Module({
  imports: [forwardRef(() => AuthModule), AuditModule, SystemSettingsModule],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationQueueService,
    NotificationRepository,
    LocalEmailProvider,
    SmtpEmailProvider,
    {
      provide: EMAIL_PROVIDER,
      useFactory: (config: ConfigService, smtp: SmtpEmailProvider, local: LocalEmailProvider) => {
        const host = config.get<string>('SMTP_HOST');
        if (host && host !== '') {
          return smtp;
        }
        return local;
      },
      inject: [ConfigService, SmtpEmailProvider, LocalEmailProvider],
    },
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
