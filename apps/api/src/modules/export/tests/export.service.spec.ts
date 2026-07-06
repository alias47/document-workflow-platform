import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { CsvProvider } from '../providers/csv.provider';
import { ExcelProvider } from '../providers/excel.provider';
import { PdfProvider } from '../providers/pdf.provider';
import { ExportService, EXPORT_MAX_ROWS } from '../services/export.service';

const mockBuffer = Buffer.from('mock');

const mockCsv = {
  generate: jest
    .fn()
    .mockResolvedValue({ buffer: mockBuffer, mimeType: 'text/csv', filename: 'test.csv' }),
};
const mockExcel = {
  generate: jest
    .fn()
    .mockResolvedValue({
      buffer: mockBuffer,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      filename: 'test.xlsx',
    }),
};
const mockPdf = {
  generate: jest
    .fn()
    .mockResolvedValue({ buffer: mockBuffer, mimeType: 'application/pdf', filename: 'test.pdf' }),
};

describe('ExportService', () => {
  let service: ExportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExportService,
        { provide: CsvProvider, useValue: mockCsv },
        { provide: ExcelProvider, useValue: mockExcel },
        { provide: PdfProvider, useValue: mockPdf },
      ],
    }).compile();

    service = module.get(ExportService);
    jest.clearAllMocks();
  });

  const baseOptions = {
    title: 'Test',
    columns: [{ header: 'Name', key: 'name' }],
    rows: [{ name: 'Alice' }],
  };

  it('delegates csv to CsvProvider', async () => {
    await service.generate('csv', baseOptions);
    expect(mockCsv.generate).toHaveBeenCalledWith(baseOptions);
    expect(mockExcel.generate).not.toHaveBeenCalled();
  });

  it('delegates xlsx to ExcelProvider', async () => {
    await service.generate('xlsx', baseOptions);
    expect(mockExcel.generate).toHaveBeenCalledWith(baseOptions);
  });

  it('delegates pdf to PdfProvider', async () => {
    await service.generate('pdf', baseOptions);
    expect(mockPdf.generate).toHaveBeenCalledWith(baseOptions);
  });

  it('throws BadRequestException for unsupported format', async () => {
    await expect(service.generate('docx' as 'csv', baseOptions)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throws BadRequestException when rows exceed max', async () => {
    const rows = Array.from({ length: EXPORT_MAX_ROWS + 1 }, (_, i) => ({ name: `R${i}` }));
    await expect(service.generate('csv', { ...baseOptions, rows })).rejects.toThrow(
      BadRequestException,
    );
    await expect(service.generate('csv', { ...baseOptions, rows })).rejects.toThrow(/10,000/);
  });

  it('accepts exactly max rows', async () => {
    const rows = Array.from({ length: EXPORT_MAX_ROWS }, (_, i) => ({ name: `R${i}` }));
    await expect(service.generate('csv', { ...baseOptions, rows })).resolves.not.toThrow();
  });

  describe('validateFormat', () => {
    it('passes for valid formats', () => {
      expect(() => service.validateFormat('csv')).not.toThrow();
      expect(() => service.validateFormat('xlsx')).not.toThrow();
      expect(() => service.validateFormat('pdf')).not.toThrow();
    });

    it('throws for invalid format', () => {
      expect(() => service.validateFormat('xml')).toThrow(BadRequestException);
    });
  });
});
