using Fluxor;

namespace LiftLog.Ui.Store.Stats;

public static class StatsReducers
{
    [ReducerMethod]
    public static StatsState SetOverallStats(StatsState state, SetOverallStatsAction action) =>
        state with
        {
            OverallView = action.Stats,
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

    [ReducerMethod]
    public static StatsState SetOverallViewTime(
        StatsState state,
        SetOverallViewTimeAction action
    ) => state with { OverallViewTime = action.Time };

    [ReducerMethod]
    public static StatsState SetPinnedStats(
        StatsState state,
        SetPinnedExerciseStatsAction action
    ) => state with { PinnedExerciseStatistics = action.Stats };

    [ReducerMethod]
    public static StatsState SetOverallViewSession(
        StatsState state,
        SetOverallViewSessionAction action
    ) => state with { OverallViewSessionName = action.SessionName };
}
