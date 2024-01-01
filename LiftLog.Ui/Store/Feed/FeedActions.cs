using LiftLog.Lib;
using LiftLog.Lib.Models;

namespace LiftLog.Ui.Store.Feed;

public record CreateFeedIdentityAction(Guid Id, string? Name, byte[]? ProfilePicture);

public record UpdateFeedIdentityAction(string? Name, byte[]? ProfilePicture);

public record PutFeedIdentityAction(FeedIdentity? Identity);

public record ReplaceFeedItemsAction(ImmutableListValue<FeedItem> Items);

public record PutFeedUserAction(FeedUser User);

public record AddFeedUserAction(Guid Id, byte[] EncryptionKey, string Name);

public record FetchSessionFeedItemsAction();

public record PublishWorkoutToFeedAction(Session Session);
