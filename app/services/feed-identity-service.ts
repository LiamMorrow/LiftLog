import { FeedApiService } from './feed-api';
import { EncryptionService } from './encryption-service';
import { AesKey, RsaKeyPair } from '@/models/encryption-models';
import { DeleteUserRequest } from '@/models/feed-api-models';
import { FeedIdentity } from '@/models/feed-models';
import { SessionBlueprint } from '@/models/blueprint-models';
import { toCurrentPlanDao } from '@/models/storage/conversions.to-dao';
import { LiftLog } from '@/gen/proto';
import { ApiResult } from '@/services/api-error';

export class FeedIdentityService {
  constructor(
    private feedApiService: FeedApiService,
    private encryptionService: EncryptionService,
  ) {}

  async createFeedIdentityAsync(
    name: string | undefined,
    profilePicture: Uint8Array | undefined,
    publishBodyweight: boolean,
    publishPlan: boolean,
    publishWorkouts: boolean,
    currentPlan: SessionBlueprint[],
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
      profilePicture,
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
    profilePicture: Uint8Array | undefined,
    publishBodyweight: boolean,
    publishPlan: boolean,
    publishWorkouts: boolean,
    currentPlan: SessionBlueprint[],
  ): Promise<ApiResult<FeedIdentity>> {
    const privateKey = rsaKeyPair.privateKey;
    const { iv } =
      await this.encryptionService.signRsa256PssAndEncryptAesCbcAsync(
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

    const encryptedProfilePicture = profilePicture
      ? (
          await this.encryptionService.signRsa256PssAndEncryptAesCbcAsync(
            profilePicture,
            aesKey,
            privateKey,
            iv,
          )
        ).encryptedPayload
      : undefined;
    const currentPlanDao = toCurrentPlanDao(currentPlan);
    const currentPlanBytes =
      LiftLog.Ui.Models.CurrentPlanDaoV1.encode(currentPlanDao).finish();
    const encryptedCurrentPlan = publishPlan
      ? (
          await this.encryptionService.signRsa256PssAndEncryptAesCbcAsync(
            currentPlanBytes,
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
      encryptedProfilePicture,
      encryptionIV: iv.value,
      rsaPublicKey: rsaKeyPair.publicKey.spkiPublicKeyBytes,
    });

    if (!result.isSuccess()) {
      return ApiResult.fromFailure(result);
    }

    return ApiResult.success(
      new FeedIdentity(
        id,
        lookup,
        aesKey,
        rsaKeyPair,
        password,
        name,
        profilePicture,
        publishBodyweight,
        publishPlan,
        publishWorkouts,
      ),
    );
  }

  async deleteFeedIdentityAsync(
    identity: FeedIdentity,
  ): Promise<ApiResult<void>> {
    const response = await this.feedApiService.deleteUserAsync({
      id: identity.id,
      password: identity.password,
    } as DeleteUserRequest);

    return response;
  }
}
