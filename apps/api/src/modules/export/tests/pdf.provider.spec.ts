import { PdfProvider } from '../providers/pdf.provider';

describe('PdfProvider', () => {
  let provider: PdfProvider;

  beforeEach(() => {
    provider = new PdfProvider();
  });

  it('generates a PDF buffer with correct mime type', async () => {
    const result = await provider.generate({
      title: 'Test Report',
      columns: [
        { header: 'Name', key: 'name' },
        { header: 'Email', key: 'email' },
      ],
      rows: [{ name: 'Alice Smith', email: 'alice@example.com' }],
    });

    expect(result.mimeType).toBe('application/pdf');
    expect(result.filename).toBe('test_report.pdf');
    expect(result.buffer.length).toBeGreaterThan(0);
  });

  it('starts with %PDF- signature', async () => {
    const result = await provider.generate({
      title: 'PDF Test',
      columns: [{ header: 'Col', key: 'col' }],
      rows: [{ col: 'val' }],
    });

    const header = result.buffer.subarray(0, 5).toString('latin1');
    expect(header).toBe('%PDF-');
  });

  it('includes the title in the PDF content', async () => {
    const result = await provider.generate({
      title: 'My Special Report',
      columns: [{ header: 'Name', key: 'name' }],
      rows: [{ name: 'Test User' }],
    });

    const content = result.buffer.toString('latin1');
    expect(content).toContain('My Special Report');
  });

  it('handles empty rows', async () => {
    const result = await provider.generate({
      title: 'Empty Report',
      columns: [{ header: 'Name', key: 'name' }],
      rows: [],
    });

    expect(result.buffer.length).toBeGreaterThan(0);
  });

  it('generates filename from title', async () => {
    const result = await provider.generate({
      title: 'Staff Workload Report',
      columns: [{ header: 'Name', key: 'name' }],
      rows: [],
    });

    expect(result.filename).toBe('staff_workload_report.pdf');
  });

  it('ends with %%EOF', async () => {
    const result = await provider.generate({
      title: 'EOF Test',
      columns: [{ header: 'Col', key: 'col' }],
      rows: [],
    });

    const content = result.buffer.toString('latin1');
    expect(content).toContain('%%EOF');
  });
});
