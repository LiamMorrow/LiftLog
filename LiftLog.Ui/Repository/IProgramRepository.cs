using LiftLog.Lib;
using LiftLog.Lib.Models;

namespace LiftLog.Ui.Repository;

public interface IProgramRepository
{
    ValueTask<ImmutableListValue<SessionBlueprint>> GetSessionsInProgramAsync();
    ValueTask PersistSessionsInProgramAsync(IReadOnlyList<SessionBlueprint> sessions);
}
