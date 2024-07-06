using LiftLog.Lib.Models;

namespace LiftLog.Ui.Store.SessionEditor;

public record SetEditingSessionAction(SessionBlueprint SessionBlueprint);

public record SetEditingSessionNameAction(string Name);

public record SetEditingSessionNotesAction(string Notes);

public record MoveExerciseUpAction(ExerciseBlueprint ExerciseBlueprint);

public record MoveExerciseDownAction(ExerciseBlueprint ExerciseBlueprint);

public record AddExerciseAction(ExerciseBlueprint ExerciseBlueprint);

public record RemoveExerciseAction(ExerciseBlueprint ExerciseBlueprint);

public record UpdateSessionExerciseAction(int ExerciseIndex, ExerciseBlueprint ExerciseBlueprint);
