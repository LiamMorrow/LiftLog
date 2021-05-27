using Fluxor;
using LiftLog.Lib.Store;

namespace LiftLog.WebUi.Store.CurrentSession
{
    public class PersistSessionMiddleware : Middleware
    {
        private readonly IProgressStore _progressStore;
        private IStore? _store;

        public PersistSessionMiddleware(IProgressStore progressStore)
        {
            _progressStore = progressStore;
        }

        public override async Task InitializeAsync(IDispatcher dispatch, IStore store)
        {
            _store = store;
            var currentSession = await _progressStore.GetCurrentSessionAsync();
            if (currentSession is not null)
            {
                store.Features["CurrentSession"].RestoreState(
                    new CurrentSessionState(currentSession)
                );
            }
            dispatch.Dispatch(new RehydrateSessionAction());
        }

        public override void AfterDispatch(object action)
        {
            var currentState = (CurrentSessionState?)_store?.Features["CurrentSession"].GetState();
            if (currentState?.Session is null)
            {
                return;
            }

            _progressStore.SaveCurrentSessionAsync(currentState.Session);
        }
    }
}
