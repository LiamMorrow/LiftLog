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

        public async IAsyncEnumerable<Session> GetOrderedSessions()
        {
            await InitialiseAsync();

            foreach (var session in _storedSessions.Select(day => day.Value)
                         .OrderByDescending(x => x.Date))
            {
                yield return session;
            }
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

        public ValueTask SaveCompletedSessionsAsync(IEnumerable<Session> sessions)
        {
            foreach (var session in sessions)
            {
                _storedSessions[session.Id] = session;
            }

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
            return await GetOrderedSessions()
                .SelectMany(x => x.RecordedExercises.ToAsyncEnumerable())
                .GroupBy(x => x.Blueprint)
                .ToDictionaryAwaitAsync(x => ValueTask.FromResult(x.Key), x => x.FirstAsync());
        }

        private record StorageDao(Session? CurrentSession, List<Session> CompletedSessions);
    }
}
