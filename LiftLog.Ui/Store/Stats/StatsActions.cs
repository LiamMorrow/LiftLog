using LiftLog.Lib;
using LiftLog.Lib.Models;

namespace LiftLog.Ui.Store.Stats;

public record SetOverallStatsAction(GranularStatisticView? Stats);

public record SetPinnedExerciseStatsAction(ImmutableListValue<PinnedExerciseStatistic> Stats);

public record SetOverallViewTimeAction(TimeSpan Time);

public record SetOverallViewSessionAction(string? SessionName);

public record FetchOverallStatsAction();

public record SetStatsIsLoadingAction(bool IsLoading);

public record SetStatsIsDirtyAction(bool IsDirty);
