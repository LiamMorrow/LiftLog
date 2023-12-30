using LiftLog.Lib;

namespace LiftLog.Ui.Store.Feed;

public record PutFeedIdentityAction(FeedIdentity? Identity);

public record ReplaceFeedItemsAction(ImmutableListValue<FeedItem> Items);

public record PutFeedUserAction(FeedUser User);

public record AddFeedUserAction(Guid Id, byte[] EncryptionKey, string Name);

public record FetchSessionFeedItemsAction();
