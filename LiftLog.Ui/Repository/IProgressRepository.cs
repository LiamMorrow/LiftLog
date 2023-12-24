using System.Collections.Immutable;
using LiftLog.Lib;
using LiftLog.Lib.Models;
using LiftLog.Ui.Models;

namespace LiftLog.Ui.Repository
{
    public interface IProgressRepository
    {
        ValueTask<
            ImmutableDictionary<KeyedExerciseBlueprint, RecordedExercise>
        > GetLatestRecordedExercisesAsync();
        ValueTask<
            ImmutableDictionary<KeyedExerciseBlueprint, ImmutableListValue<DatedRecordedExercise>>
        > GetLatestOrderedRecordedExercisesAsync();
        IAsyncEnumerable<Session> GetOrderedSessions();
        ValueTask SaveCompletedSessionAsync(Session session);
        ValueTask SaveCompletedSessionsAsync(IEnumerable<Session> sessions);
        ValueTask DeleteSessionAsync(Session session);
    }
}
