using System.Collections.Immutable;
using System.Diagnostics.CodeAnalysis;
using Google.Protobuf;
using Google.Protobuf.WellKnownTypes;
using LiftLog.Lib;
using LiftLog.Lib.Models;
using LiftLog.Ui.Models.SessionBlueprintDao;
using LiftLog.Ui.Models.SessionHistoryDao;
using LiftLog.Ui.Store.Feed;
using LiftLog.Ui.Util;

namespace LiftLog.Ui.Models;

internal partial class FeedIdentityDaoV1
{
    [return: NotNullIfNotNull(nameof(value))]
    public static implicit operator FeedIdentity?(FeedIdentityDaoV1? value) =>
        value is null
            ? null
            : new FeedIdentity(
                Id: value.Id,
                AesKey: value.AesKey.ToByteArray(),
                PrivateKey: value.PrivateKey.ToByteArray(),
                PublicKey: value.PublicKey.ToByteArray(),
                Password: value.Password,
                Name: value.Name,
                ProfilePicture: value.ProfilePicture.IsEmpty
                    ? null
                    : value.ProfilePicture.ToByteArray(),
                PublishBodyweight: value.PublishBodyweight,
                PublishPlan: value.PublishPlan
            );

    [return: NotNullIfNotNull(nameof(value))]
    public static implicit operator FeedIdentityDaoV1?(FeedIdentity? value) =>
        value is null
            ? null
            : new FeedIdentityDaoV1
            {
                Id = value.Id,
                AesKey = ByteString.CopyFrom(value.AesKey),
                PrivateKey = ByteString.CopyFrom(value.PrivateKey),
                PublicKey = ByteString.CopyFrom(value.PublicKey),
                Password = value.Password,
                Name = value.Name,
                ProfilePicture = value.ProfilePicture is null
                    ? ByteString.Empty
                    : ByteString.CopyFrom(value.ProfilePicture),
                PublishBodyweight = value.PublishBodyweight,
                PublishPlan = value.PublishPlan
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
                AesKey: value.AesKey.IsEmpty ? null : value.AesKey.ToByteArray(),
                PublicKey: value.PublicKey.ToByteArray(),
                CurrentPlan: value
                    .CurrentPlan?.Sessions
                    .Select(sessionBlueprintDao => sessionBlueprintDao.ToModel())
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
                    : ByteString.CopyFrom(value.AesKey),
                PublicKey = ByteString.CopyFrom(value.PublicKey),
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
                IsLoadingIdentity: false,
                Identity: value.Identity,
                Feed: value.FeedItems.Select(x => (FeedItem?)x).WhereNotNull().ToImmutableList(),
                Users: value.FeedUsers.ToImmutableDictionary(
                    feedUserDao => (Guid)feedUserDao.Id,
                    x => (FeedUser)x
                ),
                SharedFeedUser: null,
                FollowRequests: value.FollowRequests.Select(x => (FollowRequest)x).ToImmutableList()
            );

    [return: NotNullIfNotNull(nameof(value))]
    public static implicit operator FeedStateDaoV1?(FeedState? value) =>
        value is null
            ? null
            : new FeedStateDaoV1
            {
                Identity = value.Identity,
                FeedItems = { value.Feed.Select(x => (FeedItemDaoV1)x) },
                FeedUsers = { value.Users.Values.Select(x => (FeedUserDaoV1)x) },
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
                PublicKey: value.FollowRequest.PublicKey.ToByteArray()
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
                    PublicKey = ByteString.CopyFrom(value.PublicKey)
                }
            };
}
