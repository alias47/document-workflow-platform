import { Module } from '@nestjs/common';

import { ApplicantController } from './controllers/applicant.controller';
import { ApplicantRepository } from './repositories/applicant.repository';
import { ApplicantService } from './services/applicant.service';

import { ActivityModule } from '@/modules/activity/activity.module';
import { AuditModule } from '@/modules/audit/audit.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { DocumentRequirementModule } from '@/modules/document-requirement/document-requirement.module';
import { NotificationModule } from '@/modules/notification/notification.module';
import { WorkflowModule } from '@/modules/workflow/workflow.module';

@Module({
  imports: [
    AuthModule,
    AuditModule,
    WorkflowModule,
    ActivityModule,
    DocumentRequirementModule,
    NotificationModule,
  ],
  controllers: [ApplicantController],
  providers: [ApplicantService, ApplicantRepository],
  exports: [ApplicantService, ApplicantRepository],
})
export class ApplicantModule {}
