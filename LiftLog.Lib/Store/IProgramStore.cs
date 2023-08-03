using LiftLog.Lib.Models;

namespace LiftLog.Lib.Store;

public interface IProgramStore
{
    ValueTask<ImmutableListValue<SessionBlueprint>> GetSessionsInProgramAsync();
    ValueTask PersistSessionsInProgramAsync(IReadOnlyList<SessionBlueprint> sessions);
}
