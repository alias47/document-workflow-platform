import { CsvProvider } from '../providers/csv.provider';

describe('CsvProvider', () => {
  let provider: CsvProvider;

  beforeEach(() => {
    provider = new CsvProvider();
  });

  it('generates CSV with headers and rows', async () => {
    const result = await provider.generate({
      title: 'Test Report',
      columns: [
        { header: 'Name', key: 'name' },
        { header: 'Email', key: 'email' },
      ],
      rows: [
        { name: 'Alice Smith', email: 'alice@example.com' },
        { name: 'Bob Jones', email: 'bob@example.com' },
      ],
    });

    expect(result.mimeType).toContain('text/csv');
    expect(result.filename).toBe('test_report.csv');

    const content = result.buffer.toString('utf-8');
    expect(content).toContain('Name,Email');
    expect(content).toContain('Alice Smith');
    expect(content).toContain('alice@example.com');
  });

  it('sanitizes CSV injection: = prefix', async () => {
    const result = await provider.generate({
      title: 'Injection Test',
      columns: [{ header: 'Value', key: 'value' }],
      rows: [{ value: '=SUM(A1:A10)' }],
    });

    const content = result.buffer.toString('utf-8');
    // Value is prefixed with ' so the leading = is not the first character
    expect(content).toContain("'=SUM");
    // The leading = is never the first character of the cell value
    expect(content).not.toMatch(/^=SUM/m);
  });

  it('sanitizes CSV injection: + prefix', async () => {
    const result = await provider.generate({
      title: 'Injection Test',
      columns: [{ header: 'Value', key: 'value' }],
      rows: [{ value: '+cmd|' }],
    });

    const content = result.buffer.toString('utf-8');
    // Value is prefixed with '
    expect(content).toContain("'+cmd");
    expect(content).not.toMatch(/^[+]cmd/m);
  });

  it('sanitizes CSV injection: @ prefix', async () => {
    const result = await provider.generate({
      title: 'Injection Test',
      columns: [{ header: 'Value', key: 'value' }],
      rows: [{ value: '@SUM(A1)' }],
    });

    const content = result.buffer.toString('utf-8');
    // Value is prefixed with ' so @ is not the start of the cell
    expect(content).toContain("'@SUM");
    expect(content).not.toMatch(/^@SUM/m);
  });

  it('sanitizes CSV injection: - prefix', async () => {
    const result = await provider.generate({
      title: 'Injection Test',
      columns: [{ header: 'Value', key: 'value' }],
      rows: [{ value: '-2+3+cmd|' }],
    });

    const content = result.buffer.toString('utf-8');
    expect(content).toContain("'-2+3");
  });

  it('handles null and undefined values', async () => {
    const result = await provider.generate({
      title: 'Null Test',
      columns: [{ header: 'Value', key: 'value' }],
      rows: [{ value: null }, { value: undefined }],
    });

    const content = result.buffer.toString('utf-8');
    // Header row + two empty value rows
    expect(content).toContain('Value');
    // Both null and undefined should produce empty cells
    const lines = content.replace(/^﻿/, '').split('\n');
    expect(lines[0]).toBe('Value');
    expect(lines[1]).toBe('');
    expect(lines[2]).toBe('');
  });

  it('wraps values containing commas in quotes', async () => {
    const result = await provider.generate({
      title: 'Quote Test',
      columns: [{ header: 'Value', key: 'value' }],
      rows: [{ value: 'Smith, John' }],
    });

    const content = result.buffer.toString('utf-8');
    expect(content).toContain('"Smith, John"');
  });

  it('escapes double quotes within values', async () => {
    const result = await provider.generate({
      title: 'Escape Test',
      columns: [{ header: 'Value', key: 'value' }],
      rows: [{ value: 'He said "hello"' }],
    });

    const content = result.buffer.toString('utf-8');
    expect(content).toContain('""hello""');
  });

  it('emits UTF-8 BOM', async () => {
    const result = await provider.generate({
      title: 'BOM Test',
      columns: [{ header: 'Name', key: 'name' }],
      rows: [{ name: 'Test' }],
    });

    // BOM is EF BB BF
    expect(result.buffer[0]).toBe(0xef);
    expect(result.buffer[1]).toBe(0xbb);
    expect(result.buffer[2]).toBe(0xbf);
  });
});
