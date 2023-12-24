using Fluxor;

namespace LiftLog.Ui.Store.Stats;

public static class StatsReducers
{
    [ReducerMethod]
    public static StatsState SetStats(StatsState state, SetStatsAction action) =>
        state with
        {
            BodyweightStats = action.BodyweightStats,
            ExerciseStats = action.ExerciseStats,
            SessionStats = action.SessionStats,
        };

    [ReducerMethod]
    public static StatsState SetStatsIsLoading(StatsState state, SetStatsIsLoadingAction action) =>
        state with
        {
            IsLoading = action.IsLoading,
        };

    [ReducerMethod]
    public static StatsState SetStatsIsDirty(StatsState state, SetStatsIsDirtyAction action) =>
        state with
        {
            IsDirty = action.IsDirty,
        };
}
