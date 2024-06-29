using LiftLog.Lib;
using LiftLog.Lib.Models;
using LiftLog.Ui.Services;

namespace LiftLog.Ui.Store.Settings;

public record SetSettingsIsHydratedAction();

public record ExportDataAction();

public record ImportDataAction();

public record ImportDataBytesAction(byte[] Bytes);

public record GenerateAiPlanAction(AiWorkoutAttributes Attributes);

public record SetAiPlanAction(AiWorkoutPlan? Plan);

public record SetAiPlanAttributesAction(AiWorkoutAttributes? Attributes);

public record SetIsGeneratingAiPlanAction(bool IsGeneratingAiPlan);

public record SetAiPlanErrorAction(string? AiPlanError);

public record FetchSavedProgramsAction();

public record SetThemeAction(uint? Seed, ThemePreference ThemePreference);

public record SetUseImperialUnitsAction(bool UseImperialUnits);

public record SetRestNotificationsAction(bool RestNotifications);

public record SetShowBodyweightAction(bool ShowBodyweight);

public record SetShowTipsAction(bool ShowTips);

public record SetTipToShowAction(int TipToShow);

public record SetShowFeedAction(bool ShowFeed);

public record SetStatusBarFixAction(bool StatusBarFix);
