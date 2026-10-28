import { FeedApiService } from './feed-api';
import { EncryptionService, joinNonceAndCiphertext } from './encryption-service';
import { FeedIdentity } from '@/models/feed-models';
import { PutUserDataRequest } from '@/models/feed-api-models';
import { ApiResult } from '@/services/api-error';
import { match } from 'ts-pattern';

type EncryptedProfile = Pick<PutUserDataRequest, 'encryptedName' | 'encryptedCurrentPlan' | 'encryptionIV'>;

export class FeedIdentityService {
  constructor(
    private feedApiService: FeedApiService,
    private encryptionService: EncryptionService,
  ) {}

  async createFeedIdentityAsync(
    name: string | undefined,
    publishBodyweight: boolean,
    publishWorkouts: boolean,
    shareLiveWorkouts = false,
  ): Promise<ApiResult<FeedIdentity>> {
    const response = await this.feedApiService.createUserAsync();
    if (!response.isSuccess()) {
      return ApiResult.fromFailure(response);
    }
    const identity = new FeedIdentity(
      response.data.id,
      response.data.lookup,
      await this.encryptionService.generateAesKey(),
      await this.encryptionService.generateRsaKeys(),
      response.data.password,
      name,
      publishBodyweight,
      false,
      publishWorkouts,
      [],
      shareLiveWorkouts,
    );
    const published = await this.publishProfileAsync(identity);
    return published.isSuccess() ? ApiResult.success(identity) : ApiResult.fromFailure(published);
  }

  async publishProfileAsync(identity: FeedIdentity): Promise<ApiResult<void>> {
    const { aesKey, rsaKeyPair, name } = identity;
    const nameBytes = name ? new TextEncoder().encode(name) : undefined;
    const encrypted = await match(aesKey.algorithm)
      .with('AES-GCM', () => this.encryptGcmProfileAsync(identity, nameBytes))
      .with('AES-CBC', () => this.encryptCbcProfileAsync(identity, nameBytes))
      .exhaustive();

    return this.feedApiService.putUserDataAsync({
      id: identity.id,
      password: identity.password,
      ...encrypted,
      rsaPublicKey: rsaKeyPair.publicKey.spkiPublicKeyBytes,
    });
  }

  private async encryptGcmProfileAsync(
    { aesKey, rsaKeyPair }: FeedIdentity,
    nameBytes: Uint8Array | undefined,
  ): Promise<EncryptedProfile> {
    return {
      encryptedName:
        nameBytes &&
        joinNonceAndCiphertext(
          await this.encryptionService.signAndEncryptAsync(nameBytes, aesKey, rsaKeyPair.privateKey),
        ),
      encryptedCurrentPlan: undefined,
      encryptionIV: new Uint8Array(),
    };
  }

  private async encryptCbcProfileAsync(
    { aesKey, rsaKeyPair }: FeedIdentity,
    nameBytes: Uint8Array | undefined,
  ): Promise<EncryptedProfile> {
    const name =
      nameBytes &&
      (await this.encryptionService.signAndEncryptWithCbcIvAsync(nameBytes, aesKey, rsaKeyPair.privateKey));
    return {
      encryptedName: name?.encryptedPayload,
      encryptedCurrentPlan: undefined,
      encryptionIV: name?.iv.value ?? new Uint8Array(),
    };
  }

  async deleteFeedIdentityAsync(identity: FeedIdentity): Promise<ApiResult<void>> {
    const response = await this.feedApiService.deleteUserAsync({
      id: identity.id,
      password: identity.password,
    });

    return response;
  }
}
