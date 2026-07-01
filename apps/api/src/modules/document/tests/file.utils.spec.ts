import { createHash } from 'crypto';

import {
  computeSha256,
  extractExtension,
  generateStoredFilename,
  sanitizeOriginalFilename,
} from '../utils/file.utils';

describe('file.utils', () => {
  describe('sanitizeOriginalFilename', () => {
    it('strips POSIX directory components (path traversal)', () => {
      expect(sanitizeOriginalFilename('../../etc/passwd')).toBe('passwd');
      expect(sanitizeOriginalFilename('/absolute/path/report.pdf')).toBe('report.pdf');
    });

    it('neutralizes Windows separators so no path structure survives', () => {
      // On POSIX, backslash isn't a separator, so it (and the drive colon) are
      // replaced with `_` — the result carries no traversable path segments.
      const result = sanitizeOriginalFilename('C:\\Windows\\evil.pdf');
      expect(result).toBe('C__Windows_evil.pdf');
      expect(result).not.toMatch(/[\\/]/);
    });

    it('replaces reserved characters', () => {
      expect(sanitizeOriginalFilename('a:b*c?.pdf')).toBe('a_b_c_.pdf');
    });

    it('drops leading dots so it cannot become a hidden entry', () => {
      expect(sanitizeOriginalFilename('...hidden.pdf')).toBe('hidden.pdf');
    });

    it('falls back to "file" for names that reduce to empty', () => {
      expect(sanitizeOriginalFilename('/')).toBe('file');
      expect(sanitizeOriginalFilename('   ')).toBe('file');
    });

    it('caps length at 255 characters', () => {
      const long = `${'a'.repeat(300)}.pdf`;
      expect(sanitizeOriginalFilename(long).length).toBe(255);
    });
  });

  describe('extractExtension', () => {
    it('returns lowercase dotted extension', () => {
      expect(extractExtension('Report.PDF')).toBe('.pdf');
      expect(extractExtension('photo.JPEG')).toBe('.jpeg');
    });

    it('returns empty string when there is no extension', () => {
      expect(extractExtension('noext')).toBe('');
    });
  });

  describe('generateStoredFilename', () => {
    it('produces a UUID name with the given extension', () => {
      const name = generateStoredFilename('.pdf');
      expect(name).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.pdf$/);
    });

    it('produces unique names on each call', () => {
      expect(generateStoredFilename('.pdf')).not.toBe(generateStoredFilename('.pdf'));
    });
  });

  describe('computeSha256', () => {
    it('matches a reference SHA-256 digest', () => {
      const buffer = Buffer.from('hello world');
      const expected = createHash('sha256').update(buffer).digest('hex');
      expect(computeSha256(buffer)).toBe(expected);
    });
  });
});
