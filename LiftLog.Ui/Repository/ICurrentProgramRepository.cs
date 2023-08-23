using LiftLog.Lib;
using LiftLog.Lib.Models;

namespace LiftLog.Ui.Repository;

public interface ICurrentProgramRepository
{
    ValueTask<ImmutableListValue<SessionBlueprint>> GetSessionsInProgramAsync();
    ValueTask PersistSessionsInProgramAsync(IReadOnlyList<SessionBlueprint> sessions);
}
