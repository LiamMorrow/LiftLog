import { FeedApiService } from './feed-api';
import { EncryptionService } from './encryption-service';
import { FeedIdentity, FeedUser, FollowRequest } from '@/models/feed-models';
import { RsaPublicKey } from '@/models/encryption-models';
import {
  PutInboxMessageRequest,
  PutUserFollowSecretRequest,
  DeleteUserFollowSecretRequest,
} from '@/models/feed-api-models';
import { LiftLog } from '@/gen/proto';
import { FeedInboxDecryptionService } from './feed-inbox-decryption-service';
import { uuid } from '@/utils/uuid';
import { toStringValue, toUuidDao } from '@/models/storage/conversions.to-dao';
import { ApiResult } from '@/services/api-error';

export class FeedFollowService {
  constructor(
    private feedApiService: FeedApiService,
    private encryptionService: EncryptionService,
  ) {}

  async requestToFollowAUserAsync(
    identity: FeedIdentity,
    toFollow: FeedUser,
  ): Promise<ApiResult<void>> {
    const inboxMessage = LiftLog.Ui.Models.InboxMessageDao.create({
      fromUserId: toUuidDao(identity.id),
      followRequest: {
        name: toStringValue(identity.name),
      },
    });

    const signaturePayload = FeedInboxDecryptionService.getSignaturePayload(
      inboxMessage,
      toFollow.id,
    );
    const signature = await this.encryptionService.signRsaPssSha256Async(
      signaturePayload,
      identity.rsaKeyPair.privateKey,
    );
    inboxMessage.signature = signature;

    const messageBytes =
      LiftLog.Ui.Models.InboxMessageDao.encode(inboxMessage).finish();
    const encryptedMessage =
      await this.encryptionService.encryptRsaOaepSha256Async(
        messageBytes,
        toFollow.publicKey,
      );

    const response = await this.feedApiService.putInboxMessageAsync({
      toUserId: toFollow.id,
      encryptedMessage: encryptedMessage.dataChunks,
    } as PutInboxMessageRequest);

    return response;
  }

  async acceptFollowRequestAsync(
    identity: FeedIdentity,
    request: FollowRequest,
    userPublicKey: RsaPublicKey,
  ): Promise<ApiResult<string>> {
    const followSecret = uuid();
    const putFollowSecretResponse =
      await this.feedApiService.putUserFollowSecretAsync({
        userId: identity.id,
        password: identity.password,
        followSecret: followSecret,
      } as PutUserFollowSecretRequest);

    if (!putFollowSecretResponse.isSuccess()) {
      return ApiResult.fromFailure(putFollowSecretResponse);
    }

    const inboxMessage = LiftLog.Ui.Models.InboxMessageDao.create({
      fromUserId: toUuidDao(identity.id),
      followResponse: {
        accepted: {
          aesKey: identity.aesKey.value,
          followSecret: followSecret,
        },
      },
    });

    const signaturePayload = FeedInboxDecryptionService.getSignaturePayload(
      inboxMessage,
      request.userId,
    );
    const signature = await this.encryptionService.signRsaPssSha256Async(
      signaturePayload,
      identity.rsaKeyPair.privateKey,
    );
    inboxMessage.signature = signature;

    const messageBytes =
      LiftLog.Ui.Models.InboxMessageDao.encode(inboxMessage).finish();
    const encryptedMessage =
      await this.encryptionService.encryptRsaOaepSha256Async(
        messageBytes,
        userPublicKey,
      );

    const putResponse = await this.feedApiService.putInboxMessageAsync({
      toUserId: request.userId,
      encryptedMessage: encryptedMessage.dataChunks,
    } as PutInboxMessageRequest);

    if (!putResponse.isSuccess()) {
      return ApiResult.fromFailure(putResponse);
    }

    return ApiResult.success(followSecret);
  }

  async denyFollowRequestAsync(
    identity: FeedIdentity,
    request: FollowRequest,
    userPublicKey: RsaPublicKey,
  ): Promise<ApiResult<void>> {
    const inboxMessage = LiftLog.Ui.Models.InboxMessageDao.create({
      fromUserId: toUuidDao(identity.id),
      followResponse: {
        rejected: {},
      },
    });

    const signaturePayload = FeedInboxDecryptionService.getSignaturePayload(
      inboxMessage,
      request.userId,
    );
    const signature = await this.encryptionService.signRsaPssSha256Async(
      signaturePayload,
      identity.rsaKeyPair.privateKey,
    );
    inboxMessage.signature = signature;

    try {
      const messageBytes =
        LiftLog.Ui.Models.InboxMessageDao.encode(inboxMessage).finish();
      const encryptedMessage =
        await this.encryptionService.encryptRsaOaepSha256Async(
          messageBytes,
          userPublicKey,
        );

      const putResponse = await this.feedApiService.putInboxMessageAsync({
        toUserId: request.userId,
        encryptedMessage: encryptedMessage.dataChunks,
      } as PutInboxMessageRequest);

      return putResponse;
    } catch (error) {
      console.error('Failed to encrypt inbox message', error);
      return ApiResult.fromError({
        type: 4, // ApiErrorType.EncryptionError
        message: 'Failed to encrypt inbox message',
        exception: error,
      });
    }
  }

  async revokeFollowSecretAsync(
    identity: FeedIdentity,
    followSecret: string,
  ): Promise<ApiResult<void>> {
    const putResponse = await this.feedApiService.deleteUserFollowSecretAsync({
      userId: identity.id,
      password: identity.password,
      followSecret: followSecret,
    } as DeleteUserFollowSecretRequest);

    return putResponse;
  }
}
