using System.Text;
using Fluxor;
using Google.Protobuf;
using LiftLog.Lib.Models;
using LiftLog.Lib.Services;
using LiftLog.Ui.Models;
using LiftLog.Ui.Services;
using LiftLog.Ui.Store.App;
using Microsoft.Extensions.Logging;

namespace LiftLog.Ui.Store.Feed;

public partial class FeedEffects
{
    [EffectMethod]
    public async Task HandleCreateFeedIdentityAction(
        CreateFeedIdentityAction action,
        IDispatcher dispatcher
    )
    {
        if (state.Value.IsLoadingIdentity)
        {
            return;
        }
        dispatcher.Dispatch(new SetIsLoadingIdentityAction(true));
        var response = await feedApiService.CreateUserAsync(new CreateUserRequest(Id: action.Id));
        if (!response.IsSuccess)
        {
            dispatcher.Dispatch(new SetIsLoadingIdentityAction(false));
            // TODO handle properly
            return;
        }
        var encryptionKey = await encryptionService.GenerateAesKeyAsync();
        var (publicKey, privateKey) = await encryptionService.GenerateRsaKeysAsync();
        await GenerateAndPutFeedIdentityAsync(
            dispatcher,
            action.Id,
            response.Data.Password,
            encryptionKey,
            publicKey,
            privateKey,
            action.Name,
            action.ProfilePicture,
            action.PublishBodyweight,
            action.PublishPlan,
            action.PublishWorkouts
        );
        dispatcher.Dispatch(new SetIsLoadingIdentityAction(false));
        if (action.RedirectAfterCreation is not null or "")
        {
            dispatcher.Dispatch(new NavigateAction(action.RedirectAfterCreation));
        }
    }

    [EffectMethod]
    public async Task HandleUpdateFeedIdentityAction(
        UpdateFeedIdentityAction action,
        IDispatcher dispatcher
    )
    {
        if (state.Value.Identity is null)
        {
            return;
        }
        await GenerateAndPutFeedIdentityAsync(
            dispatcher,
            state.Value.Identity.Id,
            state.Value.Identity.Password,
            state.Value.Identity.AesKey,
            state.Value.Identity.PublicKey,
            state.Value.Identity.PrivateKey,
            action.Name,
            action.ProfilePicture,
            action.PublishBodyweight,
            action.PublishPlan,
            action.PublishWorkouts
        );
    }

    [EffectMethod]
    public async Task HandlePublishIdentityIfEnabledAction(
        PublishIdentityIfEnabledAction _,
        IDispatcher dispatcher
    )
    {
        if (state.Value.Identity is null)
        {
            return;
        }
        await GenerateAndPutFeedIdentityAsync(
            dispatcher,
            state.Value.Identity.Id,
            state.Value.Identity.Password,
            state.Value.Identity.AesKey,
            state.Value.Identity.PublicKey,
            state.Value.Identity.PrivateKey,
            state.Value.Identity.Name,
            state.Value.Identity.ProfilePicture,
            state.Value.Identity.PublishBodyweight,
            state.Value.Identity.PublishPlan,
            state.Value.Identity.PublishWorkouts
        );
    }

    [EffectMethod]
    public async Task HandleDeleteFeedIdentityAction(
        DeleteFeedIdentityAction _,
        IDispatcher dispatcher
    )
    {
        var identity = state.Value.Identity;
        if (identity is null)
        {
            return;
        }
        var response = await feedApiService.DeleteUserAsync(
            new DeleteUserRequest(Id: identity.Id, Password: identity.Password)
        );
        if (!response.IsSuccess && response.Error.Type != ApiErrorType.NotFound)
        {
            // TODO handle properly
            return;
        }
        dispatcher.Dispatch(new PutFeedIdentityAction(null));
        dispatcher.Dispatch(new SetIsLoadingIdentityAction(false));
        dispatcher.Dispatch(new ReplaceFeedItemsAction([]));
        dispatcher.Dispatch(new ReplaceFeedFollowedUsersAction([]));
    }

    [EffectMethod]
    public Task PutFeedIdentity(PutFeedIdentityAction action, IDispatcher dispatcher)
    {
        return PersistFeedState();
    }

    [EffectMethod]
    public async Task DeleteFeedUserAction(DeleteFeedUserAction action, IDispatcher dispatcher)
    {
        await PersistFeedState();
        var identity = state.Value.Identity;
        if (identity is null)
        {
            return;
        }
        if (action.FeedUser.FollowSecret is null)
        {
            return;
        }
        var inboxMessage = new InboxMessageDao
        {
            FromUserId = identity.Id,
            UnfollowNotification = new UnFollowNotification
            {
                FollowSecret = action.FeedUser.FollowSecret,
            }
        };
        var encryptedInboxMessage = await encryptionService.EncryptRsaOaepSha256Async(
            inboxMessage.ToByteArray(),
            action.FeedUser.PublicKey
        );
        await feedApiService.PutInboxMessageAsync(
            new PutInboxMessageRequest(
                EncryptedMessage: encryptedInboxMessage.DataChunks,
                ToUserId: action.FeedUser.Id
            )
        );
    }

    private async Task GenerateAndPutFeedIdentityAsync(
        IDispatcher dispatcher,
        Guid id,
        string password,
        AesKey aesKey,
        RsaPublicKey publicKey,
        RsaPrivateKey privateKey,
        string? name,
        byte[]? profilePicture,
        bool publishBodyweight,
        bool publishPlan,
        bool publishWorkouts
    )
    {
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

        var currentProgram = (CurrentPlanDaoV1?)programState.Value.SessionBlueprints;
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
                EncryptionIV: iv.Value
            )
        );
        if (!result.IsSuccess)
        {
            logger.LogError(
                "Failed to put user data for user {Id} with error {Error}",
                id,
                result.Error
            );
            if (result.Error.Type == ApiErrorType.NotFound)
            {
                dispatcher.Dispatch(
                    new CreateFeedIdentityAction(
                        Guid.NewGuid(),
                        name,
                        profilePicture,
                        publishBodyweight,
                        publishPlan,
                        publishWorkouts,
                        null
                    )
                );
                return;
            }
            // TODO handle properly
            return;
        }

        var identity = new FeedIdentity(
            Id: id,
            AesKey: aesKey,
            PublicKey: publicKey,
            PrivateKey: privateKey,
            Password: password,
            Name: name,
            ProfilePicture: profilePicture,
            PublishBodyweight: publishBodyweight,
            PublishPlan: publishPlan,
            PublishWorkouts: publishWorkouts
        );

        dispatcher.Dispatch(new PutFeedIdentityAction(identity));
        // TODO subscribe to self
    }

    private Task IfIdentityExists(
        Func<FeedIdentity, Task> whenIdentityExists,
        Func<Task>? whenNoIdentity = null
    )
    {
        var identity = state.Value.Identity;
        if (identity is null)
        {
            return whenNoIdentity?.Invoke() ?? Task.CompletedTask;
        }
        return whenIdentityExists(identity);
    }
}
