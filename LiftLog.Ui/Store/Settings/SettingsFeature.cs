using Fluxor;

namespace LiftLog.Ui.Store.Settings;

public class SettingsFeature : Feature<SettingsState>
{
    public override string GetName() => nameof(SettingsFeature);

    protected override SettingsState GetInitialState() =>
        new(AiWorkoutAttributes: null, IsGeneratingAiPlan: false, AiPlanError: null, AiPlan: null);
}
