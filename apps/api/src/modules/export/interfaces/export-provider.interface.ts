export type ExportFormat = 'csv' | 'xlsx' | 'pdf';

export interface ExportColumn {
  header: string;
  key: string;
  width?: number;
}

export interface ExportOptions {
  title: string;
  columns: ExportColumn[];
  rows: object[];
}

export interface ExportResult {
  buffer: Buffer;
  mimeType: string;
  filename: string;
}

export interface ExportProvider {
  generate(options: ExportOptions): Promise<ExportResult>;
}

export const EXPORT_FORMAT_MIME: Record<ExportFormat, string> = {
  csv: 'text/csv; charset=utf-8',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pdf: 'application/pdf',
};
