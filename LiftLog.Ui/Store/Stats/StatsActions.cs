using LiftLog.Lib;
using LiftLog.Lib.Models;

namespace LiftLog.Ui.Store.Stats;

public record SetOverallStatsAction(GranularStatisticView? Stats);

public record SetPinnedStatsAction(ImmutableListValue<PinnedStatistic> Stats);

public record SetOverallViewTimeAction(TimeSpan Time);

public record FetchOverallStatsAction();

public record SetStatsIsLoadingAction(bool IsLoading);

public record SetStatsIsDirtyAction(bool IsDirty);
