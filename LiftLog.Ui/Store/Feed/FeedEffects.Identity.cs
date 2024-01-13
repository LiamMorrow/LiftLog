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
        var identityResult = await feedIdentityService.CreateFeedIdentityAsync(
            action.Name,
            action.ProfilePicture,
            action.PublishBodyweight,
            action.PublishPlan,
            action.PublishWorkouts,
            programState.Value.SessionBlueprints
        );
        dispatcher.Dispatch(new SetIsLoadingIdentityAction(false));
        if (!identityResult.IsSuccess)
        {
            // TODO handle properly
            return;
        }

        dispatcher.Dispatch(new PutFeedIdentityAction(identityResult.Data));

        if (action.RedirectAfterCreation is not null or "")
        {
            dispatcher.Dispatch(new NavigateAction(action.RedirectAfterCreation));
        }
    }

    [EffectMethod]
    public Task HandleUpdateFeedIdentityAction(
        UpdateFeedIdentityAction action,
        IDispatcher dispatcher
    ) =>
        IfIdentityExists(async identity =>
        {
            var result = await feedIdentityService.UpdateFeedIdentityAsync(
                identity.Id,
                identity.Password,
                identity.AesKey,
                identity.RsaKeyPair,
                action.Name,
                action.ProfilePicture,
                action.PublishBodyweight,
                action.PublishPlan,
                action.PublishWorkouts,
                programState.Value.SessionBlueprints
            );
            if (!result.IsSuccess)
            {
                // TODO handle properly
                return;
            }
            dispatcher.Dispatch(new PutFeedIdentityAction(result.Data));
        });

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
        await feedIdentityService.UpdateFeedIdentityAsync(
            state.Value.Identity.Id,
            state.Value.Identity.Password,
            state.Value.Identity.AesKey,
            state.Value.Identity.RsaKeyPair,
            state.Value.Identity.Name,
            state.Value.Identity.ProfilePicture,
            state.Value.Identity.PublishBodyweight,
            state.Value.Identity.PublishPlan,
            state.Value.Identity.PublishWorkouts,
            programState.Value.SessionBlueprints
        );
    }

    [EffectMethod]
    public Task HandleDeleteFeedIdentityAction(
        DeleteFeedIdentityAction _,
        IDispatcher dispatcher
    ) =>
        IfIdentityExists(async identity =>
        {
            var response = await feedApiService.DeleteUserAsync(
                new DeleteUserRequest(Id: identity.Id, Password: identity.Password)
            );
            if (!response.IsSuccess && response.Error.Type != ApiErrorType.NotFound)
            {
                logger.LogError(
                    "Failed to delete user {Id} with error {Error}",
                    identity.Id,
                    response.Error
                );
                // TODO handle properly
                return;
            }
            dispatcher.Dispatch(new PutFeedIdentityAction(null));
            dispatcher.Dispatch(new SetIsLoadingIdentityAction(false));
            dispatcher.Dispatch(new ReplaceFeedItemsAction([]));
            dispatcher.Dispatch(new ReplaceFeedFollowedUsersAction([]));
        });

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
