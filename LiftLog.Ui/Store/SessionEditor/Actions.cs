using LiftLog.Lib.Models;

namespace LiftLog.Ui.Store.SessionEditor;

public record SetEditingSessionAction(SessionBlueprint SessionBlueprint);

public record SetEditingSessionNameAction(string Name);

public record SetExerciseNameAction(int ExerciseIndex, string Name);

public record MoveExerciseUpAction(ExerciseBlueprint ExerciseBlueprint);

public record MoveExerciseDownAction(ExerciseBlueprint ExerciseBlueprint);

public record AddExerciseAction(ExerciseBlueprint ExerciseBlueprint);

public record RemoveExerciseAction(ExerciseBlueprint ExerciseBlueprint);

public record SetExerciseInitialWeightAction(int ExerciseIndex, decimal InitialKilograms);

public record SetExerciseKilogramsIncreaseOnSuccessAction(
    int ExerciseIndex,
    decimal KilogramsIncreaseOnSuccess
);

public record SetMinRestAction(
    int ExerciseIndex,
    TimeSpan Rest
);
public record SetMaxRestAction(
    int ExerciseIndex,
    TimeSpan Rest
);

public record SetFailureRestAction(
    int ExerciseIndex,
    TimeSpan Rest
);

public record IncrementExerciseSetsAction(int ExerciseIndex);

public record DecrementExerciseSetsAction(int ExerciseIndex);

public record IncrementExerciseRepsPerSetAction(int ExerciseIndex);

public record DecrementExerciseRepsPerSetAction(int ExerciseIndex);
