using Fluxor;
using SimpleGymTracker.Lib.Models;

namespace SimpleGymTracker.WebUi.Store.WorkoutSession
{
  public class Feature : Feature<WorkoutSessionState>
  {
    public override string GetName() => "WorkoutSession";
    protected override WorkoutSessionState GetInitialState() =>
        new(null);
  }
}
