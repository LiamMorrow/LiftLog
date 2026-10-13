import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DecryptedInboxMessage, FeedInboxDecryptionService } from './feed-inbox-decryption-service';
import { FeedFollowService } from './feed-follow-service';
import { EncryptionService, toJsonBytes } from './encryption-service';
import { type FeedApiService } from './feed-api';
import { FeedUser, FeedIdentity, FollowedFeedUser } from '@/models/feed-models';
import { GetInboxMessageResponse, GetUserResponse } from '@/models/feed-api-models';
import { RsaPrivateKey } from '@/models/encryption-models';
import { ApiErrorType, ApiResult } from '@/services/api-error';
import {
  InboxMessageJSON,
  toAesKeyJSON,
  toBase64Uint8ArrayJSON,
  toJsonString,
  toRsaPublicKeyJSON,
} from '@/models/storage/versions/latest';

const SERVER_ID = '00000000-0000-0000-0000-000000000000';

interface UserAndPrivateKey {
  user: FeedUser;
  identity: FeedIdentity;
  privateKey: RsaPrivateKey;
}
describe('FeedInboxDecryptionService', () => {
  let sut: FeedInboxDecryptionService;
  let encryptionService: EncryptionService;
  let feedApiService: FeedApiService;
  let maliciousUser: UserAndPrivateKey;
  let victimUser: UserAndPrivateKey;
  let thirdPartyUser: UserAndPrivateKey;

  beforeEach(async () => {
    encryptionService = new EncryptionService();
    feedApiService = {
      getUserAsync: vi.fn(),
    } as Partial<FeedApiService> as FeedApiService;

    sut = new FeedInboxDecryptionService(encryptionService, feedApiService);

    maliciousUser = await createFeedUser(encryptionService);
    victimUser = await createFeedUser(encryptionService);
    thirdPartyUser = await createFeedUser(encryptionService);

    vi.mocked(feedApiService.getUserAsync).mockImplementation(async (userId: string) => {
      if (userId === thirdPartyUser.user.id) {
        return ApiResult.success(toGetUserResponse(thirdPartyUser));
      }
      if (userId === maliciousUser.user.id) {
        return ApiResult.success(toGetUserResponse(maliciousUser));
      }
      throw new Error(`Unexpected user ID: ${userId}`);
    });
  });

  async function legacyMessage(signer: UserAndPrivateKey, claimedSender: UserAndPrivateKey) {
    const message: Omit<InboxMessageJSON, 'signature'> = {
      senderUserId: claimedSender.user.id,
      type: 'FollowRequest',
      payloadJson: toJsonString({ name: claimedSender.user.name }),
    };
    const signaturePayload = FeedInboxDecryptionService.getSignaturePayload(message, victimUser.user.id);
    const signature = await encryptionService.signRsaPssSha256Async(signaturePayload, signer.privateKey);
    const encrypted = await encryptionService.encryptRsaOaepSha256Async(
      toJsonBytes({ ...message, signature: toBase64Uint8ArrayJSON(signature) }),
      victimUser.user.publicKey,
    );
    return { id: SERVER_ID, encryptedMessage: encrypted.dataChunks } satisfies GetInboxMessageResponse;
  }

  it('rejects a message signed by someone other than its claimed sender', async () => {
    const result = await sut.decrypt(victimUser.identity, await legacyMessage(maliciousUser, thirdPartyUser));

    expect(result).toEqual({ kind: 'invalid', serverId: SERVER_ID });
  });

  it('reads the message id and send time from the signed payload', async () => {
    const followService = new FeedFollowService(feedApiService, encryptionService);
    const outgoing = await followService.followRequestMessage(thirdPartyUser.identity, victimUser.user);

    const result = await sut.decrypt(victimUser.identity, {
      id: SERVER_ID,
      encryptedMessage: outgoing.encryptedMessage,
    });

    expect(result.kind).toBe('ok');
    const ok = result as Extract<DecryptedInboxMessage, { kind: 'ok' }>;
    expect(ok.messageId).toBe(outgoing.messageId);
    expect(ok.sentAtMs).toBeGreaterThan(0);
    expect(ok.json.type).toBe('FollowRequest');
    expect(ok.json.senderUserId).toBe(thirdPartyUser.user.id);
  });

  it('falls back to the server id for a message from an older app', async () => {
    const result = await sut.decrypt(victimUser.identity, await legacyMessage(thirdPartyUser, thirdPartyUser));

    expect(result).toMatchObject({ kind: 'ok', messageId: SERVER_ID, sentAtMs: 0 });
  });

  it('asks for a retry when the sender cannot be looked up', async () => {
    vi.mocked(feedApiService.getUserAsync).mockResolvedValue(
      ApiResult.fromError({ type: ApiErrorType.Unknown, message: 'offline', exception: undefined }),
    );

    const result = await sut.decrypt(victimUser.identity, await legacyMessage(thirdPartyUser, thirdPartyUser));

    expect(result).toEqual({ kind: 'retry', serverId: SERVER_ID });
  });

  it('drops a message whose sender no longer exists', async () => {
    vi.mocked(feedApiService.getUserAsync).mockResolvedValue(
      ApiResult.fromError({ type: ApiErrorType.NotFound, message: 'gone', exception: undefined }),
    );

    const result = await sut.decrypt(victimUser.identity, await legacyMessage(thirdPartyUser, thirdPartyUser));

    expect(result).toEqual({ kind: 'invalid', serverId: SERVER_ID });
  });

  it('drops a message encrypted for someone else', async () => {
    const result = await sut.decrypt(maliciousUser.identity, await legacyMessage(thirdPartyUser, thirdPartyUser));

    expect(result).toEqual({ kind: 'invalid', serverId: SERVER_ID });
  });
});

async function createFeedUser(encryptionService: EncryptionService): Promise<UserAndPrivateKey> {
  const rsaKeyPair = await encryptionService.generateRsaKeys();
  const aesKey = await encryptionService.generateAesKey();
  const userId = crypto.randomUUID();

  const feedUser = FollowedFeedUser.fromJSON({
    version: 3,
    id: userId,
    publicKey: toRsaPublicKeyJSON(rsaKeyPair.publicKey),
    name: 'Some user',
    aesKey: toAesKeyJSON(aesKey),
    currentPlan: undefined,
    followSecret: '',
    type: 'FollowedFeedUser',
  });

  const identity = new FeedIdentity(
    feedUser.id,
    feedUser.id,
    feedUser.aesKey,
    { publicKey: feedUser.publicKey, privateKey: rsaKeyPair.privateKey },
    'password',
    feedUser.name,
    true,
    true,
    true,
  );

  return {
    user: feedUser,
    identity: identity,
    privateKey: rsaKeyPair.privateKey,
  };
}

function toGetUserResponse(userAndPrivateKey: UserAndPrivateKey): GetUserResponse {
  return {
    id: userAndPrivateKey.user.id,
    lookup: userAndPrivateKey.user.id,
    encryptedCurrentPlan: undefined,
    encryptedName: undefined,
    encryptionIV: new Uint8Array(16),
    rsaPublicKey: userAndPrivateKey.user.publicKey.spkiPublicKeyBytes,
  };
}
