import { EncryptionService, fromJsonBytes } from './encryption-service';
import { FeedApiService } from './feed-api';
import { FeedIdentity, fromInboxMessageJSON } from '@/models/feed-models';
import { GetInboxMessageResponse } from '@/models/feed-api-models';
import {
  fromBase64Uint8ArrayJSON,
  fromInstantJson,
  FriendRequestJSON,
  InboxDeliveryJSON,
  InboxMessageJSON,
} from '@/models/storage/versions/latest';
import { AnyVersionInboxMessageJSON } from '@/models/storage/versions/any';
import { inboxMessageMigrations } from '@/models/storage/versions/migrations';
import { ApiErrorType } from '@/services/api-error';

export type DecryptedInboxMessage =
  | { kind: 'ok'; serverId: string; messageId: string; sentAtMs: number; json: AnyVersionInboxMessageJSON }
  | { kind: 'invalid'; serverId: string }
  | { kind: 'retry'; serverId: string };

export class FeedInboxDecryptionService {
  constructor(
    private encryptionService: EncryptionService,
    private feedApiService: FeedApiService,
  ) {}

  async decrypt(identity: FeedIdentity, inboxMessage: GetInboxMessageResponse): Promise<DecryptedInboxMessage> {
    const serverId = inboxMessage.id;
    const invalid = (reason: string, error?: unknown): DecryptedInboxMessage => {
      console.warn(`Dropping inbox message: ${reason}`, error);
      return { kind: 'invalid', serverId };
    };

    let unverified: AnyVersionInboxMessageJSON;
    try {
      const decrypted = await this.encryptionService.decryptRsaOaepSha256Async(
        { dataChunks: inboxMessage.encryptedMessage },
        identity.rsaKeyPair.privateKey,
      );
      unverified = fromJsonBytes<AnyVersionInboxMessageJSON>(decrypted);
    } catch (error) {
      return invalid('could not decrypt', error);
    }

    if (
      typeof unverified?.senderUserId !== 'string' ||
      typeof unverified.payloadJson !== 'string' ||
      typeof unverified.signature !== 'string'
    ) {
      return invalid('malformed envelope');
    }

    let senderPublicKey: Uint8Array | undefined;
    try {
      senderPublicKey = FeedInboxDecryptionService.publicKeyInFriendRequest(unverified);
    } catch (error) {
      return invalid('unreadable payload', error);
    }
    if (!senderPublicKey) {
      const sender = await this.feedApiService.getUserAsync(unverified.senderUserId);
      if (!sender.isSuccess()) {
        return sender.error?.type === ApiErrorType.NotFound
          ? invalid('sender no longer exists')
          : { kind: 'retry', serverId };
      }
      senderPublicKey = sender.data.rsaPublicKey;
    }

    try {
      const verified = await this.encryptionService.verifyRsaPssSha256Async(
        FeedInboxDecryptionService.getSignaturePayload(unverified, identity.id),
        fromBase64Uint8ArrayJSON(unverified.signature),
        { spkiPublicKeyBytes: senderPublicKey },
      );
      if (!verified) {
        return invalid('bad signature');
      }

      fromInboxMessageJSON(inboxMessageMigrations.migrate(unverified));
      const delivery = JSON.parse(unverified.payloadJson) as Partial<InboxDeliveryJSON>;
      const messageId = typeof delivery.messageId === 'string' ? delivery.messageId : serverId;
      const sentAtMs = delivery.sentAt ? fromInstantJson(delivery.sentAt).toEpochMilli() : 0;

      return { kind: 'ok', serverId, messageId, sentAtMs, json: unverified };
    } catch (error) {
      return invalid('unreadable payload', error);
    }
  }

  private static publicKeyInFriendRequest(message: AnyVersionInboxMessageJSON): Uint8Array | undefined {
    if (message.type !== 'FriendRequest') {
      return undefined;
    }
    const { publicKey } = JSON.parse(message.payloadJson) as Partial<FriendRequestJSON>;
    return typeof publicKey === 'string' ? fromBase64Uint8ArrayJSON(publicKey) : undefined;
  }

  static getSignaturePayload(inboxMessage: Omit<InboxMessageJSON, 'signature'>, toUserId: string): Uint8Array {
    const payloadBytes = new TextEncoder().encode(inboxMessage.payloadJson);
    const senderUserIdBytes = new TextEncoder().encode(inboxMessage.senderUserId);
    const toUserIdBytes = new TextEncoder().encode(toUserId);

    const combined = new Uint8Array(payloadBytes.length + senderUserIdBytes.length + toUserIdBytes.length);
    combined.set(payloadBytes, 0);
    combined.set(senderUserIdBytes, payloadBytes.length);
    combined.set(toUserIdBytes, payloadBytes.length + senderUserIdBytes.length);

    return combined;
  }
}
