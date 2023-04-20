using Fluxor;

namespace LiftLog.Ui.Store.CurrentSession
{
    public class CurrentSessionFeature : Feature<CurrentSessionState>
    {
        public override string GetName() => "CurrentSession";

        protected override CurrentSessionState GetInitialState() => new(null, null);
    }
}
