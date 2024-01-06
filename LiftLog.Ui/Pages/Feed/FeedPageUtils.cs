using LiftLog.Ui.Services;

namespace LiftLog.Ui.Pages.Feed;

public static class FeedPageUtils
{
    public static string GetShareUrl(Guid id, byte[] publicKey, string? name) =>
#if DEBUG
        $"https://0.0.0.0:5001/feed/share?pub={publicKey.ToUrlSafeHexString()}&id={id}{(name is null ? "" : $"&name={name}")}";
#else
        $"https://app.liftlog.online/feed/share?pub={publicKey.ToUrlSafeHexString()}&id={id}{(name is null ? "" : $"&name={name}")}";
#endif
}
