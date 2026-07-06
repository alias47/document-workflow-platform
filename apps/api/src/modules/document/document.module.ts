import { Module } from '@nestjs/common';

import { DocumentController } from './controllers/document.controller';
import { DocumentRepository } from './repositories/document.repository';
import { DocumentUploadService } from './services/document-upload.service';
import { DocumentService } from './services/document.service';
import { FileValidationService } from './services/file-validation.service';

import { ActivityModule } from '@/modules/activity/activity.module';
import { ApplicantModule } from '@/modules/applicant/applicant.module';
import { AuditModule } from '@/modules/audit/audit.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { DocumentRequirementModule } from '@/modules/document-requirement/document-requirement.module';
import { NotificationModule } from '@/modules/notification/notification.module';
import { StorageModule } from '@/modules/storage/storage.module';

@Module({
  imports: [
    AuthModule,
    AuditModule,
    ApplicantModule,
    StorageModule,
    ActivityModule,
    DocumentRequirementModule,
    NotificationModule,
  ],
  controllers: [DocumentController],
  providers: [DocumentService, DocumentUploadService, FileValidationService, DocumentRepository],
  exports: [DocumentService, DocumentUploadService],
})
export class DocumentModule {}
