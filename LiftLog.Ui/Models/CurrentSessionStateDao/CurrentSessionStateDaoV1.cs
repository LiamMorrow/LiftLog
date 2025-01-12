using System.Text.Json.Serialization;
using LiftLog.Lib.Models;
using LiftLog.Ui.Models.SessionHistoryDao;
using LiftLog.Ui.Store.CurrentSession;

namespace LiftLog.Ui.Models.CurrentSessionStateDao;

internal record CurrentSessionStateDaoV1(
    [property: JsonPropertyName("WorkoutSession")] SessionDaoV1? WorkoutSession,
    [property: JsonPropertyName("HistorySession")] SessionDaoV1? HistorySession,
    [property: JsonPropertyName("LatestSetTimerNotificationId")] Guid? LatestSetTimerNotificationId
)
{
    public CurrentSessionState ToModel() =>
        new(
            IsHydrated: true,
            WorkoutSession: WorkoutSession?.ToModel(),
            HistorySession: HistorySession?.ToModel(),
            FeedSession: null,
            LatestSetTimerNotificationId: LatestSetTimerNotificationId
        );
}
