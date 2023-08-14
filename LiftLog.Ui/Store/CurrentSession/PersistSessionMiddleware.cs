using System.Diagnostics;
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
        private CurrentSessionState? previousState;

        public PersistSessionMiddleware(IKeyValueStore _keyValueStore)
        {
            keyValueStore = _keyValueStore;
        }

        public override async Task InitializeAsync(IDispatcher dispatch, IStore store)
        {
            _store = store;
            var sw = Stopwatch.StartNew();
            var currentSessionStateJson = await keyValueStore.GetItemAsync(Key);
            var storageTime = sw.ElapsedMilliseconds;
            sw.Restart();
            try
            {
                var currentSessionState = currentSessionStateJson != null
                    ? JsonSerializer.Deserialize<CurrentSessionState>(
                        currentSessionStateJson,
                        StorageJsonContext.Context.CurrentSessionState)
                    : null;
                var deserializationTime = sw.ElapsedMilliseconds;
                sw.Stop();
                Console.WriteLine($"Deserialized current session state in (storage: {storageTime}ms | deserialization: {deserializationTime}ms | total: {storageTime + deserializationTime}ms)");
                if (currentSessionState is not null)
                {
                    store.Features["CurrentSession"].RestoreState(currentSessionState);
                }
            }
            catch (JsonException e)
            {
                Console.WriteLine("Failed to deserialize current session state", e);
            }
            dispatch.Dispatch(new RehydrateSessionAction());
        }

        public override async void AfterDispatch(object action)
        {
            var sw = Stopwatch.StartNew();
            var currentState = (CurrentSessionState?)_store?.Features["CurrentSession"].GetState();
            var currentStateTime = sw.ElapsedMilliseconds;
            sw.Restart();
            if (currentState != null && previousState != currentState)
            {
                previousState = currentState;
                var currentSessionState = JsonSerializer.Serialize(currentState, StorageJsonContext.Context.CurrentSessionState);
                var serializationTime = sw.ElapsedMilliseconds;
                sw.Restart();
                await keyValueStore.SetItemAsync(Key, currentSessionState);
                sw.Stop();
                Console.WriteLine($"Persisted current session state in (serialization: {serializationTime}ms |currentState {currentStateTime}ms | storage: {sw.ElapsedMilliseconds}ms | total: {currentStateTime + serializationTime + sw.ElapsedMilliseconds}ms)");
            }
        }
    }
}
