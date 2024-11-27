using Fluxor;

namespace LiftLog.Ui.Store.Settings;

public class SettingsFeature : Feature<SettingsState>
{
    public override string GetName() => nameof(SettingsFeature);

    protected override SettingsState GetInitialState() => SettingsState.Default;
}
