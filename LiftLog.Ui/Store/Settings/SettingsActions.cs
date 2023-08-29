using LiftLog.Lib;
using LiftLog.Lib.Models;

namespace LiftLog.Ui.Store.Settings;

public record ExportDataAction();

public record ImportDataAction();

public record GenerateAiPlanAction(AiWorkoutAttributes Attributes);

public record SetAiPlanAction(AiWorkoutPlan? Plan);

public record SetAiPlanAttributesAction(AiWorkoutAttributes? Attributes);

public record SetIsGeneratingAiPlanAction(bool IsGeneratingAiPlan);

public record SetAiPlanErrorAction(string? AiPlanError);

public record FetchSavedProgramsAction();
