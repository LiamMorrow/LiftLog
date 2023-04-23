using System.Collections.Concurrent;
using System.Text.Json;
using LiftLog.Lib.Models;
using LiftLog.Lib.Store;
using LiftLog.Ui.Util;

namespace LiftLog.Ui.Services
{
    public class KeyValueProgressStore : IProgressStore
    {
        private const string StorageKey = "Progress";
        private bool _initialised;
        private Session? _currentSession;
        private readonly ConcurrentDictionary<Guid, Session> _storedSessions = new();
        private readonly IKeyValueStore _keyValueStore;
        private readonly JsonSerializerOptions _jsonSerializerOptions;

        public KeyValueProgressStore(IKeyValueStore keyValueStore)
        {
            _keyValueStore = keyValueStore;
            _jsonSerializerOptions = new JsonSerializerOptions(JsonSerializerOptions.Default);
            _jsonSerializerOptions.Converters.Add(new TimespanJsonConverter());
        }

        public async ValueTask<List<Session>> GetOrderedSessions()
        {
            await InitialiseAsync();

            return _storedSessions.Select(day => day.Value).OrderByDescending(x => x.Date).ToList();
        }

        public async ValueTask<Session?> GetCurrentSessionAsync()
        {
            await InitialiseAsync();
            return _currentSession;
        }

        public ValueTask SaveCompletedSessionAsync(Session session)
        {
            _storedSessions[session.Id] = session;
            return PersistAsync();
        }

        public ValueTask SaveCurrentSessionAsync(Session session)
        {
            _currentSession = session;
            return PersistAsync();
        }

        public ValueTask ClearCurrentSessionAsync()
        {
            _currentSession = null;
            return PersistAsync();
        }

        private async ValueTask InitialiseAsync()
        {
            if (!_initialised)
            {
                // TODO fix race
                var storedDataJson = await _keyValueStore.GetItemAsync(StorageKey);
                var storedData = JsonSerializer.Deserialize<StorageDao?>(
                    storedDataJson ?? "null",
                    _jsonSerializerOptions
                );
                if (storedData is not null)
                {
                    foreach (var session in storedData.CompletedSessions)
                    {
                        _storedSessions[session.Id] = session;
                    }
                    _currentSession = storedData.CurrentSession;
                }
                _initialised = true;
            }
        }

        private ValueTask PersistAsync()
        {
            return _keyValueStore.SetItemAsync(
                StorageKey,
                JsonSerializer.Serialize(
                    new StorageDao(_currentSession, _storedSessions.Values.ToList()),
                    _jsonSerializerOptions
                )
            );
        }

        public async ValueTask<
            Dictionary<ExerciseBlueprint, RecordedExercise>
        > GetLatestRecordedExercisesAsync()
        {
            return (await GetOrderedSessions())
                .SelectMany(x => x.RecordedExercises)
                .GroupBy(x => x.Blueprint)
                .ToDictionary(x => x.Key, x => x.First());
        }

        private record StorageDao(Session? CurrentSession, List<Session> CompletedSessions);
    }
}
