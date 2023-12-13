using System.Diagnostics;
using System.Text.Json;
using Fluxor;
using LiftLog.Lib.Serialization;
using LiftLog.Ui.Models.CurrentSessionStateDao;
using LiftLog.Ui.Models.SessionHistoryDao;
using LiftLog.Ui.Services;
using Microsoft.Extensions.Logging;

namespace LiftLog.Ui.Store.CurrentSession
{
    public class PersistSessionMiddleware(
        IKeyValueStore _keyValueStore,
        ILogger<PersistSessionMiddleware> logger
    ) : Middleware
    {
        private const string Key = "CurrentSessionStateV1";
        private IStore? _store;
        private readonly IKeyValueStore keyValueStore = _keyValueStore;
        private readonly ILogger<PersistSessionMiddleware> logger = logger;
        private CurrentSessionState? previousState;

        public override async Task InitializeAsync(IDispatcher dispatch, IStore store)
        {
            _store = store;
            var sw = Stopwatch.StartNew();
            var currentSessionStateJson = await keyValueStore.GetItemAsync(Key);
            var storageTime = sw.ElapsedMilliseconds;
            sw.Restart();
            try
            {
                var currentSessionState =
                    currentSessionStateJson != null
                        ? JsonSerializer.Deserialize<CurrentSessionStateDaoV1>(
                            currentSessionStateJson,
                            StorageJsonContext.Context.CurrentSessionStateDaoV1
                        )
                        : null;
                var deserializationTime = sw.ElapsedMilliseconds;
                sw.Stop();
                logger.LogInformation(
                    $"Deserialized current session state in (storage: {storageTime}ms | deserialization: {deserializationTime}ms | total: {storageTime + deserializationTime}ms)"
                );
                if (currentSessionState is not null)
                {
                    store.Features["CurrentSession"].RestoreState(currentSessionState.ToModel());
                }
            }
            catch (JsonException e)
            {
                logger.LogError(e, "Failed to deserialize current session state");
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
                try
                {
                    var currentSessionState = JsonSerializer.Serialize(
                        CurrentSessionStateDaoV1.FromModel(currentState),
                        StorageJsonContext.Context.CurrentSessionStateDaoV1
                    );
                    var serializationTime = sw.ElapsedMilliseconds;
                    sw.Restart();
                    await keyValueStore.SetItemAsync(Key, currentSessionState);
                    sw.Stop();
                    logger.LogInformation(
                        $"Persisted current session state in (serialization: {serializationTime}ms |currentState {currentStateTime}ms | storage: {sw.ElapsedMilliseconds}ms | total: {currentStateTime + serializationTime + sw.ElapsedMilliseconds}ms)"
                    );
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Failed to persist current session state");
                }
            }
        }
    }
}
