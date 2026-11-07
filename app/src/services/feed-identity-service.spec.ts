import { beforeAll, describe, expect, it, vi } from 'vitest';
import { EncryptionService, splitNonceAndCiphertext } from '@/services/encryption-service';
import { FeedIdentityService } from '@/services/feed-identity-service';
import { ApiResult } from '@/services/api-error';
import { FeedIdentity } from '@/models/feed-models';
import { getFeedShareUrl } from '@/store/feed';
import { PutUserDataRequest } from '@/models/feed-api-models';
import { AesAlgorithm, RsaKeyPair } from '@/models/encryption-models';

const encryptionService = new EncryptionService();
let rsaKeyPair: RsaKeyPair;

beforeAll(async () => {
  rsaKeyPair = await encryptionService.generateRsaKeys();
});

async function publish(algorithm: AesAlgorithm, times = 1) {
  const aesKey = await encryptionService.generateAesKey(algorithm);
  const identity = new FeedIdentity('me', 'lookup', aesKey, rsaKeyPair, 'pw', 'Me', false, true, true);
  const putUserDataAsync = vi.fn().mockResolvedValue(ApiResult.success());
  const service = new FeedIdentityService({ putUserDataAsync } as never, encryptionService);
  for (let i = 0; i < times; i++) {
    await service.publishProfileAsync(identity);
  }
  return { aesKey, requests: putUserDataAsync.mock.calls.map(([x]) => x as PutUserDataRequest) };
}

const hex = (bytes: Uint8Array) => Buffer.from(bytes).toString('hex');

describe('publishProfileAsync', () => {
  describe('with an AES-GCM key', () => {
    it('encrypts the name under its own nonce and publishes no plan', async () => {
      const { aesKey, requests } = await publish('AES-GCM');
      const [request] = requests;

      expect(request!.encryptionIV).toEqual(new Uint8Array());
      expect(request!.encryptedCurrentPlan).toBeUndefined();
      const name = splitNonceAndCiphertext(request!.encryptedName!);
      expect(
        new TextDecoder().decode(await encryptionService.decryptAndVerifyAsync(name, aesKey, rsaKeyPair.publicKey)),
      ).toBe('Me');
    });

    it('never reuses a nonce across publishes', async () => {
      const { requests } = await publish('AES-GCM', 50);

      const nonces = requests.map((x) => hex(splitNonceAndCiphertext(x.encryptedName!).iv.value));
      expect(new Set(nonces).size).toBe(50);
    });
  });

  describe('with an AES-CBC key', () => {
    it('encrypts the name under the shared IV and publishes no plan', async () => {
      const { aesKey, requests } = await publish('AES-CBC');
      const [request] = requests;
      const iv = { value: request!.encryptionIV };

      expect(iv.value.byteLength).toBe(16);
      expect(request!.encryptedCurrentPlan).toBeUndefined();
      expect(
        new TextDecoder().decode(
          await encryptionService.decryptAndVerifyAsync(
            { encryptedPayload: request!.encryptedName!, iv },
            aesKey,
            rsaKeyPair.publicKey,
          ),
        ),
      ).toBe('Me');
    });
  });
});

describe('share secret', () => {
  it('a new identity publishes the tag its share secret makes for its public key', async () => {
    const putUserDataAsync = vi.fn().mockResolvedValue(ApiResult.success());
    const createUserAsync = vi
      .fn()
      .mockResolvedValue(ApiResult.success({ id: 'me', lookup: 'lookup', password: 'pw' }));
    const service = new FeedIdentityService({ putUserDataAsync, createUserAsync } as never, encryptionService);

    const result = await service.createFeedIdentityAsync('Me', false, true);
    if (!result.isSuccess()) {
      throw new Error('identity was not created');
    }
    const identity = result.data;

    const request = putUserDataAsync.mock.calls[0]![0] as PutUserDataRequest;
    expect(identity.shareSecret).toHaveLength(12);
    expect(request.shareTag).toEqual(
      await encryptionService.shareTagAsync(identity.shareSecret!, identity.rsaKeyPair.publicKey),
    );
  });

  it('an identity without a share secret publishes no tag', async () => {
    const { requests } = await publish('AES-GCM');

    expect(requests[0]!.shareTag).toBeUndefined();
  });

  it('the share link carries the secret in the fragment', () => {
    const identity = new FeedIdentity(
      'me',
      'lookup',
      { value: new Uint8Array(), algorithm: 'AES-GCM' },
      rsaKeyPair,
      'pw',
      'Me',
      false,
      true,
      true,
      [],
      false,
      new Uint8Array([251, 255, 0]),
    );

    expect(getFeedShareUrl(identity)).toBe('https://app.liftlog.online/feed/share?id=lookup&name=Me#-_8A');
  });
});
