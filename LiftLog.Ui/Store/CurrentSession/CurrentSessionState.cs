using LiftLog.Lib.Models;

namespace LiftLog.Ui.Store.CurrentSession
{
    public record CurrentSessionState(
        bool IsHydrated,
        Session? WorkoutSession,
        Session? HistorySession,
        Session? FeedSession,
        Guid? LatestSetTimerNotificationId
    );
}
