using LiftLog.Lib.Models;
using LiftLog.Lib.Services;

namespace LiftLog.Ui.Store.CurrentSession;

public record CycleExerciseRepsAction(int ExerciseIndex, int SetIndex);

public record UpdateExerciseWeightAction(int ExerciseIndex, decimal Kilograms);

public record SetCurrentSessionAction(Session? Session);

public record PersistCurrentSessionAction();

public record RehydrateSessionAction();

public record NotifySetTimerAction();

public  record  SetNotificationHandleAction(NotificationHandle? Handle);