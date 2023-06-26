using System.Collections.Concurrent;
using System.Collections.Immutable;
using System.Text.Json;
using LiftLog.Lib.Models;
using LiftLog.Lib.Serialization;
using LiftLog.Lib.Store;
using LiftLog.Ui.Models.SessionHistoryDao;
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

        public KeyValueProgressStore(IKeyValueStore keyValueStore)
        {
            _keyValueStore = keyValueStore;
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

        public ValueTask DeleteSessionAsync(Session session)
        {
            _storedSessions.Remove(session.Id, out _);
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
                var version = await _keyValueStore.GetItemAsync($"{StorageKey}-Version");
                if (version is null)
                {
                    version = "1";
                    await _keyValueStore.SetItemAsync($"{StorageKey}-Version", "1");
                }
                var storedDataJson = await _keyValueStore.GetItemAsync(StorageKey);
                var storedData = version switch
                {
                    "1" => JsonSerializer.Deserialize<SessionHistoryDaoV1?>(
                        storedDataJson ?? "null",
                        JsonSerializerSettings.LiftLog
                    )?.ToModel(),
                    _ => throw new Exception($"Unknown version {version} of {StorageKey}"),
                };
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

        private async ValueTask PersistAsync()
        {
            await _keyValueStore.SetItemAsync($"{StorageKey}-Version", "1");
            await _keyValueStore.SetItemAsync(
                StorageKey,
                JsonSerializer.Serialize(
                    SessionHistoryDaoV1.FromModel(new(_currentSession, _storedSessions.Values.ToImmutableList())),
                    JsonSerializerSettings.LiftLog
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
    }
}
