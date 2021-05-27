using Fluxor;

namespace LiftLog.WebUi.Store.CurrentSession
{
    public class CurrentSessionFeature : Feature<CurrentSessionState>
    {
        public override string GetName() => "CurrentSession";

        protected override CurrentSessionState GetInitialState() => new(null);
    }
}
