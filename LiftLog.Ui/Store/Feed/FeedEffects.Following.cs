using System.Collections.Immutable;
using System.Text;
using Fluxor;
using Google.Protobuf;
using LiftLog.Lib;
using LiftLog.Lib.Models;
using LiftLog.Lib.Services;
using LiftLog.Ui.Models;
using LiftLog.Ui.Models.SessionHistoryDao;
using LiftLog.Ui.Services;
using LiftLog.Ui.Store.App;
using LiftLog.Ui.Store.Program;
using Microsoft.Extensions.Logging;
using static LiftLog.Ui.Models.UserEventPayload;

namespace LiftLog.Ui.Store.Feed;

public partial class FeedEffects(
    IState<FeedState> state,
    IState<ProgramState> programState,
    ProgressRepository progressRepository,
    FeedApiService feedApiService,
    FeedFollowService feedFollowService,
    FeedIdentityService feedIdentityService,
    IEncryptionService encryptionService,
    ILogger<FeedEffects> logger
)
{
    [EffectMethod]
    public async Task HandleFetchAndSetSharedFeedUserAction(
        FetchAndSetSharedFeedUserAction action,
        IDispatcher dispatcher
    )
    {
        var result = await feedApiService.GetUserAsync(action.IdOrLookup);
        if (
            result is { IsSuccess: true }
            && new[] { result.Data.RsaPublicKey, action.RsaPublicKey }.Any(x => x != null)
        )
        {
            dispatcher.Dispatch(
                new SetSharedFeedUserAction(
                    FeedUser.FromShared(
                        result.Data.Id,
                        new RsaPublicKey(result.Data.RsaPublicKey ?? action.RsaPublicKey!),
                        action.Name
                    )
                )
            );
        }
        else
        {
            // TODO handle properly
            logger.LogError("Failed to fetch shared feed user with error {Error}", result.Error);
        }
    }

    [EffectMethod]
    public async Task HandleRequestFollowSharedUserAction(
        RequestFollowUserAction action,
        IDispatcher dispatcher
    )
    {
        var identity = state.Value.Identity;
        if (identity == null || state.Value.SharedFeedUser == null)
        {
            return;
        }

        var sharedFeedUser = state.Value.SharedFeedUser;
        var result = await feedFollowService.RequestToFollowAUserAsync(identity, sharedFeedUser);

        if (result.IsSuccess)
        {
            dispatcher.Dispatch(new PutFollowedUsersAction(sharedFeedUser));
            dispatcher.Dispatch(new SetSharedFeedUserAction(null));
        }
        else
        {
            // TODO handle properly
            logger.LogError("Failed to request follow user with error {Error}", result.Error);
        }
    }

    [EffectMethod]
    public Task HandleProcessFollowResponsesAction(
        ProcessFollowResponsesAction action,
        IDispatcher dispatcher
    )
    {
        var acceptResponses = action.Responses.Where(x => x.Accepted).ToDictionary(x => x.UserId);
        var rejectedUsers = action
            .Responses.Where(x => !x.Accepted)
            .Select(x => x.UserId)
            .ToHashSet();
        var usersAfterResponses = state
            .Value.FollowedUsers.Select(x =>
                acceptResponses.TryGetValue(x.Key, out var value)
                    ? x.Value with
                    {
                        FollowSecret = value.FollowSecret,
                        AesKey = value.AesKey,
                    }
                    : x.Value
            )
            .Where(x => !rejectedUsers.Contains(x.Id))
            .ToImmutableList();

        dispatcher.Dispatch(new ReplaceFeedFollowedUsersAction(usersAfterResponses));
        dispatcher.Dispatch(new FetchSessionFeedItemsAction());

        return Task.CompletedTask;
    }

    [EffectMethod]
    public async Task UnfollowFeedUser(UnfollowFeedUserAction action, IDispatcher dispatcher)
    {
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

    [EffectMethod]
    public Task HandleAcceptFollowRequestAction(
        AcceptFollowRequestAction action,
        IDispatcher dispatcher
    ) =>
        IfIdentityExists(async identity =>
        {
            if (
                state.Value.Followers.TryGetValue(action.Request.UserId, out var existingFollower)
                && existingFollower.FollowSecret is not null
            )
            {
                await feedFollowService.RevokeFollowSecretAsync(
                    identity,
                    existingFollower.FollowSecret
                );
            }

            var userResponse = await feedApiService.GetUserAsync(action.Request.UserId.ToString());
            if (!userResponse.IsSuccess)
            {
                // TODO handle properly
                logger.LogError("Failed to fetch user with error {Error}", userResponse.Error);
                return;
            }
            var user = userResponse.Data;

            var followSecretResponse = await feedFollowService.AcceptFollowRequestAsync(
                identity,
                action.Request,
                new RsaPublicKey(user.RsaPublicKey)
            );

            if (!followSecretResponse.IsSuccess)
            {
                // TODO handle properly
                logger.LogError(
                    "Failed to accept follow request with error {Error}",
                    followSecretResponse.Error
                );
                return;
            }

            dispatcher.Dispatch(
                new AddFollowerAction(
                    FeedUser.FromShared(
                        action.Request.UserId,
                        new RsaPublicKey(user.RsaPublicKey),
                        action.Request.Name
                    ) with
                    {
                        FollowSecret = followSecretResponse.Data
                    }
                )
            );
            dispatcher.Dispatch(new RemoveFollowRequestAction(action.Request));
        });

    [EffectMethod]
    public Task HandleDenyFollowRequestAction(
        DenyFollowRequestAction action,
        IDispatcher dispatcher
    ) =>
        IfIdentityExists(async identity =>
        {
            var userResponse = await feedApiService.GetUserAsync(action.Request.UserId.ToString());
            if (!userResponse.IsSuccess)
            {
                // TODO handle properly
                logger.LogError(
                    "Failed to deny follow request with error {Error}. Removing request anyway.",
                    userResponse.Error
                );
                dispatcher.Dispatch(new RemoveFollowRequestAction(action.Request));
                return;
            }
            var result = await feedFollowService.DenyFollowRequestAsync(
                identity,
                action.Request,
                new RsaPublicKey(userResponse.Data.RsaPublicKey)
            );
            if (!result.IsSuccess && result.Error.Type != ApiErrorType.NotFound)
            {
                logger.LogError(
                    "Failed to deny follow request with error {Error}. Removing request anyway.",
                    result.Error
                );
            }

            dispatcher.Dispatch(new RemoveFollowRequestAction(action.Request));
        });

    [EffectMethod]
    public Task HandleStartRemoveFollowerAction(
        StartRemoveFollowerAction action,
        IDispatcher dispatcher
    ) =>
        IfIdentityExists(async identity =>
        {
            if (action.User.FollowSecret is not null)
            {
                var deleteFollowSecretResponse = await feedFollowService.RevokeFollowSecretAsync(
                    identity,
                    action.User.FollowSecret!
                );
                if (
                    !deleteFollowSecretResponse.IsSuccess
                    && deleteFollowSecretResponse.Error.Type != ApiErrorType.NotFound
                )
                {
                    logger.LogError(
                        "Failed to delete follow secret with error {Error}",
                        deleteFollowSecretResponse.Error
                    );
                    return;
                }
            }

            dispatcher.Dispatch(new RemoveFollowerAction(action.User));
        });

    private async Task<InboxMessageDao?> DecryptIfValid(
        GetInboxMessageResponse inboxMessage,
        RsaPrivateKey privateKey
    )
    {
        try
        {
            var decrypted = await encryptionService.DecryptRsaOaepSha256Async(
                new RsaEncryptedData(inboxMessage.EncryptedMessage),
                privateKey
            );
            return InboxMessageDao.Parser.ParseFrom(decrypted);
        }
        catch (Exception e)
        {
            logger.LogError(e, "Failed to decrypt inbox message");
            return null;
        }
    }
}
