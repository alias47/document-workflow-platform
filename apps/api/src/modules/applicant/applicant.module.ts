import { Module } from '@nestjs/common';

import { ApplicantController } from './controllers/applicant.controller';
import { ApplicantRepository } from './repositories/applicant.repository';
import { ApplicantService } from './services/applicant.service';

import { ActivityModule } from '@/modules/activity/activity.module';
import { AuditModule } from '@/modules/audit/audit.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { WorkflowModule } from '@/modules/workflow/workflow.module';

@Module({
  imports: [AuthModule, AuditModule, WorkflowModule, ActivityModule],
  controllers: [ApplicantController],
  providers: [ApplicantService, ApplicantRepository],
  exports: [ApplicantService],
})
export class ApplicantModule {}
