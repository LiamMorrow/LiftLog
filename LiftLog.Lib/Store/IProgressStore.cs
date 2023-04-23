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
        ValueTask SaveCurrentSessionAsync(Session session);
    }
}
