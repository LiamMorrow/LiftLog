using System.Collections.Immutable;
using LiftLog.Lib.Models;
using LiftLog.Ui.Models.ProgramBlueprintDao;
using LiftLog.Ui.Models.SessionBlueprintDao;
using LiftLog.Ui.Models.SessionHistoryDao;

namespace LiftLog.Ui.Models.ExportedDataDao;

internal partial class ExportedDataDaoV2
{
    public ExportedDataDaoV2(
        IEnumerable<SessionDaoV2> sessions,
        IDictionary<string, ProgramBlueprintDaoV1> savedPrograms,
        Guid activeProgramId
    )
    {
        Sessions.AddRange(sessions);
        ActiveProgramId = activeProgramId.ToString();
        SavedPrograms.Add(savedPrograms);
    }
}
