import { mkdtempSync, rmSync } from 'fs';
import { readFile } from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';

import { ConfigService } from '@nestjs/config';

import { LocalStorageProvider } from '../providers/local-storage.provider';

import type { Readable } from 'stream';

import { STORAGE_CONFIG_KEY } from '@/config';

const ORG_ID = 'org-uuid-1';
const APPLICANT_ID = 'applicant-uuid-1';

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk as Buffer));
  }
  return Buffer.concat(chunks);
}

describe('LocalStorageProvider', () => {
  let provider: LocalStorageProvider;
  let root: string;

  beforeEach(() => {
    root = mkdtempSync(path.join(tmpdir(), 'storage-test-'));
    const config = {
      get: (key: string) => (key === STORAGE_CONFIG_KEY ? { localRoot: root } : undefined),
    } as unknown as ConfigService;
    provider = new LocalStorageProvider(config);
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
  });

  it('uploads a file under organizations/<org>/applicants/<applicant>/<year>/<month>/', async () => {
    const buffer = Buffer.from('hello world');
    const { storageKey } = await provider.upload({
      organizationId: ORG_ID,
      applicantId: APPLICANT_ID,
      storedFilename: 'abc.pdf',
      buffer,
    });

    expect(storageKey).toMatch(
      new RegExp(`^organizations/${ORG_ID}/applicants/${APPLICANT_ID}/\\d{4}/\\d{2}/abc\\.pdf$`),
    );
    const onDisk = await readFile(path.join(root, storageKey));
    expect(onDisk.equals(buffer)).toBe(true);
  });

  it('round-trips content via download', async () => {
    const buffer = Buffer.from('stream me');
    const { storageKey } = await provider.upload({
      organizationId: ORG_ID,
      applicantId: APPLICANT_ID,
      storedFilename: 'file.png',
      buffer,
    });

    const stream = await provider.download(storageKey);
    const downloaded = await streamToBuffer(stream);
    expect(downloaded.equals(buffer)).toBe(true);
  });

  it('reports existence and removes files on delete', async () => {
    const { storageKey } = await provider.upload({
      organizationId: ORG_ID,
      applicantId: APPLICANT_ID,
      storedFilename: 'del.pdf',
      buffer: Buffer.from('x'),
    });

    expect(await provider.exists(storageKey)).toBe(true);
    await provider.delete(storageKey);
    expect(await provider.exists(storageKey)).toBe(false);
  });

  it('delete is idempotent for a missing key', async () => {
    await expect(
      provider.delete('organizations/x/applicants/y/2026/07/missing.pdf'),
    ).resolves.toBeUndefined();
  });

  it('returns false from exists for a missing key', async () => {
    expect(await provider.exists('organizations/x/applicants/y/2026/07/nope.pdf')).toBe(false);
  });

  describe('path traversal protection', () => {
    it('rejects download of a key escaping the root', async () => {
      await expect(provider.download('../../../etc/passwd')).rejects.toThrow(/escapes/);
    });

    it('rejects exists check silently for an escaping key', async () => {
      // exists() swallows the confinement error and reports false.
      expect(await provider.exists('../../secret')).toBe(false);
    });

    it('rejects delete of an escaping key', async () => {
      await expect(provider.delete('../../../important')).rejects.toThrow(/escapes/);
    });
  });
});
