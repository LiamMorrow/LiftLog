using LiftLog.Lib;
using LiftLog.Lib.Models;
using LiftLog.Ui.Models;
using LiftLog.Ui.Services;
using LiftLog.Ui.Store.Feed;

namespace LiftLog.Ui.Store.Settings;

public record ExportBackupDataAction(bool ExportFeed);

public record ImportDataAction();

public record ImportDataBytesAction(byte[] Bytes);

public record BeginFeedImportAction(FeedState FeedState);

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

public record ExecuteRemoteBackupAction(RemoteBackupSettings Settings, bool Force = false);

public record RemoteBackupSucceededEvent();

public record UpdateRemoteBackupSettingsAction(RemoteBackupSettings Settings);

public record SetLastSuccessfulRemoteBackupHashAction(string Hash);

public record SetLastBackupTimeAction(DateTimeOffset Time);

public record SetBackupReminderAction(bool ShowReminder);

public record ExportPlainTextAction(PlaintextExportFormat Format);
