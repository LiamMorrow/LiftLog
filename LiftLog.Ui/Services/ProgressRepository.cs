using System.Collections.Concurrent;
using System.Collections.Immutable;
using System.Diagnostics;
using System.Diagnostics.CodeAnalysis;
using System.Text.Json;
using Google.Protobuf;
using LiftLog.Lib;
using LiftLog.Lib.Models;
using LiftLog.Lib.Serialization;
using LiftLog.Ui.Models;
using LiftLog.Ui.Models.SessionHistoryDao;
using Microsoft.Extensions.Logging;

namespace LiftLog.Ui.Services
{
    public class ProgressRepository(
        IKeyValueStore keyValueStore,
        ILogger<ProgressRepository> logger
    )
    {
        private const string StorageKey = "Progress";
        private bool _initialised;
        private int _initialising;

        private ImmutableDictionary<Guid, Session>? _storedSessions = null;

        public async IAsyncEnumerable<Session> GetOrderedSessions()
        {
            await InitialiseAsync();

            foreach (
                var session in _storedSessions
                    .Select(day => day.Value)
                    .OrderByDescending(x => x.Date)
                    .ThenByDescending(x => x.LastExercise?.LastRecordedSet?.Set?.CompletionTime)
            )
            {
                yield return session;
            }
        }

        public async ValueTask SaveCompletedSessionAsync(Session session)
        {
            await InitialiseAsync();
            _storedSessions = _storedSessions.SetItem(session.Id, session);
            await PersistAsync();
        }

        public async ValueTask SaveCompletedSessionsAsync(IEnumerable<Session> sessions)
        {
            await InitialiseAsync();
            _storedSessions = _storedSessions.SetItems(
                sessions.Select(x => new KeyValuePair<Guid, Session>(x.Id, x))
            );

            await PersistAsync();
        }

        public async ValueTask DeleteSessionAsync(Session session)
        {
            await InitialiseAsync();
            _storedSessions = _storedSessions.Remove(session.Id);
            await PersistAsync();
        }

        [MemberNotNull(nameof(_storedSessions))]
        private async ValueTask InitialiseAsync()
#pragma warning disable CS8774 // Member must have a non-null value when exiting.
        {
            if (!_initialised)
            {
                // If another thread is already initialising, wait for it to finish
                if (Interlocked.CompareExchange(ref _initialising, 1, 0) == 1)
                {
                    await Task.Delay(20);
                    await InitialiseAsync();
                    return;
                }

                _storedSessions = null!;
                var sw = Stopwatch.StartNew();
                var version = await keyValueStore.GetItemAsync($"{StorageKey}-Version");
                if (version is null)
                {
                    version = "2";
                    await keyValueStore.SetItemAsync($"{StorageKey}-Version", "2");
                }

                var versionCheckTime = sw.ElapsedMilliseconds;
                sw.Restart();

                SessionHistoryDaoContainer? storedData = version switch
                {
                    "1" => JsonSerializer
                        .Deserialize<SessionHistoryDaoV1>(
                            await keyValueStore.GetItemAsync(StorageKey) ?? "null",
                            StorageJsonContext.Context.SessionHistoryDaoV1
                        )
                        ?.ToModel(),
                    "2" => SessionHistoryDaoV2
                        .Parser.ParseFrom(await keyValueStore.GetItemBytesAsync(StorageKey) ?? [])
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
                logger.LogInformation(
                    "Initialised progress repository in ({versionCheckTime}ms, {deserialiseTime}ms, {convertTime}ms))",
                    versionCheckTime,
                    deserialiseTime,
                    convertTime
                );
                _initialised = true;
            }
        }
#pragma warning restore CS8774 // Member must have a non-null value when exiting.

        private async ValueTask PersistAsync()
        {
            if (_storedSessions is null)
            {
                throw new InvalidOperationException("Cannot persist null sessions");
            }
            await Task.WhenAll(
                keyValueStore.SetItemAsync($"{StorageKey}-Version", "2").AsTask(),
                keyValueStore
                    .SetItemAsync(
                        StorageKey,
                        SessionHistoryDaoV2
                            .FromModel(new SessionHistoryDaoContainer(_storedSessions))
                            .ToByteArray()
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

        public ValueTask<
            ImmutableDictionary<KeyedExerciseBlueprint, ImmutableListValue<DatedRecordedExercise>>
        > GetLatestOrderedRecordedExercisesAsync(int maxRecordsPerExercise)
        {
            return GetOrderedSessions()
                .SelectMany(x =>
                    x.RecordedExercises.Where(x => x.LastRecordedSet?.Set is not null)
                        .Select(ex => new DatedRecordedExercise(
                            x.Date.ToDateTime(ex.LastRecordedSet!.Set!.CompletionTime),
                            ex
                        ))
                        .ToAsyncEnumerable()
                )
                .GroupBy(x => (KeyedExerciseBlueprint)x.RecordedExercise.Blueprint)
                .ToImmutableDictionaryAwaitAsync(
                    x => ValueTask.FromResult(x.Key),
                    async x => await x.Take(maxRecordsPerExercise).ToImmutableListValueAsync()
                );
        }

        public async ValueTask<Session?> GetSessionAsync(Guid sessionId)
        {
            await InitialiseAsync();
            return _storedSessions.GetValueOrDefault(sessionId);
        }

        public async Task ClearAsync()
        {
            await keyValueStore.RemoveItemAsync(StorageKey);
            await keyValueStore.RemoveItemAsync($"{StorageKey}-Version");
            _storedSessions = ImmutableDictionary<Guid, Session>.Empty;
        }
    }
}
