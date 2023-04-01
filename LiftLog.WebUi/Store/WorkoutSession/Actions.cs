using LiftLog.Lib.Models;

namespace LiftLog.WebUi.Store.WorkoutSession
{
    public record CycleExerciseRepsAction(int ExerciseIndex, int SetIndex);

    public record UpdateExerciseWeightAction(int ExerciseIndex, decimal Weight);

    public record SetWorkoutDayAction(WorkoutDayDao? Day);

    public record RehydrateSessionAction();
}
