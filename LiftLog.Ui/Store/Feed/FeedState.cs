using System.Collections.Immutable;
using System.Diagnostics.CodeAnalysis;
using LiftLog.Lib;
using LiftLog.Lib.Models;

namespace LiftLog.Ui.Store.Feed;

public record FeedState(
    bool IsLoadingIdentity,
    FeedIdentity? Identity,
    ImmutableListValue<FeedItem> Feed,
    ImmutableDictionary<Guid, FeedUser> Users,
    FeedUser? SharedFeedUser,
    ImmutableListValue<FollowRequest> FollowRequests,
    ImmutableListValue<FeedUser> Followers,
    string ActiveTab
);

public record FeedUser(
    Guid Id,
    byte[] PublicKey,
    string? Name,
    string? Nickname,
    ImmutableListValue<SessionBlueprint> CurrentPlan,
    byte[]? ProfilePicture,
    byte[]? AesKey,
    string? FollowSecret
)
{
    public static FeedUser FromShared(Guid id, byte[] publicKey, string? name) =>
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
    byte[] AesKey,
    byte[] PublicKey,
    byte[] PrivateKey,
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
    byte[] PublicKey
);

public record FollowResponse(
    Guid UserId,
    [property: MemberNotNullWhen(true, "AesKey")]
    [property: MemberNotNullWhen(true, "FollowSecret")]
        bool Accepted,
    byte[]? AesKey,
    string? FollowSecret
);
