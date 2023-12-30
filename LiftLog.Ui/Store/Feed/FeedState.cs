using System.Collections.Immutable;
using System.Diagnostics.CodeAnalysis;
using LiftLog.Lib;
using LiftLog.Lib.Models;

namespace LiftLog.Ui.Store.Feed;

public record FeedState(
    FeedIdentity? Identity,
    ImmutableListValue<FeedItem> Feed,
    ImmutableDictionary<Guid, FeedUser> Users
);

public record FeedUser(
    Guid Id,
    // A user may not have a name on the server, but we force our user to give them a name in this case
    string Name,
    ImmutableListValue<SessionBlueprint> CurrentPlan,
    byte[]? ProfilePicture,
    byte[] EncryptionKey
);

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
    byte[]? ProfilePicture
);
