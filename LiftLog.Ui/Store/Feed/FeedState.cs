using System.Collections.Immutable;
using System.Diagnostics.CodeAnalysis;
using LiftLog.Lib;
using LiftLog.Lib.Models;
using LiftLog.Lib.Services;

namespace LiftLog.Ui.Store.Feed;

public record FeedState(
    bool IsLoadingIdentity,
    FeedIdentity? Identity,
    ImmutableListValue<FeedItem> Feed,
    ImmutableDictionary<Guid, FeedUser> FollowedUsers,
    FeedUser? SharedFeedUser,
    ImmutableListValue<FollowRequest> FollowRequests,
    ImmutableDictionary<Guid, FeedUser> Followers,
    string ActiveTab,
    ImmutableHashSet<Guid> UnpublishedSessionIds
);

public record FeedUser(
    Guid Id,
    RsaPublicKey PublicKey,
    string? Name,
    string? Nickname,
    ImmutableListValue<SessionBlueprint> CurrentPlan,
    byte[]? ProfilePicture,
    AesKey? AesKey,
    string? FollowSecret
)
{
    public static FeedUser FromShared(Guid id, RsaPublicKey publicKey, string? name) =>
        new(
            Id: id,
            PublicKey: publicKey,
            Name: name,
            Nickname: null,
            CurrentPlan: [],
            ProfilePicture: null,
            AesKey: null,
            FollowSecret: null
        );
}

public abstract record FeedItem(
    Guid UserId,
    Guid EventId,
    DateTimeOffset Timestamp,
    DateTimeOffset Expiry
);

public record SessionFeedItem(
    Guid UserId,
    Guid EventId,
    DateTimeOffset Timestamp,
    DateTimeOffset Expiry,
    Session Session
) : FeedItem(UserId, EventId, Timestamp, Expiry);

public record FeedIdentity(
    Guid Id,
    AesKey AesKey,
    RsaKeyPair RsaKeyPair,
    string Password,
    string? Name,
    byte[]? ProfilePicture,
    bool PublishBodyweight,
    bool PublishPlan,
    bool PublishWorkouts
);

public record FollowRequest(
    Guid UserId,
    string Name,
    byte[]? ProfilePicture,
    // Used to encrypt the follow response
    RsaPublicKey PublicKey
);

public record FollowResponse(
    Guid UserId,
    [property: MemberNotNullWhen(true, "AesKey")]
    [property: MemberNotNullWhen(true, "FollowSecret")]
        bool Accepted,
    AesKey? AesKey,
    string? FollowSecret
);
