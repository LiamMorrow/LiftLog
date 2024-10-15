using System.Collections.Immutable;
using Fluxor;
using LiftLog.Lib.Models;
using LiftLog.Ui.Models;
using LiftLog.Ui.Store.App;

namespace LiftLog.Ui.Store.App;

public class AppFeature : Feature<AppState>
{
    public override string GetName() => nameof(AppFeature);

    protected override AppState GetInitialState() => AppState.InitialState;
}
