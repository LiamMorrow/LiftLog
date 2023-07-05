using System.Text.Json;
using Fluxor;
using LiftLog.Lib.Serialization;
using LiftLog.Ui.Services;

namespace LiftLog.Ui.Store.CurrentSession
{
    public class PersistSessionMiddleware : Middleware
    {
        private const string Key = "CurrentSessionState";
        private IStore? _store;
        private readonly IKeyValueStore keyValueStore;

        public PersistSessionMiddleware(IKeyValueStore _keyValueStore)
        {
            keyValueStore = _keyValueStore;
        }

        public override async Task InitializeAsync(IDispatcher dispatch, IStore store)
        {
            _store = store;
            var currentSessionStateJson = await keyValueStore.GetItemAsync(Key);
            var currentSessionState = currentSessionStateJson != null ? JsonSerializer.Deserialize<CurrentSessionState>(currentSessionStateJson, JsonSerializerSettings.LiftLog) : null;
            if (currentSessionState is not null)
            {
                store.Features["CurrentSession"].RestoreState(currentSessionState);
            }
            dispatch.Dispatch(new RehydrateSessionAction());
        }

        public override void AfterDispatch(object action)
        {
            var currentState = (CurrentSessionState?)_store?.Features["CurrentSession"].GetState();
            var currentSessionState = JsonSerializer.Serialize(currentState, JsonSerializerSettings.LiftLog);
            keyValueStore.SetItemAsync(Key, currentSessionState);
        }
    }
}
