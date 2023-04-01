using LiftLog.Lib.Models;

namespace LiftLog.WebUi.Store.CurrentSession
{
    public record CycleExerciseRepsAction(int ExerciseIndex, int SetIndex);

    public record UpdateExerciseWeightAction(int ExerciseIndex, decimal Weight);

    public record SetCurrentSessionAction(SessionAndBlueprint? SessionAndBlueprint);

    public record RehydrateSessionAction();
}
