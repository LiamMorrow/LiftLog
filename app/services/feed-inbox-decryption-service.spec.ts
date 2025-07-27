import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FeedInboxDecryptionService } from './feed-inbox-decryption-service';
import { EncryptionService } from './encryption-service';
import { type FeedApiService } from './feed-api';
import { FeedUser, FeedIdentity } from '@/models/feed-models';
import {
  GetInboxMessageResponse,
  GetUserResponse,
} from '@/models/feed-api-models';
import { LiftLog } from '@/gen/proto';
import { toUuidDao, toStringValue } from '@/models/storage/conversions.to-dao';
import { RsaPrivateKey } from '@/models/encryption-models';
import { ApiResult } from '@/services/api-error';

interface UserAndPrivateKey {
  user: FeedUser;
  identity: FeedIdentity;
  privateKey: RsaPrivateKey;
}

describe('FeedInboxDecryptionService', () => {
  describe('Malicious message protection', () => {
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

      // Mock feed API service responses
      vi.mocked(feedApiService.getUserAsync).mockImplementation(
        async (userId: string) => {
          if (userId === thirdPartyUser.user.id) {
            return ApiResult.success(toGetUserResponse(thirdPartyUser));
          }
          if (userId === maliciousUser.user.id) {
            return ApiResult.success(toGetUserResponse(maliciousUser));
          }
          throw new Error(`Unexpected user ID: ${userId}`);
        },
      );
    });

    it('should not allow a malicious user to send a follow request to a victim user to try follow the third party user', async () => {
      // Create a malicious message - the fromUserId claims to be from thirdPartyUser
      // but the signature is created by maliciousUser
      const maliciousMessage = LiftLog.Ui.Models.InboxMessageDao.create({
        fromUserId: toUuidDao(thirdPartyUser.user.id),
        followRequest: LiftLog.Ui.Models.FollowRequestDao.create({
          name: toStringValue(maliciousUser.user.name || 'Malicious User'),
        }),
      });

      // Sign with malicious user's private key (this is the attack - wrong signer)
      const signaturePayload = FeedInboxDecryptionService.getSignaturePayload(
        maliciousMessage,
        victimUser.user.id,
      );
      const signature = await encryptionService.signRsaPssSha256Async(
        signaturePayload,
        maliciousUser.privateKey,
      );
      maliciousMessage.signature = signature;

      // Encrypt for victim user
      const messageBytes =
        LiftLog.Ui.Models.InboxMessageDao.encode(maliciousMessage).finish();
      const encryptedMaliciousMessage =
        await encryptionService.encryptRsaOaepSha256Async(
          messageBytes,
          victimUser.user.publicKey,
        );

      const inboxMessageResponse: GetInboxMessageResponse = {
        id: '00000000-0000-0000-0000-000000000000',
        encryptedMessage: encryptedMaliciousMessage.dataChunks,
      };

      // Attempt to decrypt - should fail because signature doesn't match claimed sender
      const decryptedMaliciousMessage = await sut.decryptIfValid(
        victimUser.identity,
        inboxMessageResponse,
      );

      expect(decryptedMaliciousMessage).toBeNull();
    });

    it('should allow a valid message to be decrypted', async () => {
      // Create a valid message where fromUserId and signature match
      const validMessage = LiftLog.Ui.Models.InboxMessageDao.create({
        fromUserId: toUuidDao(thirdPartyUser.user.id),
        followRequest: LiftLog.Ui.Models.FollowRequestDao.create({
          name: toStringValue(thirdPartyUser.user.name || 'Third Party User'),
        }),
      });

      // Sign with the correct user's private key
      const signaturePayload = FeedInboxDecryptionService.getSignaturePayload(
        validMessage,
        victimUser.user.id,
      );
      const signature = await encryptionService.signRsaPssSha256Async(
        signaturePayload,
        thirdPartyUser.privateKey,
      );
      validMessage.signature = signature;

      // Encrypt for victim user
      const messageBytes =
        LiftLog.Ui.Models.InboxMessageDao.encode(validMessage).finish();
      const encryptedValidMessage =
        await encryptionService.encryptRsaOaepSha256Async(
          messageBytes,
          victimUser.user.publicKey,
        );

      const inboxMessageResponse: GetInboxMessageResponse = {
        id: '00000000-0000-0000-0000-000000000000',
        encryptedMessage: encryptedValidMessage.dataChunks,
      };

      // Decrypt - should succeed because signature matches claimed sender
      const decryptedValidMessage = await sut.decryptIfValid(
        victimUser.identity,
        inboxMessageResponse,
      );

      expect(decryptedValidMessage).not.toBeNull();
      expect(decryptedValidMessage?.followRequest?.name?.value).toBe(
        thirdPartyUser.user.name || 'Third Party User',
      );
    });
  });
});

async function createFeedUser(
  encryptionService: EncryptionService,
): Promise<UserAndPrivateKey> {
  const rsaKeyPair = await encryptionService.generateRsaKeys();
  const aesKey = await encryptionService.generateAesKey();
  const userId = crypto.randomUUID();

  const feedUser = FeedUser.fromShared(
    userId,
    rsaKeyPair.publicKey,
    'Some user',
  ).with({
    aesKey: aesKey,
  });

  const identity = new FeedIdentity(
    feedUser.id,
    feedUser.id,
    feedUser.aesKey!,
    { publicKey: feedUser.publicKey, privateKey: rsaKeyPair.privateKey },
    'password',
    feedUser.name,
    undefined, // profilePicture
    true, // publishBodyweight
    true, // publishPlan
    true, // publishWorkouts
  );

  return {
    user: feedUser,
    identity: identity,
    privateKey: rsaKeyPair.privateKey,
  };
}

function toGetUserResponse(
  userAndPrivateKey: UserAndPrivateKey,
): GetUserResponse {
  return {
    id: userAndPrivateKey.user.id,
    lookup: userAndPrivateKey.user.id,
    encryptedCurrentPlan: undefined,
    encryptedProfilePicture: undefined,
    encryptedName: undefined,
    encryptionIV: new Uint8Array(16),
    rsaPublicKey: userAndPrivateKey.user.publicKey.spkiPublicKeyBytes,
  };
}
