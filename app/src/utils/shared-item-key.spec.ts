import { describe, expect, it } from 'vitest';
import { AesKey } from '@/models/encryption-models';
import { EncryptionService } from '@/services/encryption-service';
import { fromSharedItemKeyFragment, toSharedItemKeyFragment } from '@/utils/shared-item-key';

describe('shared item key fragment', () => {
  const encryptionService = new EncryptionService();

  it.each(['AES-CBC', 'AES-GCM'] as const)('round trips an %s key', async (algorithm) => {
    const key = await encryptionService.generateAesKey(algorithm);

    expect(fromSharedItemKeyFragment(toSharedItemKeyFragment(key))).toEqual(key);
  });

  it('reads a 32 character hex fragment as the AES-CBC key older apps share', () => {
    expect(fromSharedItemKeyFragment('000102030405060708090a0b0c0d0e0f')).toEqual({
      value: Uint8Array.from({ length: 16 }, (_, i) => i),
      algorithm: 'AES-CBC',
    } satisfies AesKey);
  });

  it('writes an AES-GCM key as 22 base64url characters', async () => {
    const fragment = toSharedItemKeyFragment(await encryptionService.generateAesKey('AES-GCM'));

    expect(fragment).toMatch(/^[A-Za-z0-9_-]{22}$/);
  });

  it.each([undefined, '', 'not-a-key', '000102030405060708090a0b0c0d0e0', 'zz0102030405060708090a0b0c0d0e0f'])(
    'rejects the fragment %j',
    (fragment) => {
      expect(fromSharedItemKeyFragment(fragment)).toBeUndefined();
    },
  );
});
