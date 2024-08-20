using LiftLog.Lib.Models;

namespace LiftLog.Ui.Store.CurrentSession
{
    public record CurrentSessionState(
        bool IsHydrated,
        Session? WorkoutSession,
        Session? HistorySession,
        Session? FeedSession,
        Guid? LatestSetTimerNotificationId
    )
    {
        public static CurrentSessionState FromWorkoutSession(Session session)
        {
            return new CurrentSessionState(
                IsHydrated: true,
                WorkoutSession: session,
                HistorySession: null,
                FeedSession: null,
                LatestSetTimerNotificationId: null
            );
        }
    }
}
