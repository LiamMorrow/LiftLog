using System.Collections.Immutable;
using LiftLog.Lib;
using LiftLog.Lib.Models;

namespace LiftLog.Ui.Store.Feed;

public record FeedState(
    bool IsLoadingIdentity,
    FeedIdentity? Identity,
    ImmutableListValue<FeedItem> Feed,
    ImmutableDictionary<Guid, FeedUser> Users,
    FeedUser? SharedFeedUser
);

public record FeedUser(
    Guid Id,
    string? Name,
    string? Nickname,
    ImmutableListValue<SessionBlueprint> CurrentPlan,
    byte[]? ProfilePicture,
    byte[] EncryptionKey,
    string? FollowSecret
) { }

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
    byte[] EncryptionKey,
    string Password,
    string? Name,
    byte[]? ProfilePicture,
    bool PublishBodyweight,
    bool PublishPlan
);
