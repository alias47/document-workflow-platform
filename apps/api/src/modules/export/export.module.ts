import { Module } from '@nestjs/common';

import { CsvProvider } from './providers/csv.provider';
import { ExcelProvider } from './providers/excel.provider';
import { PdfProvider } from './providers/pdf.provider';
import { ExportService } from './services/export.service';

@Module({
  providers: [ExportService, CsvProvider, ExcelProvider, PdfProvider],
  exports: [ExportService],
})
export class ExportModule {}
