using System.Collections.Concurrent;
using System.Collections.Immutable;
using System.Text.Json;
using LiftLog.Lib.Models;
using LiftLog.Lib.Serialization;
using LiftLog.Ui.Repository;
using LiftLog.Ui.Models.SessionHistoryDao;
using LiftLog.Ui.Util;
using System.Diagnostics;

namespace LiftLog.Ui.Services
{
    public class KeyValueProgressRepository : IProgressRepository
    {
        private const string StorageKey = "Progress";
        private bool _initialised;
        private ImmutableDictionary<Guid, Session> _storedSessions = ImmutableDictionary<
            Guid,
            Session
        >.Empty;
        private readonly IKeyValueStore _keyValueStore;

        public KeyValueProgressRepository(IKeyValueStore keyValueStore)
        {
            _keyValueStore = keyValueStore;
        }

        public async IAsyncEnumerable<Session> GetOrderedSessions()
        {
            await InitialiseAsync();

            foreach (
                var session in _storedSessions
                    .Select(day => day.Value)
                    .OrderByDescending(x => x.Date)
                    .ThenByDescending(x => x.LastExercise?.LastRecordedSet?.CompletionTime)
            )
            {
                yield return session;
            }
        }

        public ValueTask SaveCompletedSessionAsync(Session session)
        {
            _storedSessions = _storedSessions.SetItem(session.Id, session);
            return PersistAsync();
        }

        public ValueTask SaveCompletedSessionsAsync(IEnumerable<Session> sessions)
        {
            _storedSessions = _storedSessions.SetItems(
                sessions.Select(x => new KeyValuePair<Guid, Session>(x.Id, x))
            );

            return PersistAsync();
        }

        public ValueTask DeleteSessionAsync(Session session)
        {
            _storedSessions = _storedSessions.Remove(session.Id);
            return PersistAsync();
        }

        private async ValueTask InitialiseAsync()
        {
            if (!_initialised)
            {
                _initialised = true;
                var sw = Stopwatch.StartNew();
                Console.WriteLine("Initialising progress repository");
                var version = await _keyValueStore.GetItemAsync($"{StorageKey}-Version");
                if (version is null)
                {
                    version = "1";
                    await _keyValueStore.SetItemAsync($"{StorageKey}-Version", "1");
                }
                var versionCheckTime = sw.ElapsedMilliseconds;
                sw.Restart();
                var storedDataJson = await _keyValueStore.GetItemAsync(StorageKey);
                var getStoredTime = sw.ElapsedMilliseconds;
                sw.Restart();

                SessionHistoryDaoContainer? storedData = version switch
                {
                    "1"
                        => JsonSerializer
                            .Deserialize<SessionHistoryDaoV1>(
                                storedDataJson ?? "null",
                                StorageJsonContext.Context.SessionHistoryDaoV1
                            )
                            ?.ToModel(),
                    _ => throw new Exception($"Unknown version {version} of {StorageKey}"),
                };
                var deserialiseTime = sw.ElapsedMilliseconds;
                sw.Restart();
                if (storedData is not null)
                {
                    _storedSessions = storedData.CompletedSessions;
                }
                var convertTime = sw.ElapsedMilliseconds;
                sw.Stop();
                Console.WriteLine(
                    $"Initialised progress repository in ({versionCheckTime}ms, {getStoredTime}ms, {deserialiseTime}ms, {convertTime}ms))"
                );
            }
        }

        private async ValueTask PersistAsync()
        {
            await Task.WhenAll(
                _keyValueStore.SetItemAsync($"{StorageKey}-Version", "1").AsTask(),
                _keyValueStore
                    .SetItemAsync(
                        StorageKey,
                        JsonSerializer.Serialize(
                            SessionHistoryDaoV1.FromModel(new(_storedSessions)),
                            StorageJsonContext.Context.SessionHistoryDaoV1
                        )
                    )
                    .AsTask()
            );
        }

        public ValueTask<
            ImmutableDictionary<KeyedExerciseBlueprint, RecordedExercise>
        > GetLatestRecordedExercisesAsync()
        {
            return GetOrderedSessions()
                .SelectMany(x => x.RecordedExercises.ToAsyncEnumerable())
                .GroupBy(x => (KeyedExerciseBlueprint)x.Blueprint)
                .ToImmutableDictionaryAwaitAsync(
                    x => ValueTask.FromResult(x.Key),
                    x => x.FirstAsync()
                );
        }
    }
}
