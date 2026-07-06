import { forwardRef, Module } from '@nestjs/common';

import { ApplicantInvitationController } from './controllers/applicant-invitation.controller';
import { ApplicantInvitationRepository } from './repositories/applicant-invitation.repository';
import { ApplicantInvitationService } from './services/applicant-invitation.service';

import { ActivityModule } from '@/modules/activity/activity.module';
import { AuditModule } from '@/modules/audit/audit.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { NotificationModule } from '@/modules/notification/notification.module';
import { SystemSettingsModule } from '@/modules/system-settings/system-settings.module';
import { PasswordService } from '@/providers/password/password.service';
import { TokenService } from '@/providers/token/token.service';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    AuditModule,
    ActivityModule,
    NotificationModule,
    SystemSettingsModule,
  ],
  controllers: [ApplicantInvitationController],
  providers: [
    ApplicantInvitationService,
    ApplicantInvitationRepository,
    PasswordService,
    TokenService,
  ],
  exports: [ApplicantInvitationService],
})
export class ApplicantInvitationModule {}
