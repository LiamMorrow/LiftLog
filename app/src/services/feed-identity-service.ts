import { FeedApiService } from './feed-api';
import { EncryptionService, toJsonBytes } from './encryption-service';
import { AesKey, RsaKeyPair } from '@/models/encryption-models';
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
    const aesKey = await this.encryptionService.generateAesKey();
    const rsaKeyPair = await this.encryptionService.generateRsaKeys();
    return this.updateFeedIdentityAsync(
      response.data.id,
      response.data.lookup,
      response.data.password,
      aesKey,
      rsaKeyPair,
      name,
      publishBodyweight,
      publishPlan,
      publishWorkouts,
      currentPlan,
    );
  }

  async updateFeedIdentityAsync(
    id: string,
    lookup: string,
    password: string,
    aesKey: AesKey,
    rsaKeyPair: RsaKeyPair,
    name: string | undefined,
    publishBodyweight: boolean,
    publishPlan: boolean,
    publishWorkouts: boolean,
    currentPlan: ProgramBlueprint | undefined,
  ): Promise<ApiResult<FeedIdentity>> {
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

    const result = await this.feedApiService.putUserDataAsync({
      id,
      password,
      encryptedCurrentPlan,
      encryptedName,
      encryptionIV: iv.value,
      rsaPublicKey: rsaKeyPair.publicKey.spkiPublicKeyBytes,
    });

    if (!result.isSuccess()) {
      return ApiResult.fromFailure(result);
    }

    return ApiResult.success(
      new FeedIdentity(id, lookup, aesKey, rsaKeyPair, password, name, publishBodyweight, publishPlan, publishWorkouts),
    );
  }

  async deleteFeedIdentityAsync(identity: FeedIdentity): Promise<ApiResult<void>> {
    const response = await this.feedApiService.deleteUserAsync({
      id: identity.id,
      password: identity.password,
    });

    return response;
  }
}
