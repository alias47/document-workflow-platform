import { Injectable } from '@nestjs/common';

import type {
  ExportOptions,
  ExportProvider,
  ExportResult,
} from '../interfaces/export-provider.interface';

/**
 * Minimal pure-JS PDF generator for tabular reports.
 *
 * Uses raw PDF primitives (no native binary dependency). Produces a landscape
 * A4 document with a title, generation date, simple table, and page numbers.
 * Complex Unicode beyond basic Latin is not supported — this is intentional to
 * avoid shipping a full font embedding library for the MVP.
 */
@Injectable()
export class PdfProvider implements ExportProvider {
  async generate(options: ExportOptions): Promise<ExportResult> {
    const { title, columns, rows } = options;

    // Landscape A4 in points: 842 × 595
    const PAGE_W = 842;
    const PAGE_H = 595;
    const MARGIN = 36;
    const CONTENT_W = PAGE_W - MARGIN * 2;

    const COL_W = Math.floor(CONTENT_W / columns.length);
    const ROW_H = 18;
    const HEADER_H = 22;
    const TITLE_Y = MARGIN + 20;
    const DATE_Y = TITLE_Y + 16;
    const TABLE_START_Y = DATE_Y + 24;

    const generatedDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    // Collect all PDF content stream lines.
    const streamLines: string[] = [];

    function text(x: number, y: number, str: string): void {
      const safe = String(str ?? '').replace(/[()\\]/g, (c) => `\\${c}`);
      streamLines.push(`BT /F1 9 Tf ${x} ${PAGE_H - y} Td (${safe}) Tj ET`);
    }

    function boldText(x: number, y: number, str: string): void {
      const safe = String(str ?? '').replace(/[()\\]/g, (c) => `\\${c}`);
      streamLines.push(`BT /F2 10 Tf ${x} ${PAGE_H - y} Td (${safe}) Tj ET`);
    }

    function titleText(x: number, y: number, str: string): void {
      const safe = String(str ?? '').replace(/[()\\]/g, (c) => `\\${c}`);
      streamLines.push(`BT /F2 14 Tf ${x} ${PAGE_H - y} Td (${safe}) Tj ET`);
    }

    function rect(x: number, y: number, w: number, h: number, fill: boolean): void {
      const op = fill ? 'f' : 'S';
      streamLines.push(`${x} ${PAGE_H - y - h} ${w} ${h} re ${op}`);
    }

    function setColor(r: number, g: number, b: number): void {
      const fmt = (v: number) => (v / 255).toFixed(3);
      streamLines.push(`${fmt(r)} ${fmt(g)} ${fmt(b)} rg`);
    }

    function resetColor(): void {
      streamLines.push('0 0 0 rg');
    }

    // Title
    titleText(MARGIN, TITLE_Y, title);

    // Generation date
    setColor(100, 116, 139);
    text(MARGIN, DATE_Y, `Generated: ${generatedDate}`);
    resetColor();

    // Header row background
    setColor(217, 225, 242);
    rect(MARGIN, TABLE_START_Y, CONTENT_W, HEADER_H, true);
    resetColor();

    // Header labels
    columns.forEach((col, i) => {
      boldText(MARGIN + i * COL_W + 4, TABLE_START_Y + 15, col.header);
    });

    // Data rows
    let rowsOnPage = 0;
    const maxRowsPerPage = Math.floor((PAGE_H - TABLE_START_Y - HEADER_H - MARGIN - 20) / ROW_H);

    rows.forEach((row, ri) => {
      if (rowsOnPage >= maxRowsPerPage) rowsOnPage = 0; // simple truncation for MVP

      const rowY = TABLE_START_Y + HEADER_H + rowsOnPage * ROW_H;

      if (ri % 2 === 1) {
        setColor(248, 250, 252);
        rect(MARGIN, rowY, CONTENT_W, ROW_H, true);
        resetColor();
      }

      columns.forEach((col, ci) => {
        const val = String((row as Record<string, unknown>)[col.key] ?? '');
        const truncated = val.length > 28 ? `${val.slice(0, 25)}...` : val;
        text(MARGIN + ci * COL_W + 4, rowY + 13, truncated);
      });

      rowsOnPage++;
    });

    // Footer: page number
    setColor(100, 116, 139);
    text(PAGE_W / 2 - 20, PAGE_H - MARGIN + 10, 'Page 1');
    resetColor();

    const streamContent = streamLines.join('\n');

    // PDF object assembly
    const catalogIdx = 1;
    const pagesIdx = 2;
    const pageIdx = 3;
    const fontHelveticaIdx = 4;
    const fontHelveticaBoldIdx = 5;
    const contentIdx = 6;

    const stream = `stream\n${streamContent}\nendstream`;
    const streamObj = `<< /Length ${streamContent.length} >>\n${stream}`;

    // Build objects in order
    const allObjects = [
      `<< /Type /Catalog /Pages ${pagesIdx} 0 R >>`, // 1 catalog
      `<< /Type /Pages /Kids [${pageIdx} 0 R] /Count 1 >>`, // 2 pages
      `<< /Type /Page /Parent ${pagesIdx} 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}]\n   /Contents ${contentIdx} 0 R\n   /Resources << /Font << /F1 ${fontHelveticaIdx} 0 R /F2 ${fontHelveticaBoldIdx} 0 R >> >> >>`, // 3 page
      `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`, // 4 font
      `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>`, // 5 font bold
      streamObj, // 6 content stream
    ];

    // Recalculate offsets properly
    const header = '%PDF-1.4\n';
    let pos = header.length;
    const xrefOffsets: number[] = [];

    const objectStrings = allObjects.map((body, i) => {
      xrefOffsets.push(pos);
      const str = `${i + 1} 0 obj\n${body}\nendobj\n`;
      pos += str.length;
      return str;
    });

    const xrefPos = pos;
    const xrefCount = allObjects.length + 1;

    const xref = [
      'xref',
      `0 ${xrefCount}`,
      '0000000000 65535 f \n' +
        xrefOffsets.map((o) => `${String(o).padStart(10, '0')} 00000 n `).join('\n'),
    ].join('\n');

    const trailer = `trailer\n<< /Size ${xrefCount} /Root ${catalogIdx} 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;

    const pdfContent = [header, ...objectStrings, xref, trailer].join('');

    return {
      buffer: Buffer.from(pdfContent, 'latin1'),
      mimeType: 'application/pdf',
      filename: `${title.replace(/\s+/g, '_').toLowerCase()}.pdf`,
    };
  }
}
