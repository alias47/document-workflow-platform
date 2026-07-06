import { Module } from '@nestjs/common';

import { ReportController } from './controllers/report.controller';
import { ReportRepository } from './repositories/report.repository';
import { ReportService } from './services/report.service';

import { AuditModule } from '@/modules/audit/audit.module';
import { ExportModule } from '@/modules/export/export.module';

@Module({
  imports: [ExportModule, AuditModule],
  controllers: [ReportController],
  providers: [ReportService, ReportRepository],
})
export class ReportModule {}
