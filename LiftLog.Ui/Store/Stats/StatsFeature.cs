using System.Collections.Immutable;
using Fluxor;
using LiftLog.Lib.Models;
using LiftLog.Ui.Store.Stats;

namespace LiftLog.Ui.Store.Stats;

public class StatsFeature : Feature<StatsState>
{
    public override string GetName() => nameof(StatsFeature);

    protected override StatsState GetInitialState() =>
        new(
            ExerciseStats: [],
            SessionStats: [],
            BodyweightStats: new StatisticOverTime("Bodyweight", []),
            IsDirty: true,
            IsLoading: false
        );
}
