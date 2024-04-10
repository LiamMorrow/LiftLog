using System.Collections.Immutable;
using System.Diagnostics.CodeAnalysis;
using Google.Protobuf;
using Google.Protobuf.WellKnownTypes;
using LiftLog.Lib;
using LiftLog.Lib.Models;
using LiftLog.Ui.Models.SessionBlueprintDao;
using LiftLog.Ui.Models.SessionHistoryDao;
using LiftLog.Ui.Store.Feed;

namespace LiftLog.Ui.Models;

internal partial class FeedIdentityDaoV1
{
    [return: NotNullIfNotNull(nameof(value))]
    public static implicit operator FeedIdentity?(FeedIdentityDaoV1? value) =>
        value is null
            ? null
            : new FeedIdentity(
                Id: value.Id,
                Lookup: value.Lookup,
                AesKey: new Lib.Services.AesKey(value.AesKey.ToByteArray()),
                RsaKeyPair: new Lib.Services.RsaKeyPair(
                    new Lib.Services.RsaPublicKey(value.PublicKey.ToByteArray()),
                    new Lib.Services.RsaPrivateKey(value.PrivateKey.ToByteArray())
                ),
                Password: value.Password,
                Name: value.Name,
                ProfilePicture: value.ProfilePicture.IsEmpty
                    ? null
                    : value.ProfilePicture.ToByteArray(),
                PublishBodyweight: value.PublishBodyweight,
                PublishPlan: value.PublishPlan,
                PublishWorkouts: value.PublishWorkouts
            );

    [return: NotNullIfNotNull(nameof(value))]
    public static implicit operator FeedIdentityDaoV1?(FeedIdentity? value) =>
        value is null
            ? null
            : new FeedIdentityDaoV1
            {
                Id = value.Id,
                Lookup = value.Lookup,
                AesKey = ByteString.CopyFrom(value.AesKey.Value),
                PrivateKey = ByteString.CopyFrom(value.RsaKeyPair.PrivateKey.Pkcs8PrivateKeyBytes),
                PublicKey = ByteString.CopyFrom(value.RsaKeyPair.PublicKey.SpkiPublicKeyBytes),
                Password = value.Password,
                Name = value.Name,
                ProfilePicture = value.ProfilePicture is null
                    ? ByteString.Empty
                    : ByteString.CopyFrom(value.ProfilePicture),
                PublishBodyweight = value.PublishBodyweight,
                PublishPlan = value.PublishPlan,
                PublishWorkouts = value.PublishWorkouts
            };
}

internal partial class FeedUserDaoV1
{
    [return: NotNullIfNotNull(nameof(value))]
    public static implicit operator FeedUser?(FeedUserDaoV1? value) =>
        value is null
            ? null
            : new FeedUser(
                Id: value.Id,
                Name: value.Name,
                Nickname: value.Nickname,
                AesKey: value.AesKey.IsEmpty
                    ? null
                    : new Lib.Services.AesKey(value.AesKey.ToByteArray()),
                PublicKey: new Lib.Services.RsaPublicKey(value.PublicKey.ToByteArray()),
                CurrentPlan: value
                    .CurrentPlan?.Sessions.Select(sessionBlueprintDao =>
                        sessionBlueprintDao.ToModel()
                    )
                    .ToImmutableList() ?? [],
                ProfilePicture: value.ProfilePicture.IsEmpty
                    ? null
                    : value.ProfilePicture.ToByteArray(),
                FollowSecret: value.FollowSecret
            );

    [return: NotNullIfNotNull(nameof(value))]
    public static implicit operator FeedUserDaoV1?(FeedUser? value) =>
        value is null
            ? null
            : new FeedUserDaoV1
            {
                Id = value.Id,
                Name = value.Name,
                Nickname = value.Nickname,
                CurrentPlan = value.CurrentPlan,
                AesKey = value.AesKey is null
                    ? ByteString.Empty
                    : ByteString.CopyFrom(value.AesKey.Value),
                PublicKey = ByteString.CopyFrom(value.PublicKey.SpkiPublicKeyBytes),
                ProfilePicture = value.ProfilePicture is null
                    ? ByteString.Empty
                    : ByteString.CopyFrom(value.ProfilePicture),
                FollowSecret = value.FollowSecret
            };
}

internal partial class FeedItemDaoV1
{
    public static implicit operator FeedItem?(FeedItemDaoV1? value) =>
        value switch
        {
            { PayloadCase: PayloadOneofCase.Session }
                => new SessionFeedItem(
                    UserId: value.UserId,
                    EventId: value.EventId,
                    Timestamp: value.Timestamp.ToDateTimeOffset(),
                    Expiry: value.Expiry.ToDateTimeOffset(),
                    Session: value.Session.ToModel()
                ),
            _ => null,
        };

