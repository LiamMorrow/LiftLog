using LiftLog.Lib.Models;

namespace LiftLog.Lib.Store
{
    public interface IProgressStore
    {
        ValueTask ClearCurrentSessionAsync();
        ValueTask<Session?> GetCurrentSessionAsync();

        ValueTask<
            Dictionary<ExerciseBlueprint, RecordedExercise>
        > GetLatestRecordedExercisesAsync();
        ValueTask<List<Session>> GetOrderedSessions();
        ValueTask SaveCompletedSessionAsync(Session session);
        ValueTask SaveCompletedSessionsAsync(IEnumerable<Session> sessions);
        ValueTask SaveCurrentSessionAsync(Session session);
    }
}
