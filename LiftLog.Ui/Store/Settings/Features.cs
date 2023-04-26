using System.Collections.Immutable;
using Fluxor;
using LiftLog.Lib.Models;

namespace LiftLog.Ui.Store.Settings;

public class SettingsFeature : Feature<SettingsState>
{
    public override string GetName() => nameof(SettingsFeature);

    protected override SettingsState GetInitialState() => new();
}
