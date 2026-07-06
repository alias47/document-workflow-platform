import { Injectable } from '@nestjs/common';
import ExcelJS from 'exceljs';

import type {
  ExportOptions,
  ExportProvider,
  ExportResult,
} from '../interfaces/export-provider.interface';

@Injectable()
export class ExcelProvider implements ExportProvider {
  async generate(options: ExportOptions): Promise<ExportResult> {
    const { title, columns, rows } = options;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Document Workflow Platform';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet(title.slice(0, 31));

    sheet.columns = columns.map((c) => ({
      header: c.header,
      key: c.key,
      width: c.width ?? Math.max(c.header.length + 4, 14),
    }));

    // Bold header row with light blue fill.
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD9E1F2' },
    };
    headerRow.alignment = { vertical: 'middle' };
    headerRow.border = {
      bottom: { style: 'thin', color: { argb: 'FF9EB6E8' } },
    };

    for (const row of rows) {
      sheet.addRow(row as Record<string, unknown>);
    }

    // Auto-fit row height and freeze the header.
    sheet.views = [{ state: 'frozen', ySplit: 1 }];

    const buffer = Buffer.from(await workbook.xlsx.writeBuffer());

    return {
      buffer,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      filename: `${title.replace(/\s+/g, '_').toLowerCase()}.xlsx`,
    };
  }
}
