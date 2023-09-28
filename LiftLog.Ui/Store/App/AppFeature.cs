using System.Collections.Immutable;
using Fluxor;
using LiftLog.Lib.Models;
using LiftLog.Ui.Store.App;

namespace LiftLog.Ui.Store.App;

public class AppFeature : Feature<AppState>
{
    public override string GetName() => nameof(AppFeature);

    protected override AppState GetInitialState() =>
        new(
            Title: "LiftLog",
            ProState: new ProState(
#if TEST_MODE
                ProToken: "102bc25a-f46b-4423-9149-b0fa39b32f1e"
#else
                ProToken: null
#endif
            ),
            ReopenCurrentSession: true,
            BackNavigationUrl: null
        );
}
