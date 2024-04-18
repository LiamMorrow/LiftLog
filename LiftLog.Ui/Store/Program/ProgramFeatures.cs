using System.Collections.Immutable;
using Fluxor;
using LiftLog.Lib;
using LiftLog.Lib.Models;

namespace LiftLog.Ui.Store.Program;

public class ProgramFeature : Feature<ProgramState>
{
    public override string GetName() => nameof(ProgramFeature);

    protected override ProgramState GetInitialState() =>
        new(
            IsHydrated: false,
            SessionBlueprints: [],
            UpcomingSessions: [],
            IsLoadingUpcomingSessions: true
        );
}
