using LiftLog.Lib;
using LiftLog.Lib.Models;

namespace LiftLog.Ui.Store.Program;

public record SetProgramIsHydratedAction();

public record FetchUpcomingSessionsAction();

public record FetchExerciseNamesAction();

public record SetExerciseNamesAction(ImmutableListValue<string> ExerciseNames);

public record SetUpcomingSessionsAction(ImmutableListValue<Session> UpcomingSessions);

public record SetProgramSessionsAction(ImmutableListValue<SessionBlueprint> SessionBlueprints);

public record SetProgramSessionAction(int SessionIndex, SessionBlueprint SessionBlueprint);

public record AddProgramSessionAction(SessionBlueprint SessionBlueprint);

public record MoveSessionBlueprintUpInProgramAction(SessionBlueprint SessionBlueprint);

public record MoveSessionBlueprintDownInProgramAction(SessionBlueprint SessionBlueprint);

public record RemoveSessionFromProgramAction(SessionBlueprint SessionBlueprint);
