import { LocalEmailProvider } from '../providers/local-email.provider';

describe('LocalEmailProvider', () => {
  let provider: LocalEmailProvider;

  beforeEach(() => {
    provider = new LocalEmailProvider();
  });

  it('resolves successfully for a valid email (local delivery always succeeds)', async () => {
    await expect(
      provider.send({ to: 'user@test.com', subject: 'Hi', html: '<p>Hello</p>' }),
    ).resolves.toBeUndefined();
  });

  it('does not throw for empty body', async () => {
    await expect(
      provider.send({ to: 'user@test.com', subject: 'Hi', html: '' }),
    ).resolves.toBeUndefined();
  });
});
