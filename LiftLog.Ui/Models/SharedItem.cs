using LiftLog.Ui.Store.Feed;

namespace LiftLog.Ui.Models;

internal partial class SharedItemPayload
{
    public static SharedItemPayload FromModel(SharedItem sharedItem)
    {
        return sharedItem switch
        {
            SharedProgramBlueprint sharedProgram
                => new SharedItemPayload
                {
                    SharedProgramBlueprint = new SharedProgramBlueprintPayload
                    {
                        ProgramBlueprint = ProgramBlueprintDao.ProgramBlueprintDaoV1.FromModel(
                            sharedProgram.ProgramBlueprint
                        ),
                    }
                },
            _ => throw new System.NotImplementedException()
        };
    }

    public SharedItem? ToModel()
    {
        return this switch
        {
            {
                PayloadCase: PayloadOneofCase.SharedProgramBlueprint,
                SharedProgramBlueprint.ProgramBlueprint: { } programBlueprint
            }
                => new SharedProgramBlueprint(programBlueprint.ToModel()),
            _ => null
        };
    }
}
