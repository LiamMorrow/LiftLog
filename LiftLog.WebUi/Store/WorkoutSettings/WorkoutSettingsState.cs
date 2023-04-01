using LiftLog.Lib;
using LiftLog.Lib.Models;

namespace LiftLog.WebUi.Store.WorkoutSettings
{
    public record WorkoutSettingsState(
        ImmutableListSequence<WorkoutPlan> Plans,
        WorkoutPlan SelectedPlan
    );
}
