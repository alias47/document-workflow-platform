import { forwardRef, Module } from '@nestjs/common';

import { ApplicantInvitationController } from './controllers/applicant-invitation.controller';
import { ApplicantInvitationRepository } from './repositories/applicant-invitation.repository';
import { ApplicantInvitationService } from './services/applicant-invitation.service';

import { ActivityModule } from '@/modules/activity/activity.module';
import { AuditModule } from '@/modules/audit/audit.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { NotificationModule } from '@/modules/notification/notification.module';
import { SystemSettingsModule } from '@/modules/system-settings/system-settings.module';

// PasswordService and TokenService are provided and exported by AuthModule
// (which registers JwtModule). They are consumed here via the AuthModule import
// rather than re-declared locally — a local TokenService provider cannot resolve
// JwtService because this module does not register JwtModule.
@Module({
  imports: [
    forwardRef(() => AuthModule),
    AuditModule,
    ActivityModule,
    NotificationModule,
    SystemSettingsModule,
  ],
  controllers: [ApplicantInvitationController],
  providers: [ApplicantInvitationService, ApplicantInvitationRepository],
  exports: [ApplicantInvitationService],
})
export class ApplicantInvitationModule {}
