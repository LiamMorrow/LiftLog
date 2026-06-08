import { EncryptionService, fromJsonBytes } from './encryption-service';
import { RsaPublicKey } from '@/models/encryption-models';
import { FeedApiService } from './feed-api';
import {
  FeedIdentity,
  fromInboxMessageJSON,
  InboxMessage,
} from '@/models/feed-models';
import { GetInboxMessageResponse } from '@/models/feed-api-models';
import {
  fromBase64Uint8ArrayJSON,
  InboxMessageJSON,
} from '@/models/storage/versions/latest';
import { AnyVersionInboxMessageJSON } from '@/models/storage/versions/any';
import { inboxMessageMigrations } from '@/models/storage/versions/migrations';

export class FeedInboxDecryptionService {
  constructor(
    private encryptionService: EncryptionService,
    private feedApiService: FeedApiService,
  ) {}

  async decryptIfValid(
    identity: FeedIdentity,
    inboxMessage: GetInboxMessageResponse,
  ): Promise<InboxMessage | null> {
    try {
      const decrypted = await this.encryptionService.decryptRsaOaepSha256Async(
        { dataChunks: inboxMessage.encryptedMessage },
        identity.rsaKeyPair.privateKey,
      );

      const unverifiedInboxMessage =
        fromJsonBytes<AnyVersionInboxMessageJSON>(decrypted);

      // We know the message is delivered TO us (as we decrypted it with our private key)
      // Now we need to verify that the sender is who they say they are by checking with the public key against their user
      const signedPayload = FeedInboxDecryptionService.getSignaturePayload(
        unverifiedInboxMessage,
        identity.id,
      );
      const senderUserId = unverifiedInboxMessage.senderUserId;
      const publicKey = await this.getUserPublicKey(senderUserId);

      const verified = await this.encryptionService.verifyRsaPssSha256Async(
        signedPayload,
        fromBase64Uint8ArrayJSON(unverifiedInboxMessage.signature),
        publicKey,
      );

      if (!verified) {
        throw new Error('Failed to verify inbox message signature');
      }

      return fromInboxMessageJSON(
        inboxMessageMigrations.migrate(unverifiedInboxMessage),
      );
    } catch (error) {
      console.error('Failed to decrypt inbox message', error);
      return null;
    }
  }

  static getSignaturePayload(
    inboxMessage: Omit<InboxMessageJSON, 'signature'>,
    toUserId: string,
  ): Uint8Array {
    const payloadBytes = new TextEncoder().encode(inboxMessage.payloadJson);
    const senderUserIdBytes = new TextEncoder().encode(
      inboxMessage.senderUserId,
    );
    const toUserIdBytes = new TextEncoder().encode(toUserId);

    // Combine all bytes
    const combined = new Uint8Array(
      payloadBytes.length + senderUserIdBytes.length + toUserIdBytes.length,
    );
    combined.set(payloadBytes, 0);
    combined.set(senderUserIdBytes, payloadBytes.length);
    combined.set(toUserIdBytes, payloadBytes.length + senderUserIdBytes.length);

    return combined;
  }

  private async getUserPublicKey(userId: string): Promise<RsaPublicKey> {
    const userResponse = await this.feedApiService.getUserAsync(userId);
    if (!userResponse.isSuccess()) {
      throw new Error('Failed to fetch user for public key');
    }
    return { spkiPublicKeyBytes: userResponse.data.rsaPublicKey };
  }
}
