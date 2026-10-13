import { Instant } from '@js-joda/core';
import { FeedApiService } from './feed-api';
import { EncryptionService, toJsonBytes } from './encryption-service';
import { FeedIdentity, FollowedFeedUser, FollowRequestInboxMessage, Reaction } from '@/models/feed-models';
import { RsaPublicKey } from '@/models/encryption-models';
import { FeedInboxDecryptionService } from './feed-inbox-decryption-service';
import { uuid } from '@/utils/uuid';
import { ApiResult } from '@/services/api-error';
import {
  InboxDeliveryJSON,
  InboxMessageJSON,
  JsonString,
  toAesKeyJSON,
  toBase64Uint8ArrayJSON,
  toInstantJson,
  toJsonString,
} from '@/models/storage/versions/latest';
import { OutboxMessage } from '@/db/feed-outbox';

type InboxMessageType = InboxMessageJSON['type'];
type InboxPayload<T extends InboxMessageType> =
  Extract<InboxMessageJSON, { type: T }>['payloadJson'] extends JsonString<infer P> ? P : never;

export interface InboxRecipient {
  id: string;
  publicKey: RsaPublicKey;
}

export class FeedFollowService {
  constructor(
    private feedApiService: FeedApiService,
    private encryptionService: EncryptionService,
  ) {}

  async buildMessage<T extends InboxMessageType>(
    type: T,
    identity: FeedIdentity,
    recipient: InboxRecipient,
    payload: InboxPayload<T>,
  ): Promise<OutboxMessage> {
    const messageId = uuid();
    const delivery: InboxDeliveryJSON = { messageId, sentAt: toInstantJson(Instant.now()) };
    const payloadJson = toJsonString({ ...(payload as object), ...delivery }) as unknown as Extract<
      InboxMessageJSON,
      { type: T }
    >['payloadJson'];
    const unsignedInboxMessage: Omit<InboxMessageJSON, 'signature'> = {
      type,
      payloadJson,
      senderUserId: identity.id,
    };

    const signaturePayload = FeedInboxDecryptionService.getSignaturePayload(unsignedInboxMessage, recipient.id);
    const signature = await this.encryptionService.signRsaPssSha256Async(
      signaturePayload,
      identity.rsaKeyPair.privateKey,
    );
    const messageBytes = toJsonBytes({
      ...unsignedInboxMessage,
      signature: toBase64Uint8ArrayJSON(signature),
    });
    const encryptedMessage = await this.encryptionService.encryptRsaOaepSha256Async(messageBytes, recipient.publicKey);

    return { messageId, recipientId: recipient.id, type, encryptedMessage: encryptedMessage.dataChunks };
  }

  followRequestMessage(identity: FeedIdentity, toFollow: InboxRecipient): Promise<OutboxMessage> {
    return this.buildMessage('FollowRequest', identity, toFollow, { name: identity.name });
  }

  unfollowMessage(identity: FeedIdentity, userToUnfollow: FollowedFeedUser): Promise<OutboxMessage> {
    return this.buildMessage('UnfollowNotification', identity, userToUnfollow, {
      followSecret: userToUnfollow.followSecret,
    });
  }

  reactionMessage(identity: FeedIdentity, recipient: InboxRecipient, reaction: Reaction): Promise<OutboxMessage> {
    return this.buildMessage('Reaction', identity, recipient, reaction.toJSON());
  }

  denyFollowRequestMessage(
    identity: FeedIdentity,
    request: FollowRequestInboxMessage,
    userPublicKey: RsaPublicKey,
  ): Promise<OutboxMessage> {
    return this.buildMessage(
      'FollowResponse',
      identity,
      { id: request.senderUserId, publicKey: userPublicKey },
      { response: { type: 'RejectedFollowResponse' } },
    );
  }

  async acceptFollowRequestAsync(
    identity: FeedIdentity,
    request: FollowRequestInboxMessage,
    userPublicKey: RsaPublicKey,
  ): Promise<ApiResult<{ followSecret: string; message: OutboxMessage }>> {
    const followSecret = uuid();
    const putFollowSecretResponse = await this.feedApiService.putUserFollowSecretAsync({
      userId: identity.id,
      password: identity.password,
      followSecret: followSecret,
    });

    if (!putFollowSecretResponse.isSuccess()) {
      return ApiResult.fromFailure(putFollowSecretResponse);
    }

    const message = await this.buildMessage(
      'FollowResponse',
      identity,
      { id: request.senderUserId, publicKey: userPublicKey },
      {
        response: {
          type: 'AcceptedFollowResponse',
          aesKey: toAesKeyJSON(identity.aesKey),
          followSecret: followSecret,
        },
      },
    );

    return ApiResult.success({ followSecret, message });
  }

  async revokeFollowSecretAsync(identity: FeedIdentity, followSecret: string): Promise<ApiResult<void>> {
    return this.feedApiService.deleteUserFollowSecretAsync({
      userId: identity.id,
      password: identity.password,
      followSecret: followSecret,
    });
  }
}
