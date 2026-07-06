import { BadRequestException, Injectable } from '@nestjs/common';

import { CsvProvider } from '../providers/csv.provider';
import { ExcelProvider } from '../providers/excel.provider';
import { PdfProvider } from '../providers/pdf.provider';

import type {
  ExportFormat,
  ExportOptions,
  ExportResult,
} from '../interfaces/export-provider.interface';

export const EXPORT_MAX_ROWS = 10_000;

@Injectable()
export class ExportService {
  constructor(
    private readonly csvProvider: CsvProvider,
    private readonly excelProvider: ExcelProvider,
    private readonly pdfProvider: PdfProvider,
  ) {}

  async generate(format: ExportFormat, options: ExportOptions): Promise<ExportResult> {
    this.validateFormat(format);

    if (options.rows.length > EXPORT_MAX_ROWS) {
      throw new BadRequestException(
        `Export exceeds the maximum of ${EXPORT_MAX_ROWS.toLocaleString()} rows. Apply filters to reduce the result set.`,
      );
    }

    switch (format) {
      case 'csv':
        return this.csvProvider.generate(options);
      case 'xlsx':
        return this.excelProvider.generate(options);
      case 'pdf':
        return this.pdfProvider.generate(options);
    }
  }

  validateFormat(format: string): asserts format is ExportFormat {
    const valid: ExportFormat[] = ['csv', 'xlsx', 'pdf'];
    if (!valid.includes(format as ExportFormat)) {
      throw new BadRequestException(
        `Unsupported export format "${format}". Supported formats: ${valid.join(', ')}.`,
      );
    }
  }
}
