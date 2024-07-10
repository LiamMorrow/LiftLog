using Fluxor;

namespace LiftLog.Ui.Store.Exercises;

public class ExercisesFeature : Feature<ExercisesState>
{
    public override string GetName() => nameof(ExercisesFeature);

    protected override ExercisesState GetInitialState() => new([]);
}
