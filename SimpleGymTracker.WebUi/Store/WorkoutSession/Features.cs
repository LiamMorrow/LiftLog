using Fluxor;
using SimpleGymTracker.Lib;

namespace SimpleGymTracker.WebUi.Store.Workout
{
  public class Feature : Feature<WorkoutSessionState>
  {
    public override string GetName() => "WorkoutSession";
    protected override WorkoutSessionState GetInitialState() =>
        new(Plans.Stronglifts.FirstDay());
  }
}
