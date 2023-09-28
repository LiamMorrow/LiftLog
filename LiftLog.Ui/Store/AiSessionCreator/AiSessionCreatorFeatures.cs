using System.Collections.Immutable;
using Fluxor;
using LiftLog.Lib;
using LiftLog.Lib.Models;

namespace LiftLog.Ui.Store.AiSessionCreator;

public class AiSessionCreatorFeature : Feature<AiSessionCreatorState>
{
    public override string GetName() => nameof(AiSessionCreatorFeature);

    protected override AiSessionCreatorState GetInitialState() => new(false, null, null);
}
