import { FeedApiService } from './feed-api';
import { EncryptionService, toJsonBytes } from './encryption-service';
import { FeedIdentity } from '@/models/feed-models';
import { ProgramBlueprint } from '@/models/blueprint-models';
import { ApiResult } from '@/services/api-error';

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
    const privateKey = rsaKeyPair.privateKey;
    const { iv } = await this.encryptionService.signRsa256PssAndEncryptAesCbcAsync(
      new Uint8Array([1]),
      aesKey,
      privateKey,
    );

    const encryptedName = name
      ? (
          await this.encryptionService.signRsa256PssAndEncryptAesCbcAsync(
            new TextEncoder().encode(name),
            aesKey,
            privateKey,
            iv,
          )
        ).encryptedPayload
      : undefined;

    const encryptedCurrentPlan =
      publishPlan && currentPlan
        ? (
            await this.encryptionService.signRsa256PssAndEncryptAesCbcAsync(
              toJsonBytes(currentPlan.toJSON()),
              aesKey,
              privateKey,
              iv,
            )
          ).encryptedPayload
        : undefined;

    return this.feedApiService.putUserDataAsync({
      id: identity.id,
      password: identity.password,
      encryptedCurrentPlan,
      encryptedName,
      encryptionIV: iv.value,
      rsaPublicKey: rsaKeyPair.publicKey.spkiPublicKeyBytes,
    });
  }

  async deleteFeedIdentityAsync(identity: FeedIdentity): Promise<ApiResult<void>> {
    const response = await this.feedApiService.deleteUserAsync({
      id: identity.id,
      password: identity.password,
    });

    return response;
  }
}
