using Fluxor;

namespace LiftLog.Ui.Store.Settings;

public class SettingsFeature : Feature<SettingsState>
{
    public override string GetName() => nameof(SettingsFeature);

    protected override SettingsState GetInitialState() =>
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
            StatusBarFix: false,
            RestNotifications: true,
            RemoteBackupSettings: new RemoteBackupSettings(string.Empty, string.Empty, false)
        );
}
