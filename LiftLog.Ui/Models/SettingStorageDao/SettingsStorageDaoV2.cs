using LiftLog.Ui.Models.ProgramBlueprintDao;
using LiftLog.Ui.Models.SessionBlueprintDao;
using LiftLog.Ui.Models.SessionHistoryDao;

namespace LiftLog.Ui.Models.SettingsStorageDao;

internal partial class SettingsStorageDaoV2
{
    public SettingsStorageDaoV2(
        IEnumerable<SessionDaoV2> sessions,
        IEnumerable<SessionBlueprintDaoV2> program,
        IDictionary<string, ProgramBlueprintDaoV1> savedPrograms
    )
    {
        Sessions.AddRange(sessions);
        Program.AddRange(program);
        SavedPrograms.Add(savedPrograms);
    }
}
