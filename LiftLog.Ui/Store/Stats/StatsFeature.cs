using System.Collections.Immutable;
using Fluxor;
using LiftLog.Lib;
using LiftLog.Lib.Models;
using LiftLog.Ui.Store.Stats;

namespace LiftLog.Ui.Store.Stats;

public class StatsFeature : Feature<StatsState>
{
    public override string GetName() => nameof(StatsFeature);

    protected override StatsState GetInitialState() =>
        new(
            IsDirty: true,
            IsLoading: false,
            OverallViewSessionName: "CURRENT_SESSIONS",
            OverallViewTime: TimeSpan.FromDays(30),
            OverallView: null,
            PinnedExerciseStatistics: []
        );
}
