import { Instant } from '@js-joda/core';
import { FeedApiService } from './feed-api';
import { EncryptionService, toJsonBytes } from './encryption-service';
import { FeedIdentity, Reaction } from '@/models/feed-models';
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

const MAX_NAME_LENGTH = 100;
const MAX_SHARED_KEYS = 20;

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

  friendRequestMessage(identity: FeedIdentity, recipient: InboxRecipient): Promise<OutboxMessage> {
    return this.buildMessage('FriendRequest', identity, recipient, {
      name: identity.name?.slice(0, MAX_NAME_LENGTH),
    });
  }

  friendKeysMessage(identity: FeedIdentity, recipient: InboxRecipient, mySecret: string): Promise<OutboxMessage> {
    const keys = [identity.aesKey, ...identity.previousAesKeys.map((x) => x.key)].slice(0, MAX_SHARED_KEYS);
    return this.buildMessage('FriendKeys', identity, recipient, {
      aesKeys: keys.map(toAesKeyJSON),
      followSecret: mySecret,
    });
  }

  friendRejectMessage(identity: FeedIdentity, recipient: InboxRecipient): Promise<OutboxMessage> {
    return this.buildMessage('FriendReject', identity, recipient, {});
  }

  unfriendMessage(identity: FeedIdentity, recipient: InboxRecipient): Promise<OutboxMessage> {
    return this.buildMessage('Unfriend', identity, recipient, {});
  }

  reactionMessage(identity: FeedIdentity, recipient: InboxRecipient, reaction: Reaction): Promise<OutboxMessage> {
    return this.buildMessage('Reaction', identity, recipient, reaction.toJSON());
  }

  legacyFollowRejectionMessage(identity: FeedIdentity, recipient: InboxRecipient): Promise<OutboxMessage> {
    return this.buildMessage('FollowResponse', identity, recipient, { response: { type: 'RejectedFollowResponse' } });
  }

  async issueFollowSecretAsync(identity: FeedIdentity): Promise<ApiResult<string>> {
    const followSecret = uuid();
    const result = await this.feedApiService.putUserFollowSecretAsync({
      userId: identity.id,
      password: identity.password,
      followSecret,
    });
    return result.isSuccess() ? ApiResult.success(followSecret) : ApiResult.fromFailure(result);
  }

  async revokeFollowSecretAsync(identity: FeedIdentity, followSecret: string): Promise<ApiResult<void>> {
    return this.feedApiService.deleteUserFollowSecretAsync({
      userId: identity.id,
      password: identity.password,
      followSecret: followSecret,
    });
  }
}
