import { FeedApiService } from './feed-api';
import { EncryptionService, joinNonceAndCiphertext, toJsonBytes } from './encryption-service';
import { FeedIdentity } from '@/models/feed-models';
import { ProgramBlueprint } from '@/models/blueprint-models';
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
    publishPlan: boolean,
    publishWorkouts: boolean,
    currentPlan: ProgramBlueprint | undefined,
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
      publishPlan,
      publishWorkouts,
    );
    const published = await this.publishProfileAsync(identity, currentPlan);
    return published.isSuccess() ? ApiResult.success(identity) : ApiResult.fromFailure(published);
  }

  async publishProfileAsync(
    identity: FeedIdentity,
    currentPlan: ProgramBlueprint | undefined,
  ): Promise<ApiResult<void>> {
    const { aesKey, rsaKeyPair, name, publishPlan } = identity;
    const nameBytes = name ? new TextEncoder().encode(name) : undefined;
    const planBytes = publishPlan && currentPlan ? toJsonBytes(currentPlan.toJSON()) : undefined;
    const encrypted = await match(aesKey.algorithm)
      .with('AES-GCM', () => this.encryptGcmProfileAsync(identity, nameBytes, planBytes))
      .with('AES-CBC', () => this.encryptCbcProfileAsync(identity, nameBytes, planBytes))
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
    planBytes: Uint8Array | undefined,
  ): Promise<EncryptedProfile> {
    const encrypt = async (bytes: Uint8Array | undefined) =>
      bytes &&
      joinNonceAndCiphertext(await this.encryptionService.signAndEncryptAsync(bytes, aesKey, rsaKeyPair.privateKey));
    return {
      encryptedName: await encrypt(nameBytes),
      encryptedCurrentPlan: await encrypt(planBytes),
      encryptionIV: new Uint8Array(),
    };
  }

  private async encryptCbcProfileAsync(
    { aesKey, rsaKeyPair }: FeedIdentity,
    nameBytes: Uint8Array | undefined,
    planBytes: Uint8Array | undefined,
  ): Promise<EncryptedProfile> {
    const privateKey = rsaKeyPair.privateKey;
    const name =
      nameBytes && (await this.encryptionService.signAndEncryptWithCbcIvAsync(nameBytes, aesKey, privateKey));
    const plan =
      planBytes && (await this.encryptionService.signAndEncryptWithCbcIvAsync(planBytes, aesKey, privateKey, name?.iv));
    return {
      encryptedName: name?.encryptedPayload,
      encryptedCurrentPlan: plan?.encryptedPayload,
      encryptionIV: (name ?? plan)?.iv.value ?? new Uint8Array(),
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
