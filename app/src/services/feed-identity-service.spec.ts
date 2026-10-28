import { beforeAll, describe, expect, it, vi } from 'vitest';
import { LocalDate } from '@js-joda/core';
import { EncryptionService, splitNonceAndCiphertext } from '@/services/encryption-service';
import { FeedIdentityService } from '@/services/feed-identity-service';
import { ApiResult } from '@/services/api-error';
import { FeedIdentity } from '@/models/feed-models';
import { ProgramBlueprint } from '@/models/blueprint-models';
import { PutUserDataRequest } from '@/models/feed-api-models';
import { AesAlgorithm, RsaKeyPair } from '@/models/encryption-models';

const encryptionService = new EncryptionService();
const plan = new ProgramBlueprint('Shared plan', [], LocalDate.of(2026, 8, 6));
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
    await service.publishProfileAsync(identity, plan);
  }
  return { aesKey, requests: putUserDataAsync.mock.calls.map(([x]) => x as PutUserDataRequest) };
}

const hex = (bytes: Uint8Array) => Buffer.from(bytes).toString('hex');

describe('publishProfileAsync', () => {
  describe('with an AES-GCM key', () => {
    it('gives every field its own nonce and leaves the shared IV empty', async () => {
      const { aesKey, requests } = await publish('AES-GCM');
      const [request] = requests;

      expect(request!.encryptionIV).toEqual(new Uint8Array());
      const name = splitNonceAndCiphertext(request!.encryptedName!);
      const currentPlan = splitNonceAndCiphertext(request!.encryptedCurrentPlan!);
      expect(hex(name.iv.value)).not.toBe(hex(currentPlan.iv.value));
      expect(
        new TextDecoder().decode(await encryptionService.decryptAndVerifyAsync(name, aesKey, rsaKeyPair.publicKey)),
      ).toBe('Me');
      await expect(
        encryptionService.decryptAndVerifyAsync(currentPlan, aesKey, rsaKeyPair.publicKey),
      ).resolves.toBeDefined();
    });

    it('never reuses a nonce across fields or publishes', async () => {
      const { requests } = await publish('AES-GCM', 50);

      const nonces = requests.flatMap((x) =>
        [x.encryptedName!, x.encryptedCurrentPlan!].map((field) => hex(splitNonceAndCiphertext(field).iv.value)),
      );
      expect(new Set(nonces).size).toBe(100);
    });
  });

  describe('with an AES-CBC key', () => {
    it('encrypts every field under the one shared IV', async () => {
      const { aesKey, requests } = await publish('AES-CBC');
      const [request] = requests;
      const iv = { value: request!.encryptionIV };

      expect(iv.value.byteLength).toBe(16);
      expect(
        new TextDecoder().decode(
          await encryptionService.decryptAndVerifyAsync(
            { encryptedPayload: request!.encryptedName!, iv },
            aesKey,
            rsaKeyPair.publicKey,
          ),
        ),
      ).toBe('Me');
      await expect(
        encryptionService.decryptAndVerifyAsync(
          { encryptedPayload: request!.encryptedCurrentPlan!, iv },
          aesKey,
          rsaKeyPair.publicKey,
        ),
      ).resolves.toBeDefined();
    });
  });
});
