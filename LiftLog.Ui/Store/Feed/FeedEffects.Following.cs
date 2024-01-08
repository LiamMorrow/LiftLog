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
using LiftLog.Ui.Util;
using Microsoft.Extensions.Logging;
using static LiftLog.Ui.Models.UserEventPayload;

namespace LiftLog.Ui.Store.Feed;

public partial class FeedEffects(
    IState<FeedState> state,
    IState<ProgramState> programState,
    FeedApiService feedApiService,
    FeedFollowService feedFollowService,
    FeedIdentityService feedIdentityService,
    IEncryptionService encryptionService,
    IKeyValueStore keyValueStore,
    ILogger<FeedEffects> logger
)
{
    [EffectMethod]
    public async Task HandleRequestFollowSharedUserAction(
        RequestFollowUserAction action,
        IDispatcher dispatcher
    )
    {
        var identity = state.Value.Identity;
        if (identity == null)
        {
            return;
        }
        var result = await feedFollowService.RequestToFollowAUserAsync(identity, action.FeedUser);

        if (result.IsSuccess)
        {
            dispatcher.Dispatch(new PutFollowedUsersAction(action.FeedUser));
        }
    }

    [EffectMethod]
    public async Task HandleFetchInboxItemsAction(FetchInboxItemsAction _, IDispatcher dispatcher)
    {
        var identity = state.Value.Identity;
        if (identity is null)
        {
            return;
        }
        var inboxItemsResponse = await feedApiService.GetInboxMessagesAsync(
            new GetInboxMessagesRequest(identity.Id, identity.Password)
        );
        if (!inboxItemsResponse.IsSuccess)
        {
            // TODO handle properly
            return;
        }

        var encryptedInboxItems = inboxItemsResponse.Data.InboxMessages;
        var inboxItems = (
            await Task.WhenAll(
                encryptedInboxItems.Select(x => DecryptIfValid(x, identity.RsaKeyPair.PrivateKey))
            )
        ).WhereNotNull();

        ImmutableListValue<FollowRequest> newFollowRequests = inboxItems
            .Where(
                x => x.MessagePayloadCase == InboxMessageDao.MessagePayloadOneofCase.FollowRequest
            )
            .Select(
                x =>
                    new FollowRequest(
                        UserId: x.FromUserId,
                        Name: x.FollowRequest.Name?.ToString() ?? "Anonymous User",
                        ProfilePicture: x.FollowRequest.ProfilePicture.IsEmpty
                            ? null
                            : x.FollowRequest.ProfilePicture.ToByteArray(),
                        PublicKey: new RsaPublicKey(x.FollowRequest.PublicKey.ToByteArray())
                    )
            )
            .ToImmutableList();
        dispatcher.Dispatch(new AppendNewFollowRequestsAction(newFollowRequests));

        var newFollowResponses = inboxItems
            .Where(
                x => x.MessagePayloadCase == InboxMessageDao.MessagePayloadOneofCase.FollowResponse
            )
            .Select(
                x =>
                    new FollowResponse(
                        UserId: x.FromUserId,
                        Accepted: x.FollowResponse.ResponsePayloadCase
                            == FollowResponseDao.ResponsePayloadOneofCase.Accepted,
                        AesKey: x.FollowResponse.ResponsePayloadCase
                        == FollowResponseDao.ResponsePayloadOneofCase.Accepted
                            ? new AesKey(x.FollowResponse.Accepted.AesKey.ToByteArray())
                            : null,
                        FollowSecret: x.FollowResponse.ResponsePayloadCase
                        == FollowResponseDao.ResponsePayloadOneofCase.Accepted
                            ? x.FollowResponse.Accepted.FollowSecret
                            : null
                    )
            )
            .ToImmutableList();

        dispatcher.Dispatch(new ProcessFollowResponsesAction(newFollowResponses));

        var followers = state.Value.Followers;
        var unfollowNotifications = inboxItems
            .Where(
                x =>
                    x.MessagePayloadCase
                    == InboxMessageDao.MessagePayloadOneofCase.UnfollowNotification
            )
            .SelectMany(
                x =>
                    followers.Values.Where(
                        f =>
                            f.Id == x.FromUserId
                            && f.FollowSecret == x.UnfollowNotification.FollowSecret
                    )
            );

        foreach (var unfollowNotification in unfollowNotifications)
        {
            dispatcher.Dispatch(new RemoveFollowerAction(unfollowNotification));
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
            .Value.FollowedUsers.Select(
                x =>
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

            var followSecretResponse = await feedFollowService.AcceptFollowRequestAsync(
                identity,
                action.Request
            );

            if (!followSecretResponse.IsSuccess)
            {
                // TODO handle properly
                return;
            }

            dispatcher.Dispatch(
                new AddFollowerAction(
                    FeedUser.FromShared(
                        action.Request.UserId,
                        action.Request.PublicKey,
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
            var result = await feedFollowService.DenyFollowRequestAsync(identity, action.Request);
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
                    // TODO handle properly
                    return;
                }
            }
            dispatcher.Dispatch(new RemoveFollowerAction(action.User));
        });

    [EffectMethod]
    public Task PutFeedUser(PutFollowedUsersAction action, IDispatcher dispatcher)
    {
        return PersistFeedState();
    }

    [EffectMethod]
    public Task ReplaceFeedUsers(ReplaceFeedFollowedUsersAction action, IDispatcher dispatcher)
    {
        return PersistFeedState();
    }

    [EffectMethod]
    public Task AppendNewFollowRequests(
        AppendNewFollowRequestsAction action,
        IDispatcher dispatcher
    )
    {
        return PersistFeedState();
    }

    [EffectMethod]
    public Task ProcessFollowResponses(RemoveFollowerAction action, IDispatcher dispatcher)
    {
        return PersistFeedState();
    }

    [EffectMethod]
    public Task AddFollowerAction(AddFollowerAction action, IDispatcher dispatcher)
    {
        return PersistFeedState();
    }

    [EffectMethod]
    public Task RemoveFollowRequestAction(RemoveFollowRequestAction action, IDispatcher dispatcher)
    {
        return PersistFeedState();
    }

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

    private async Task<FeedUser> GetDecryptedUserAsync(
        Guid Id,
        RsaPublicKey publicKey,
        AesKey aesKey,
        string? nickname,
        GetUserResponse response,
        string? followSecret
    )
    {
        return new FeedUser(
            Id,
            PublicKey: publicKey,
            AesKey: aesKey,
            Name: response.EncryptedName is null or { Length: 0 }
                ? null
                : Encoding.UTF8.GetString(
                    await encryptionService.DecryptAesCbcAndVerifyRsa256PssAsync(
                        new AesEncryptedAndRsaSignedData(
                            response.EncryptedName,
                            new AesIV(response.EncryptionIV)
                        ),
                        aesKey,
                        publicKey
                    )
                ),
            Nickname: nickname,
            CurrentPlan: response.EncryptedCurrentPlan is null or { Length: 0 }
                ? []
                : CurrentPlanDaoV1
                    .Parser.ParseFrom(
                        await encryptionService.DecryptAesCbcAndVerifyRsa256PssAsync(
                            new AesEncryptedAndRsaSignedData(
                                response.EncryptedCurrentPlan,
                                new AesIV(response.EncryptionIV)
                            ),
                            aesKey,
                            publicKey
                        )
                    )
                    .Sessions.Select(sessionBlueprintDao => sessionBlueprintDao.ToModel())
                    .ToImmutableList(),
            ProfilePicture: response.EncryptedProfilePicture is null or { Length: 0 }
                ? null
                : await encryptionService.DecryptAesCbcAndVerifyRsa256PssAsync(
                    new AesEncryptedAndRsaSignedData(
                        response.EncryptedProfilePicture,
                        new AesIV(response.EncryptionIV)
                    ),
                    aesKey,
                    publicKey
                ),
            FollowSecret: followSecret
        );
    }

    private async Task PersistFeedState()
    {
        await keyValueStore.SetItemAsync($"{FeedStateInitMiddleware.StorageKey}Version", "1");
        await keyValueStore.SetItemAsync(
            FeedStateInitMiddleware.StorageKey,
            ((FeedStateDaoV1)state.Value).ToByteArray()
        );
    }
}
