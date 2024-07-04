namespace LiftLog.Ui.Models.CurrentSessionStateDao;

using LiftLog.Ui.Models.SessionHistoryDao;
using LiftLog.Ui.Store.CurrentSession;

internal partial class CurrentSessionStateDaoV2
{
    public CurrentSessionStateDaoV2(
        SessionDaoV2? workoutSession,
        SessionDaoV2? historySession,
        UuidDao? latestSetTimerNotificationId
    )
    {
        WorkoutSession = workoutSession;
        HistorySession = historySession;
        LatestSetTimerNotificationId = latestSetTimerNotificationId;
    }

    public static CurrentSessionStateDaoV2 FromModel(CurrentSessionState model) =>
        new(
            model.WorkoutSession is null ? null : SessionDaoV2.FromModel(model.WorkoutSession),
            model.HistorySession is null ? null : SessionDaoV2.FromModel(model.HistorySession),
            model.LatestSetTimerNotificationId
        );

    public CurrentSessionState ToModel() =>
        new(
            IsHydrated: true,
            WorkoutSession?.ToModel(),
            HistorySession?.ToModel(),
            FeedSession: null,
            LatestSetTimerNotificationId
        );
}
