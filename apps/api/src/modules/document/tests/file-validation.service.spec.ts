import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { FileValidationService } from '../services/file-validation.service';

import { STORAGE_CONFIG_KEY } from '@/config';

const MAX = 1024;

function makeFile(overrides: Partial<Express.Multer.File> = {}): Express.Multer.File {
  return {
    fieldname: 'file',
    originalname: 'passport.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    size: 100,
    buffer: Buffer.from('a'.repeat(100)),
    stream: undefined as never,
    destination: '',
    filename: '',
    path: '',
    ...overrides,
  };
}

describe('FileValidationService', () => {
  let service: FileValidationService;

  beforeEach(() => {
    const config = {
      get: (key: string) => (key === STORAGE_CONFIG_KEY ? { maxFileSizeBytes: MAX } : undefined),
    } as unknown as ConfigService;
    service = new FileValidationService(config);
  });

  it('accepts a valid PDF', () => {
    const result = service.validate(makeFile());
    expect(result).toEqual({ extension: '.pdf', mimeType: 'application/pdf', size: 100 });
  });

  it('accepts a JPEG with .jpg extension', () => {
    const result = service.validate(
      makeFile({ originalname: 'photo.jpg', mimetype: 'image/jpeg' }),
    );
    expect(result.extension).toBe('.jpg');
  });

  it('rejects a missing file', () => {
    expect(() => service.validate(undefined)).toThrow(BadRequestException);
  });

  it('rejects an empty file', () => {
    expect(() => service.validate(makeFile({ size: 0, buffer: Buffer.alloc(0) }))).toThrow(/empty/);
  });

  it('rejects a file over the max size', () => {
    expect(() =>
      service.validate(makeFile({ size: MAX + 1, buffer: Buffer.alloc(MAX + 1) })),
    ).toThrow(/maximum size/);
  });

  it('rejects a disallowed MIME type', () => {
    expect(() =>
      service.validate(makeFile({ originalname: 'x.exe', mimetype: 'application/x-msdownload' })),
    ).toThrow(/Unsupported file type/);
  });

  it('rejects a disallowed extension', () => {
    expect(() =>
      service.validate(makeFile({ originalname: 'x.exe', mimetype: 'application/pdf' })),
    ).toThrow(/Unsupported file extension/);
  });

  it('rejects a mismatched extension/MIME pair', () => {
    expect(() =>
      service.validate(makeFile({ originalname: 'x.pdf', mimetype: 'image/png' })),
    ).toThrow(/does not match content type/);
  });
});
