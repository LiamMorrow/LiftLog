using LiftLog.Lib.Models;

namespace LiftLog.Ui.Store.CurrentSession;

public enum SessionTarget
{
    WorkoutSession,
    HistorySession
}

public record CycleExerciseRepsAction(SessionTarget Target, int ExerciseIndex, int SetIndex);

public record UpdateExerciseWeightAction(SessionTarget Target, int ExerciseIndex, decimal Kilograms);

public record SetCurrentSessionAction(SessionTarget Target, Session? Session);

public record PersistCurrentSessionAction(SessionTarget Target);

public record RehydrateSessionAction();

public record NotifySetTimerAction(SessionTarget Target);

public record DeleteSessionAction(Session Session);
