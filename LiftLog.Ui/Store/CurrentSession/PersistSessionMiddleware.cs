using System.Diagnostics;
using System.Text.Json;
using Fluxor;
using Google.Protobuf;
using LiftLog.Ui.Models.CurrentSessionStateDao;
using LiftLog.Ui.Services;
using Microsoft.Extensions.Logging;

namespace LiftLog.Ui.Store.CurrentSession
{
    public class PersistSessionMiddleware(
        IKeyValueStore _keyValueStore,
        ILogger<PersistSessionMiddleware> logger
    ) : Middleware
    {
        // Bad name, too late to change
        private const string StorageKey = "CurrentSessionStateV1";
        private IStore? _store;
        private readonly IKeyValueStore keyValueStore = _keyValueStore;
        private readonly ILogger<PersistSessionMiddleware> logger = logger;
        private CurrentSessionState? previousState;

        public override async Task InitializeAsync(IDispatcher dispatch, IStore store)
        {
            try
            {
                _store = store;
                var sw = Stopwatch.StartNew();
                var currentSessionVersion =
                    await keyValueStore.GetItemAsync($"{StorageKey}-Version") ?? "1";
                try
                {
                    var currentSessionState = currentSessionVersion switch
                    {
                        "2"
                            => CurrentSessionStateDaoV2
                                .Parser.ParseFrom(
                                    await keyValueStore.GetItemBytesAsync(StorageKey) ?? []
                                )
                                .ToModel(),
                        _ => null
                    };
                    var deserializationTime = sw.ElapsedMilliseconds;
                    sw.Stop();
                    logger.LogInformation(
                        $"Deserialized current session state in {deserializationTime}ms"
                    );
                    if (currentSessionState is not null)
                    {
                        store.Features["CurrentSession"].RestoreState(currentSessionState);
                    }
                }
                catch (JsonException e)
                {
                    logger.LogError(e, "Failed to deserialize current session state");
                }

                dispatch.Dispatch(new SetCurrentSessionHydratedAction());
            }
            catch (Exception e)
            {
                logger.LogError(e, "Failed to initialize current session state");
                throw;
            }
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
                    var currentSessionState = CurrentSessionStateDaoV2
                        .FromModel(currentState)
                        .ToByteArray();
                    var serializationTime = sw.ElapsedMilliseconds;
                    sw.Restart();
                    await keyValueStore.SetItemAsync(StorageKey, currentSessionState);
                    await keyValueStore.SetItemAsync($"{StorageKey}-Version", "2");
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
