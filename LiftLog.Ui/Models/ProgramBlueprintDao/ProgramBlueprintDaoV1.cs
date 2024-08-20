using System.Collections.Immutable;
using LiftLog.Ui.Models.SessionBlueprintDao;

namespace LiftLog.Ui.Models.ProgramBlueprintDao;

internal partial class ProgramBlueprintDaoContainerV1
{
    public static ProgramBlueprintDaoContainerV1 FromModel(
        ImmutableDictionary<Guid, Lib.Models.ProgramBlueprint> model,
        Guid activeProgramId
    ) =>
        new()
        {
            ProgramBlueprints =
            {
                model.ToDictionary(
                    x => x.Key.ToString(),
                    x => ProgramBlueprintDaoV1.FromModel(x.Value)
                ),
            },
            ActiveProgramId = activeProgramId.ToString(),
        };

    public ImmutableDictionary<Guid, Lib.Models.ProgramBlueprint> ToModel() =>
        ProgramBlueprints.ToImmutableDictionary(x => Guid.Parse(x.Key), x => x.Value.ToModel());
}

internal partial class ProgramBlueprintDaoV1
{
    public static ProgramBlueprintDaoV1 FromModel(Lib.Models.ProgramBlueprint model) =>
        new()
        {
            Name = model.Name,
            Sessions = { model.Sessions.Select(SessionBlueprintDaoV2.FromModel).ToImmutableList() },
            LastEdited = model.LastEdited,
        };

    public Lib.Models.ProgramBlueprint ToModel() =>
        new(
            Name,
            Sessions.Select(x => x.ToModel()).ToImmutableList(),
            LastEdited ?? DateOnly.FromDateTime(DateTime.Now)
        );
}
