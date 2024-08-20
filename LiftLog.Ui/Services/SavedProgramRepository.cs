using System.Buffers.Text;
using System.Collections.Immutable;
using System.Text.Json;
using Google.Protobuf;
using LiftLog.Lib;
using LiftLog.Lib.Models;
using LiftLog.Lib.Serialization;
using LiftLog.Ui.Models.ProgramBlueprintDao;
using LiftLog.Ui.Models.SessionBlueprintDao;

namespace LiftLog.Ui.Services;

public class SavedProgramRepository(IKeyValueStore keyValueStore)
{
    private const string StorageKey = "SavedPrograms";
    private bool _initialised;

    private ImmutableDictionary<Guid, ProgramBlueprint> _programs = ImmutableDictionary<
        Guid,
        ProgramBlueprint
    >.Empty;

    private Guid? _activePlanId;

    public async ValueTask<ImmutableDictionary<Guid, ProgramBlueprint>> GetSavedProgramsAsync()
    {
        await InitialiseAsync();
        return _programs;
    }

    public async ValueTask<Guid?> GetActivePlanIdAsync()
    {
        await InitialiseAsync();
        return _activePlanId;
    }

    public async ValueTask Persist(
        ImmutableDictionary<Guid, ProgramBlueprint> programs,
        Guid activePlanId
    )
    {
        await InitialiseAsync();
        _programs = programs;
        _activePlanId = activePlanId;
        await keyValueStore.SetItemAsync($"{StorageKey}-Version", "1");
        await keyValueStore.SetItemAsync(
            StorageKey,
            ProgramBlueprintDaoContainerV1.FromModel(_programs, activePlanId).ToByteArray()
        );
    }

    private async ValueTask InitialiseAsync()
    {
        if (!_initialised)
        {
            var version = await keyValueStore.GetItemAsync($"{StorageKey}-Version");
            if (version is null)
            {
                version = "1";
                await keyValueStore.SetItemAsync($"{StorageKey}-Version", "1");
            }

            var storedData = version switch
            {
                "1" => ProgramBlueprintDaoContainerV1.Parser.ParseFrom(
                    await keyValueStore.GetItemBytesAsync(StorageKey) ?? []
                ),
                _ => throw new Exception($"Unknown version {version} of {StorageKey}"),
            };
            _programs = storedData.ToModel();
            _activePlanId =
                storedData.ActiveProgramId == null ? null : Guid.Parse(storedData.ActiveProgramId);
            _initialised = true;
        }
    }
}
