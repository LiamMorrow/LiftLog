using Fluxor;
using SimpleGymTracker.Lib;

namespace SimpleGymTracker.WebUi.Store.WorkoutSettings
{
    public class Feature : Feature<WorkoutSettingsState>
    {
        public override string GetName() => "WorkoutSettings";

        protected override WorkoutSettingsState GetInitialState() =>
            new(Plans.BuiltInPlans, Plans.BuiltInPlans[0]);
    }
}
