import { Module } from '@nestjs/common';

import { WorkflowController } from './controllers/workflow.controller';
import { WorkflowRepository } from './repositories/workflow.repository';
import { WorkflowService } from './services/workflow.service';

import { ActivityModule } from '@/modules/activity/activity.module';
import { AuditModule } from '@/modules/audit/audit.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { NotificationModule } from '@/modules/notification/notification.module';

@Module({
  imports: [AuthModule, AuditModule, ActivityModule, NotificationModule],
  controllers: [WorkflowController],
  providers: [WorkflowService, WorkflowRepository],
  exports: [WorkflowService],
})
export class WorkflowModule {}
