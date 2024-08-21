using System.Text;
using Google.Protobuf;
using LiftLog.Lib;
using LiftLog.Lib.Models;
using LiftLog.Lib.Services;
using LiftLog.Ui.Models;
using LiftLog.Ui.Store.Feed;
using Microsoft.Extensions.Logging;

namespace LiftLog.Ui.Services;

public class FeedIdentityService(
    IFeedApiService feedApiService,
    IEncryptionService encryptionService
)
{
    public async Task<ApiResult<FeedIdentity>> CreateFeedIdentityAsync(
        string? name,
        byte[]? profilePicture,
        bool publishBodyweight,
        bool publishPlan,
        bool publishWorkouts,
        ImmutableListValue<SessionBlueprint> currentPlan
    )
    {
        var response = await feedApiService.CreateUserAsync(new CreateUserRequest());
        if (!response.IsSuccess)
        {
            return ApiResult<FeedIdentity>.FromFailure(response);
        }

        var aesKey = await encryptionService.GenerateAesKeyAsync();
        var rsaKeyPair = await encryptionService.GenerateRsaKeysAsync();
        return await UpdateFeedIdentityAsync(
            id: response.Data.Id,
            lookup: response.Data.Lookup,
            password: response.Data.Password,
            aesKey: aesKey,
            rsaKeyPair: rsaKeyPair,
            name: name,
            profilePicture: profilePicture,
            publishBodyweight: publishBodyweight,
            publishPlan: publishPlan,
            publishWorkouts: publishWorkouts,
            currentPlan: currentPlan
        );
    }

    public async Task<ApiResult<FeedIdentity>> UpdateFeedIdentityAsync(
        Guid id,
        string lookup,
        string password,
        AesKey aesKey,
        RsaKeyPair rsaKeyPair,
        string? name,
        byte[]? profilePicture,
        bool publishBodyweight,
        bool publishPlan,
        bool publishWorkouts,
        ImmutableListValue<SessionBlueprint> currentPlan
    )
    {
        var privateKey = rsaKeyPair.PrivateKey;
        var (_, iv) = await encryptionService.SignRsa256PssAndEncryptAesCbcAsync(
            [1],
            aesKey,
            privateKey
        );
        byte[]? encryptedName = name is null
            ? null
            : (
                await encryptionService.SignRsa256PssAndEncryptAesCbcAsync(
                    Encoding.UTF8.GetBytes(name),
                    aesKey,
                    privateKey,
                    iv
                )
            ).EncryptedPayload;
        var encryptedProfilePicture = profilePicture is null
            ? null
            : (
                await encryptionService.SignRsa256PssAndEncryptAesCbcAsync(
                    profilePicture,
                    aesKey,
                    privateKey,
                    iv
                )
            ).EncryptedPayload;

        var currentProgram = (CurrentPlanDaoV1?)currentPlan;
        var encryptedPlan =
            currentProgram is null || !publishPlan
                ? null
                : (
                    await encryptionService.SignRsa256PssAndEncryptAesCbcAsync(
                        currentProgram.ToByteArray(),
                        aesKey,
                        privateKey,
                        iv
                    )
                ).EncryptedPayload;

        var result = await feedApiService.PutUserDataAsync(
            new PutUserDataRequest(
                Id: id,
                Password: password,
                EncryptedCurrentPlan: encryptedPlan,
                EncryptedName: encryptedName,
                EncryptedProfilePicture: encryptedProfilePicture,
                EncryptionIV: iv.Value,
                RsaPublicKey: rsaKeyPair.PublicKey.SpkiPublicKeyBytes
            )
        );
        if (!result.IsSuccess)
        {
            return ApiResult<FeedIdentity>.FromFailure(result);
        }

        return ApiResult.Success(
            new FeedIdentity(
                Id: id,
                Lookup: lookup,
                AesKey: aesKey,
                RsaKeyPair: rsaKeyPair,
                Password: password,
                Name: name,
                ProfilePicture: profilePicture,
                PublishBodyweight: publishBodyweight,
                PublishPlan: publishPlan,
                PublishWorkouts: publishWorkouts
            )
        );
    }

    public async Task<ApiResult> DeleteFeedIdentityAsync(FeedIdentity identity)
    {
        var response = await feedApiService.DeleteUserAsync(
            new DeleteUserRequest(Id: identity.Id, Password: identity.Password)
        );
        return response;
    }
}
