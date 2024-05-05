using System.Collections.Immutable;
using LiftLog.Lib;
using LiftLog.Lib.Models;

namespace LiftLog.Ui.Store.Program;

public record SetProgramIsHydratedAction();

public record FetchUpcomingSessionsAction();

public record SetUpcomingSessionsAction(ImmutableListValue<Session> UpcomingSessions);

// PlanId is the key to the SavedPlans dictionary in ProgramState
// If it is Guid.Empty, it is the current plan
public record SetProgramSessionsAction(
    Guid PlanId,
    ImmutableListValue<SessionBlueprint> SessionBlueprints
);

public record SetProgramSessionAction(
    Guid PlanId,
    int SessionIndex,
    SessionBlueprint SessionBlueprint
);

public record AddProgramSessionAction(Guid PlanId, SessionBlueprint SessionBlueprint);

public record MoveSessionBlueprintUpInProgramAction(Guid PlanId, SessionBlueprint SessionBlueprint);

public record MoveSessionBlueprintDownInProgramAction(
    Guid PlanId,
    SessionBlueprint SessionBlueprint
);

public record RemoveSessionFromProgramAction(Guid PlanId, SessionBlueprint SessionBlueprint);

// Plans
public record SavePlanAction(Guid PlanId, ProgramBlueprint ProgramBlueprint);

public record CreateSavedPlanAction(Guid PlanId, string Name);

public record DeleteSavedPlanAction(Guid PlanId);

public record SetSavedPlanNameAction(Guid PlanId, string Name);

public record SetSavedPlansAction(ImmutableDictionary<Guid, ProgramBlueprint> SavedPlans);
