using Fluxor;
using SimpleGymTracker.Lib.Models;

namespace SimpleGymTracker.WebUi.Store.WorkoutSession
{
    public class WorkoutSessionFeature : Feature<WorkoutSessionState>
    {
        public override string GetName() => "WorkoutSession";

        protected override WorkoutSessionState GetInitialState() => new WorkoutSessionState(null);
    }
}
