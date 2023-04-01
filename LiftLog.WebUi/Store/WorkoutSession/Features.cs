using Fluxor;
using LiftLog.Lib.Models;

namespace LiftLog.WebUi.Store.WorkoutSession
{
    public class WorkoutSessionFeature : Feature<WorkoutSessionState>
    {
        public override string GetName() => "WorkoutSession";

        protected override WorkoutSessionState GetInitialState() => new WorkoutSessionState(null);
    }
}
