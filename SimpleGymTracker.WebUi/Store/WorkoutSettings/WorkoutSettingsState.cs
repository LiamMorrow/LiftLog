using SimpleGymTracker.Lib;
using SimpleGymTracker.Lib.Models;

namespace SimpleGymTracker.WebUi.Store.WorkoutSettings
{
    public record WorkoutSettingsState(
        ImmutableListSequence<WorkoutPlan> Plans,
        WorkoutPlan SelectedPlan
    );
}
