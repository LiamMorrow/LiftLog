using LiftLog.Lib;
using LiftLog.Lib.Models;

namespace LiftLog.Ui.Store.Settings;

public record SettingsState(
    bool IsHydrated,
    AiWorkoutAttributes? AiWorkoutAttributes,
    bool IsGeneratingAiPlan,
    string? AiPlanError,
    AiWorkoutPlan? AiPlan,
    bool UseImperialUnits,
    bool ShowBodyweight,
    bool ShowTips,
    int TipToShow,
    bool ShowFeed,
    bool RestNotifications,
    RemoteBackupSettings RemoteBackupSettings,
    string LastSuccessfulRemoteBackupHash,
    DateTimeOffset LastBackupTime,
    bool BackupReminder,
    bool SplitWeightByDefault
)
{
    public static SettingsState Default =>
        new(
            IsHydrated: false,
            AiWorkoutAttributes: null,
            IsGeneratingAiPlan: false,
            AiPlanError: null,
            AiPlan: null,
            UseImperialUnits: false,
            ShowBodyweight: true,
            ShowTips: true,
            TipToShow: 1,
            ShowFeed: true,
            RestNotifications: true,
            RemoteBackupSettings: new RemoteBackupSettings(string.Empty, string.Empty, false),
            LastSuccessfulRemoteBackupHash: string.Empty,
            LastBackupTime: DateTimeOffset.MinValue,
            BackupReminder: true,
            SplitWeightByDefault: false
        );
}

public record RemoteBackupSettings(string Endpoint, string ApiKey, bool IncludeFeedAccount)
{
    public bool Enabled => !string.IsNullOrWhiteSpace(Endpoint);
}
