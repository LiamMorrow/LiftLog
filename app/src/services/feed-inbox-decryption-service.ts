import { EncryptionService, fromJsonBytes } from './encryption-service';
import { FeedApiService } from './feed-api';
import { FeedIdentity, fromInboxMessageJSON } from '@/models/feed-models';
import { GetInboxMessageResponse } from '@/models/feed-api-models';
import {
  fromBase64Uint8ArrayJSON,
  fromInstantJson,
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

    const sender = await this.feedApiService.getUserAsync(unverified.senderUserId);
    if (!sender.isSuccess()) {
      return sender.error?.type === ApiErrorType.NotFound
        ? invalid('sender no longer exists')
        : { kind: 'retry', serverId };
    }

    try {
      const verified = await this.encryptionService.verifyRsaPssSha256Async(
        FeedInboxDecryptionService.getSignaturePayload(unverified, identity.id),
        fromBase64Uint8ArrayJSON(unverified.signature),
        { spkiPublicKeyBytes: sender.data.rsaPublicKey },
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
