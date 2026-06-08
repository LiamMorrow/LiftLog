import { FeedApiService } from './feed-api';
import { EncryptionService, toJsonBytes } from './encryption-service';
import {
  FeedIdentity,
  FeedUser,
  FollowedFeedUser,
  FollowRequestInboxMessage,
  PendingFeedUser,
} from '@/models/feed-models';
import { RsaPublicKey } from '@/models/encryption-models';
import { FeedInboxDecryptionService } from './feed-inbox-decryption-service';
import { uuid } from '@/utils/uuid';
import { ApiErrorType, ApiResult } from '@/services/api-error';
import {
  InboxMessageJSON,
  toAesKeyJSON,
  toBase64Uint8ArrayJSON,
  toJsonString,
} from '@/models/storage/versions/latest';

export class FeedFollowService {
  constructor(
    private feedApiService: FeedApiService,
    private encryptionService: EncryptionService,
  ) {}

  private async sendMessage<T extends InboxMessageJSON['type']>(
    type: T,
    identity: FeedIdentity,
    recipientUser: FeedUser,
    message: Extract<InboxMessageJSON, { type: T }>['payloadJson'],
  ) {
    const unsignedInboxMessage: Omit<InboxMessageJSON, 'signature'> = {
      type,
      payloadJson: message,
      senderUserId: identity.id,
    };

    const signaturePayload = FeedInboxDecryptionService.getSignaturePayload(
      unsignedInboxMessage,
      recipientUser.id,
    );
    const signature = await this.encryptionService.signRsaPssSha256Async(
      signaturePayload,
      identity.rsaKeyPair.privateKey,
    );
    const inboxMessage = {
      ...unsignedInboxMessage,
      signature: toBase64Uint8ArrayJSON(signature),
    };
    const messageBytes = toJsonBytes(inboxMessage);
    const encryptedMessage =
      await this.encryptionService.encryptRsaOaepSha256Async(
        messageBytes,
        recipientUser.publicKey,
      );

    const response = await this.feedApiService.putInboxMessageAsync({
      toUserId: recipientUser.id,
      encryptedMessage: encryptedMessage.dataChunks,
    });

    return response;
  }

  async requestToFollowAUserAsync(
    identity: FeedIdentity,
    toFollow: FeedUser,
  ): Promise<ApiResult<void>> {
    return this.sendMessage(
      'FollowRequest',
      identity,
      toFollow,
      toJsonString({
        name: identity.name,
      }),
    );
  }

  async unfollowUserAsync(
    identity: FeedIdentity,
    userToUnfollow: FollowedFeedUser,
  ): Promise<ApiResult<void>> {
    return this.sendMessage(
      'UnfollowNotification',
      identity,
      userToUnfollow,
      toJsonString({ followSecret: userToUnfollow.followSecret }),
    );
  }

  async acceptFollowRequestAsync(
    identity: FeedIdentity,
    request: FollowRequestInboxMessage,
    userPublicKey: RsaPublicKey,
  ): Promise<ApiResult<string>> {
    const followSecret = uuid();
    const putFollowSecretResponse =
      await this.feedApiService.putUserFollowSecretAsync({
        userId: identity.id,
        password: identity.password,
        followSecret: followSecret,
      });

    if (!putFollowSecretResponse.isSuccess()) {
      return ApiResult.fromFailure(putFollowSecretResponse);
    }

    const putResponse = await this.sendMessage(
      'FollowResponse',
      identity,
      new PendingFeedUser(request.senderUserId, userPublicKey, undefined),
      toJsonString({
        response: {
          type: 'AcceptedFollowResponse',
          aesKey: toAesKeyJSON(identity.aesKey),
          followSecret: followSecret,
        },
      }),
    );
    if (!putResponse.isSuccess()) {
      return ApiResult.fromFailure(putResponse);
    }

    return ApiResult.success(followSecret);
  }

  async denyFollowRequestAsync(
    identity: FeedIdentity,
    request: FollowRequestInboxMessage,
    userPublicKey: RsaPublicKey,
  ): Promise<ApiResult<void>> {
    try {
      const putResponse = await this.sendMessage(
        'FollowResponse',
        identity,
        new PendingFeedUser(request.senderUserId, userPublicKey, undefined),
        toJsonString({
          response: {
            type: 'RejectedFollowResponse',
          },
        }),
      );

      return putResponse;
    } catch (error) {
      console.error('Failed to encrypt inbox message', error);
      return ApiResult.fromError({
        type: ApiErrorType.EncryptionError,
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
    });

    return putResponse;
  }
}
