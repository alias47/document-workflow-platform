import { Module } from '@nestjs/common';

import { DocumentController } from './controllers/document.controller';
import { DocumentRepository } from './repositories/document.repository';
import { DocumentService } from './services/document.service';

import { ApplicantModule } from '@/modules/applicant/applicant.module';
import { AuditModule } from '@/modules/audit/audit.module';
import { AuthModule } from '@/modules/auth/auth.module';

@Module({
  imports: [AuthModule, AuditModule, ApplicantModule],
  controllers: [DocumentController],
  providers: [DocumentService, DocumentRepository],
  exports: [DocumentService],
})
export class DocumentModule {}
