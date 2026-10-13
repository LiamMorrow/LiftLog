import { describe, expect, it, vi } from 'vitest';
import { Instant } from '@js-joda/core';
import { FeedFollowService } from '@/services/feed-follow-service';
import { EncryptionService } from '@/services/encryption-service';
import { FeedApiService } from '@/services/feed-api';
import { FeedIdentity } from '@/models/feed-models';
import { AesKey } from '@/models/encryption-models';
import { fromAesKeyJSON, FriendKeysJSON } from '@/models/storage/versions/latest';

function capturingService(signatureLength = 1) {
  let sentBytes: Uint8Array | undefined;
  const encryptionService = {
    signRsaPssSha256Async: vi.fn(() => Promise.resolve(new Uint8Array(signatureLength))),
    encryptRsaOaepSha256Async: vi.fn((bytes: Uint8Array) => {
      sentBytes = bytes;
      return Promise.resolve({ dataChunks: [] });
    }),
  };
  const service = new FeedFollowService({} as FeedApiService, encryptionService as unknown as EncryptionService);
  const sentPayload = () => {
    const envelope = JSON.parse(new TextDecoder().decode(sentBytes)) as { payloadJson: string };
    return JSON.parse(envelope.payloadJson) as FriendKeysJSON;
  };
  const sharedKeyNumbers = () => sentPayload().aesKeys.map((x) => fromAesKeyJSON(x).value[0]);
  return { service, sentPayload, sharedKeyNumbers, sentLength: () => sentBytes!.length };
}

const key = (n: number): AesKey => ({ value: new Uint8Array([n]), algorithm: 'AES-GCM' });

function identityWithPreviousKeys(count: number, makeKey = key, id = 'me') {
  return new FeedIdentity(
    id,
    'lookup',
    makeKey(0),
    {
      publicKey: { spkiPublicKeyBytes: new Uint8Array([6]) },
      privateKey: { pkcs8PrivateKeyBytes: new Uint8Array([7]) },
    },
    'pw',
    'Me',
    false,
    false,
    true,
    Array.from({ length: count }, (_, i) => ({ key: makeKey(i + 1), supersededAt: Instant.now() })),
  );
}

describe('friendKeysMessage', () => {
  it('shares the current key first, then previous keys newest first', async () => {
    const { service, sentPayload, sharedKeyNumbers } = capturingService();

    await service.friendKeysMessage(
      identityWithPreviousKeys(2),
      { id: 'bob', publicKey: { spkiPublicKeyBytes: new Uint8Array() } },
      's',
    );

    expect(sharedKeyNumbers()).toEqual([0, 1, 2]);
    expect(sentPayload().followSecret).toBe('s');
  });

  it('shares the algorithm of every key', async () => {
    const { service, sentPayload } = capturingService();

    await service.friendKeysMessage(
      identityWithPreviousKeys(1, (n) => ({ value: new Uint8Array([n]), algorithm: n ? 'AES-CBC' : 'AES-GCM' })),
      { id: 'bob', publicKey: { spkiPublicKeyBytes: new Uint8Array() } },
      's',
    );

    expect(sentPayload().aesKeys.map((x) => x.algorithm)).toEqual(['AES-GCM', 'AES-CBC']);
  });

  it('fits the most keys it shares into the 20 RSA chunks the server accepts', async () => {
    const { service, sentLength } = capturingService(256);
    const fullSizeKey = (): AesKey => ({ value: new Uint8Array(16).fill(0xff), algorithm: 'AES-GCM' });

    await service.friendKeysMessage(
      identityWithPreviousKeys(30, fullSizeKey, '00000000-0000-0000-0000-000000000000'),
      { id: 'bob', publicKey: { spkiPublicKeyBytes: new Uint8Array() } },
      's'.repeat(40),
    );

    expect(sentLength()).toBeLessThanOrEqual(20 * 122);
  });

  it('shares at most 20 keys so the message stays small enough to encrypt', async () => {
    const { service, sharedKeyNumbers } = capturingService();

    await service.friendKeysMessage(
      identityWithPreviousKeys(30),
      { id: 'bob', publicKey: { spkiPublicKeyBytes: new Uint8Array() } },
      's',
    );

    expect(sharedKeyNumbers()).toEqual(Array.from({ length: 20 }, (_, i) => i));
  });
});
