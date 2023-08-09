using System.Collections.Immutable;
using LiftLog.Lib.Models;

namespace LiftLog.Ui.Repository
{
    public interface IProgressRepository
    {

        ValueTask<
            ImmutableDictionary<ExerciseBlueprint, RecordedExercise>
        > GetLatestRecordedExercisesAsync();
        IAsyncEnumerable<Session> GetOrderedSessions();
        ValueTask SaveCompletedSessionAsync(Session session);
        ValueTask SaveCompletedSessionsAsync(IEnumerable<Session> sessions);
        ValueTask DeleteSessionAsync(Session session);
    }
}
