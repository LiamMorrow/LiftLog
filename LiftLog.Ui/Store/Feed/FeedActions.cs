using LiftLog.Lib;
using LiftLog.Lib.Models;

namespace LiftLog.Ui.Store.Feed;

public record CreateFeedIdentityAction(
    Guid Id,
    string? Name,
    byte[]? ProfilePicture,
    bool PublishBodyweight
);

public record UpdateFeedIdentityAction(
    string? Name,
    byte[]? ProfilePicture,
    bool PublishBodyweight
);

public record PutFeedIdentityAction(FeedIdentity? Identity);

public record ReplaceFeedItemsAction(ImmutableListValue<FeedItem> Items);

public record PutFeedUserAction(FeedUser User);

public record SetSharedFeedUserAction(FeedUser? User);

public record FetchSharedFeedUserAction(Guid Id, byte[] EncryptionKey);

public record SaveSharedFeedUserAction();

public record FetchSessionFeedItemsAction();

public record PublishWorkoutToFeedAction(Session Session);

public record ReplaceFeedUsersAction(ImmutableListValue<FeedUser> Users);