    [return: NotNullIfNotNull(nameof(value))]
    public static implicit operator FeedItemDaoV1?(FeedItem? value) =>
        value switch
        {
            SessionFeedItem sessionFeedItem
                => new FeedItemDaoV1
                {
                    UserId = sessionFeedItem.UserId,
                    EventId = sessionFeedItem.EventId,
                    Timestamp = sessionFeedItem.Timestamp.ToTimestamp(),
                    Expiry = sessionFeedItem.Expiry.ToTimestamp(),
                    Session = SessionDaoV2.FromModel(sessionFeedItem.Session),
                },
            _ => null,
        };
}

internal partial class FeedStateDaoV1
{
    [return: NotNullIfNotNull(nameof(value))]
    public static implicit operator FeedState?(FeedStateDaoV1? value) =>
        value is null
            ? null
            : new FeedState(
                IsHydrated: true,
                IsLoadingIdentity: false,
                Identity: value.Identity,
                Feed: value.FeedItems.Select(x => (FeedItem?)x).WhereNotNull().ToImmutableList(),
                FollowedUsers: value.FollowedUsers.ToImmutableDictionary(
                    feedUserDao => (Guid)feedUserDao.Id,
                    x => (FeedUser)x!
                ),
                SharedFeedUser: null,
                FollowRequests: value
                    .FollowRequests.Select(x => (FollowRequest)x!)
                    .ToImmutableList(),
                Followers: value
                    .Followers.Select(x => (FeedUser)x!)
                    .ToImmutableDictionary(x => x.Id),
                ActiveTab: "mainfeed-panel",
                UnpublishedSessionIds: value
                    .UnpublishedSessionIds.Select(x => (Guid)x)
                    .ToImmutableHashSet(),
                HasPublishedRsaPublicKey: value.PublishedRsaKey
            );

    [return: NotNullIfNotNull(nameof(value))]
    public static implicit operator FeedStateDaoV1?(FeedState? value) =>
        value is null
            ? null
            : new FeedStateDaoV1
            {
                Identity = value.Identity,
                FeedItems = { value.Feed.Select(x => (FeedItemDaoV1)x) },
                FollowedUsers = { value.FollowedUsers.Values.Select(x => (FeedUserDaoV1)x) },
                FollowRequests = { value.FollowRequests.Select(x => (InboxMessageDao)x) },
                Followers = { value.Followers.Values.Select(x => (FeedUserDaoV1)x) },
                UnpublishedSessionIds = { value.UnpublishedSessionIds.Select(x => (UuidDao)x) },
                PublishedRsaKey = value.HasPublishedRsaPublicKey
            };
}

internal partial class CurrentPlanDaoV1
{
    [return: NotNullIfNotNull(nameof(value))]
    public static implicit operator ImmutableListValue<SessionBlueprint>?(
        CurrentPlanDaoV1? value
    ) =>
        value is null
            ? []
            : value
                .Sessions.Select(sessionBlueprintDao => sessionBlueprintDao.ToModel())
                .ToImmutableList();

    [return: NotNullIfNotNull(nameof(value))]
    public static implicit operator CurrentPlanDaoV1?(
        ImmutableListValue<SessionBlueprint>? value
    ) =>
        value is null or []
            ? null
            : new CurrentPlanDaoV1 { Sessions = { value.Select(SessionBlueprintDaoV2.FromModel) } };
}

internal partial class InboxMessageDao
{
    [return: NotNullIfNotNull(nameof(value))]
    public static implicit operator FollowRequest?(InboxMessageDao? value) =>
        value is null
            ? null
            : new FollowRequest(
                UserId: value.FromUserId,
                Name: value.FollowRequest.Name,
                ProfilePicture: value.FollowRequest.ProfilePicture.IsEmpty
                    ? null
                    : value.FollowRequest.ProfilePicture.ToByteArray(),
                PublicKey: new Lib.Services.RsaPublicKey(
                    value.FollowRequest.PublicKey.ToByteArray()
                )
            );

    [return: NotNullIfNotNull(nameof(value))]
    public static implicit operator InboxMessageDao?(FollowRequest? value) =>
        value is null
            ? null
            : new InboxMessageDao
            {
                FromUserId = value.UserId,
                FollowRequest = new FollowRequestDao
                {
                    Name = value.Name,
                    ProfilePicture = value.ProfilePicture is null
                        ? ByteString.Empty
                        : ByteString.CopyFrom(value.ProfilePicture),
                    PublicKey = ByteString.CopyFrom(value.PublicKey.SpkiPublicKeyBytes)
                }
            };
}
