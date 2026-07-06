import { Module } from '@nestjs/common';

import { DashboardController } from './controllers/dashboard.controller';
import { DashboardRepository } from './repositories/dashboard.repository';
import { DashboardService } from './services/dashboard.service';

import { ActivityModule } from '@/modules/activity/activity.module';
import { ApplicantModule } from '@/modules/applicant/applicant.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { DocumentModule } from '@/modules/document/document.module';
import { DocumentRequirementModule } from '@/modules/document-requirement/document-requirement.module';
import { StaffModule } from '@/modules/staff/staff.module';
import { WorkflowModule } from '@/modules/workflow/workflow.module';

/**
 * Dashboard aggregation layer (Sprint 11.5). Imports the domain modules whose
 * services it composes; it declares only its own lightweight aggregate
 * repository and holds no business logic of its own.
 */
@Module({
  imports: [
    AuthModule,
    ApplicantModule,
    DocumentModule,
    DocumentRequirementModule,
    WorkflowModule,
    StaffModule,
    ActivityModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService, DashboardRepository],
})
export class DashboardModule {}
