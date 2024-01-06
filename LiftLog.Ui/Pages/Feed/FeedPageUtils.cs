using LiftLog.Ui.Services;

namespace LiftLog.Ui.Pages.Feed;

public static class FeedPageUtils
{
    public static string GetShareUrl(Guid id, byte[] encryptionKey) =>
#if DEBUG
        $"https://0.0.0.0:5001/feed/share?secret={encryptionKey.ToUrlSafeHexString()}&id={id}";
#else
        $"https://app.liftlog.online/feed/share?secret={encryptionKey.ToUrlSafeHexString()}&id={id}";
#endif
}
