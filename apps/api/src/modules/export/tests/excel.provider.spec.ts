import { ExcelProvider } from '../providers/excel.provider';

describe('ExcelProvider', () => {
  let provider: ExcelProvider;

  beforeEach(() => {
    provider = new ExcelProvider();
  });

  it('generates a non-empty buffer with xlsx mime type', async () => {
    const result = await provider.generate({
      title: 'Test Report',
      columns: [
        { header: 'Name', key: 'name', width: 20 },
        { header: 'Email', key: 'email', width: 30 },
      ],
      rows: [
        { name: 'Alice Smith', email: 'alice@example.com' },
        { name: 'Bob Jones', email: 'bob@example.com' },
      ],
    });

    expect(result.mimeType).toBe(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    expect(result.filename).toBe('test_report.xlsx');
    expect(result.buffer.length).toBeGreaterThan(0);
  });

  it('starts with XLSX magic bytes (PK zip header)', async () => {
    const result = await provider.generate({
      title: 'Excel Test',
      columns: [{ header: 'Col', key: 'col' }],
      rows: [{ col: 'val' }],
    });

    // XLSX files are ZIP archives — start with PK (0x50 0x4B)
    expect(result.buffer[0]).toBe(0x50);
    expect(result.buffer[1]).toBe(0x4b);
  });

  it('handles empty rows', async () => {
    const result = await provider.generate({
      title: 'Empty Report',
      columns: [{ header: 'Name', key: 'name' }],
      rows: [],
    });

    expect(result.buffer.length).toBeGreaterThan(0);
  });

  it('generates a filename from the title', async () => {
    const result = await provider.generate({
      title: 'Staff Workload Report',
      columns: [{ header: 'Name', key: 'name' }],
      rows: [],
    });

    expect(result.filename).toBe('staff_workload_report.xlsx');
  });

  it('handles large datasets without throwing', async () => {
    const rows = Array.from({ length: 500 }, (_, i) => ({
      name: `Applicant ${i}`,
      email: `applicant${i}@example.com`,
    }));

    await expect(
      provider.generate({
        title: 'Large Report',
        columns: [
          { header: 'Name', key: 'name' },
          { header: 'Email', key: 'email' },
        ],
        rows,
      }),
    ).resolves.not.toThrow();
  });
});
