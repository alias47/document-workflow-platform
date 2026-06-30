import { Test, type TestingModule } from '@nestjs/testing';

import { PasswordService } from './password.service';

describe('PasswordService — password hashing integration', () => {
  let service: PasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordService],
    }).compile();

    service = module.get(PasswordService);
  });

  it('produces a hash that differs from the plain text', async () => {
    const plain = 'SuperSecret@123!';
    const hash = await service.hash(plain);

    expect(hash).not.toBe(plain);
    expect(hash.startsWith('$argon2')).toBe(true);
  });

  it('verifies a correct password against its hash', async () => {
    const plain = 'SuperSecret@123!';
    const hash = await service.hash(plain);

    await expect(service.verify(hash, plain)).resolves.toBe(true);
  });

  it('rejects a wrong password', async () => {
    const hash = await service.hash('CorrectPass@456!');

    await expect(service.verify(hash, 'WrongPass@456!')).resolves.toBe(false);
  });

  it('produces different hashes for the same password (random salt)', async () => {
    const plain = 'SamePassword@789!';
    const hash1 = await service.hash(plain);
    const hash2 = await service.hash(plain);

    expect(hash1).not.toBe(hash2);
    await expect(service.verify(hash1, plain)).resolves.toBe(true);
    await expect(service.verify(hash2, plain)).resolves.toBe(true);
  });
});
