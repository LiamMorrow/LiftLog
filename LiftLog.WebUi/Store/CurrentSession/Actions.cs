using LiftLog.Lib.Models;

namespace LiftLog.WebUi.Store.CurrentSession
{
    public record CycleExerciseRepsAction(int ExerciseIndex, int SetIndex);

    public record UpdateExerciseWeightAction(int ExerciseIndex, decimal Kilograms);

    public record SetCurrentSessionAction(Session? Session);

    public record PersistCurrentSessionAction();

    public record RehydrateSessionAction();
}
