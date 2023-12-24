using LiftLog.Lib;
using LiftLog.Lib.Models;

namespace LiftLog.Ui.Store.Stats;

public record SetStatsAction(
    ImmutableListValue<ExerciseStatisticOverTime> ExerciseStats,
    ImmutableListValue<StatisticOverTime> SessionStats,
    StatisticOverTime BodyweightStats
);

public record FetchStatsAction();

public record SetStatsIsLoadingAction(bool IsLoading);

public record SetStatsIsDirtyAction(bool IsDirty);
