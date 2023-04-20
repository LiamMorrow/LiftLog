using System.Collections.Concurrent;
using LiftLog.Lib.Models;
using LiftLog.Lib.Store;

namespace LiftLog.WebUi.Services
{
    public class LocalStorageProgressStore : IProgressStore
    {
        private bool _initialised;
        private Session? _currentSession;
        private readonly ConcurrentDictionary<Guid, Session> _storedSessions = new();
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
        }

        private async ValueTask PersistAsync()
        {
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
