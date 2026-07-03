import { Module } from '@nestjs/common';

import { ApplicantPortalController } from './controllers/applicant-portal.controller';
import { ApplicantPortalService } from './services/applicant-portal.service';

import { ApplicantModule } from '@/modules/applicant/applicant.module';
import { ApplicantAuthModule } from '@/modules/applicant-auth/applicant-auth.module';
import { DocumentModule } from '@/modules/document/document.module';
import { DocumentRequirementModule } from '@/modules/document-requirement/document-requirement.module';

@Module({
  imports: [ApplicantAuthModule, ApplicantModule, DocumentRequirementModule, DocumentModule],
  controllers: [ApplicantPortalController],
  providers: [ApplicantPortalService],
})
export class ApplicantPortalModule {}
