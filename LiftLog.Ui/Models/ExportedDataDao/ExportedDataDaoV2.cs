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

    public static ExportedDataDaoV2 FromV1(ExportedDataDaoV1 v1)
    {
        var activePlanId = Guid.NewGuid();
        var plans = new Dictionary<string, ProgramBlueprintDaoV1>
        {
            [activePlanId.ToString()] = ProgramBlueprintDaoV1.FromModel(
                new ProgramBlueprint(
                    "My Plan",
                    Lib.Models.Experience.Beginner,
                    null,
                    v1.Program.Count,
                    v1.Program.Select(x => x.ToModel()).ToImmutableList(),
                    DateOnly.FromDateTime(DateTime.Now)
                )
            )
        };

        return new ExportedDataDaoV2(
            v1.Sessions.Select(x => x.ToModel()).Select(SessionDaoV2.FromModel),
            plans,
            activePlanId
        );
    }
}
