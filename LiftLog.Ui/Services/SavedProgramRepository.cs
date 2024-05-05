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

    public async ValueTask<ImmutableDictionary<Guid, ProgramBlueprint>> GetSavedProgramsAsync()
    {
        await InitialiseAsync();
        return _programs;
    }

    public async ValueTask PersistProgramsAsync(
        ImmutableDictionary<Guid, ProgramBlueprint> programs
    )
    {
        await InitialiseAsync();
        _programs = programs;
        await keyValueStore.SetItemAsync($"{StorageKey}-Version", "1");
        await keyValueStore.SetItemAsync(
            StorageKey,
            ProgramBlueprintDaoContainerV1.FromModel(_programs).ToByteArray()
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
                "1"
                    => ProgramBlueprintDaoContainerV1
                        .Parser.ParseFrom(await keyValueStore.GetItemBytesAsync(StorageKey) ?? [])
                        .ToModel(),
                _ => throw new Exception($"Unknown version {version} of {StorageKey}"),
            };
            _programs = storedData;
            _initialised = true;
        }
    }
}
