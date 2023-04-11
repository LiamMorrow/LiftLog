using LiftLog.Lib.Models;

namespace LiftLog.Lib.Store;

public interface IProgramStore
{
    ValueTask<ImmutableListSequence<SessionBlueprint>> GetSessionsInProgramAsync();
    ValueTask PersistSessionsInProgramAsync(IReadOnlyList<SessionBlueprint> sessions);
}