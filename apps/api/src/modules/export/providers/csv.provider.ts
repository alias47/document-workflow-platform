import { Injectable } from '@nestjs/common';

import type {
  ExportOptions,
  ExportProvider,
  ExportResult,
} from '../interfaces/export-provider.interface';

/** Prefix characters that trigger formula execution in spreadsheet apps. */
const CSV_INJECTION_PREFIXES = ['=', '+', '-', '@', '\t', '\r'];

function sanitizeCsvValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  // Wrap in quotes and escape existing quotes. Guard against CSV injection by
  // prepending a single quote when the value starts with a trigger character.
  const needsQuoting = str.includes(',') || str.includes('"') || str.includes('\n');
  const startsWithInjectionChar = CSV_INJECTION_PREFIXES.some((p) => str.startsWith(p));

  const safe = startsWithInjectionChar ? `'${str}` : str;
  if (needsQuoting || startsWithInjectionChar) {
    return `"${safe.replace(/"/g, '""')}"`;
  }
  return safe;
}

@Injectable()
export class CsvProvider implements ExportProvider {
  async generate(options: ExportOptions): Promise<ExportResult> {
    const { columns, rows } = options;

    const header = columns.map((c) => sanitizeCsvValue(c.header)).join(',');

    const body = rows
      .map((row) =>
        columns.map((c) => sanitizeCsvValue((row as Record<string, unknown>)[c.key])).join(','),
      )
      .join('\n');

    const csv = `${header}\n${body}`;
    // UTF-8 BOM so Excel opens the file correctly on Windows.
    const buffer = Buffer.concat([Buffer.from('﻿', 'utf8'), Buffer.from(csv, 'utf-8')]);

    return {
      buffer,
      mimeType: 'text/csv; charset=utf-8',
      filename: `${options.title.replace(/\s+/g, '_').toLowerCase()}.csv`,
    };
  }
}
