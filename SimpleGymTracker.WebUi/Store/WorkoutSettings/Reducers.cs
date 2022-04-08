using System.Collections.Immutable;
using System.Linq;
using Fluxor;

namespace SimpleGymTracker.WebUi.Store.WorkoutSettings
{
    public static class Reducers
    {
        [ReducerMethod]
        public static WorkoutSettingsState SelectPlan(
            WorkoutSettingsState state,
            SelectPlanAction action
        ) =>
            state with
            {
                SelectedPlan = action.Plan,
                Plans = state.Plans.Union(new[] { action.Plan }).ToImmutableList()
            };
    }
}
