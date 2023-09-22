using LiftLog.Lib.Models;

namespace LiftLog.Ui.Store.CurrentSession
{
    public record CurrentSessionState(
        Session? WorkoutSession,
        Session? HistorySession,
        Guid? LatestSetTimerNotificationId
    );
}
