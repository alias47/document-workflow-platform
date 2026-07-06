import { Module } from '@nestjs/common';

import {
  ApplicantDocumentRequirementController,
  DocumentRequirementController,
} from './controllers/document-requirement.controller';
import { DocumentRequirementRepository } from './repositories/document-requirement.repository';
import { DocumentRequirementService } from './services/document-requirement.service';

import { ActivityModule } from '@/modules/activity/activity.module';
import { AuditModule } from '@/modules/audit/audit.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { NotificationModule } from '@/modules/notification/notification.module';

@Module({
  imports: [AuthModule, AuditModule, ActivityModule, NotificationModule],
  controllers: [DocumentRequirementController, ApplicantDocumentRequirementController],
  providers: [DocumentRequirementService, DocumentRequirementRepository],
  exports: [DocumentRequirementService, DocumentRequirementRepository],
})
export class DocumentRequirementModule {}
