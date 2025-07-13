import { LiftLog } from '@/gen/proto';
import { EncryptionService } from './encryption-service';
import { RsaPublicKey } from '@/models/encryption-models';
import { FeedApiService } from './feed-api';
import { FeedIdentity } from '@/models/feed-models';
import { GetInboxMessageResponse } from '@/models/feed-api-models';
import { toUuidDao } from '@/models/storage/conversions.to-dao';
import { fromUuidDao } from '@/models/storage/conversions.from-dao';

export class FeedInboxDecryptionService {
  constructor(
    private encryptionService: EncryptionService,
    private feedApiService: FeedApiService,
  ) {}

  async decryptIfValid(
    identity: FeedIdentity,
    inboxMessage: GetInboxMessageResponse,
  ): Promise<LiftLog.Ui.Models.InboxMessageDao | null> {
    try {
      const decrypted = await this.encryptionService.decryptRsaOaepSha256Async(
        { dataChunks: inboxMessage.encryptedMessage },
        identity.rsaKeyPair.privateKey,
      );

      const unverifiedInboxMessage =
        LiftLog.Ui.Models.InboxMessageDao.decode(decrypted);

      if (
        !unverifiedInboxMessage.signature ||
        unverifiedInboxMessage.signature.length === 0
      ) {
        // Temporary until majority of users have updated to new version
        return unverifiedInboxMessage;
      }

      // We know the message is delivered TO us (as we decrypted it with our private key)
      // Now we need to verify that the sender is who they say they are by checking with the public key against their user
      const signedPayload = FeedInboxDecryptionService.getSignaturePayload(
        unverifiedInboxMessage,
        identity.id,
      );
      const fromUserId = fromUuidDao(unverifiedInboxMessage.fromUserId);
      const publicKey = await this.getUserPublicKey(fromUserId);

      const verified = await this.encryptionService.verifyRsaPssSha256Async(
        signedPayload,
        unverifiedInboxMessage.signature,
        publicKey,
      );

      if (!verified) {
        throw new Error('Failed to verify inbox message signature');
      }

      return unverifiedInboxMessage;
    } catch (error) {
      console.error('Failed to decrypt inbox message', error);
      return null;
    }
  }

  static getSignaturePayload(
    inboxMessage: LiftLog.Ui.Models.InboxMessageDao,
    toUserId: string,
  ): Uint8Array {
    const payloadBytes = this.getPayloadBytes(inboxMessage);
    const fromUserIdBytes = toUuidDao(
      fromUuidDao(inboxMessage.fromUserId),
    ).value!;
    const toUserIdBytes = toUuidDao(toUserId).value!;

    // Combine all bytes
    const combined = new Uint8Array(
      payloadBytes.length + fromUserIdBytes.length + toUserIdBytes.length,
    );
    combined.set(payloadBytes, 0);
    combined.set(fromUserIdBytes, payloadBytes.length);
    combined.set(toUserIdBytes, payloadBytes.length + fromUserIdBytes.length);

    return combined;
  }

  private static getPayloadBytes(
    inboxMessage: LiftLog.Ui.Models.InboxMessageDao,
  ): Uint8Array {
    // Create a copy without the signature for payload calculation
    const messageForPayload = LiftLog.Ui.Models.InboxMessageDao.create({
      ...inboxMessage,
      signature: null,
    });

    return LiftLog.Ui.Models.InboxMessageDao.encode(messageForPayload).finish();
  }

  private async getUserPublicKey(userId: string): Promise<RsaPublicKey> {
    const userResponse = await this.feedApiService.getUserAsync(userId);
    if (!userResponse.isSuccess()) {
      throw new Error('Failed to fetch user for public key');
    }
    return { spkiPublicKeyBytes: userResponse.data.rsaPublicKey };
  }
}
