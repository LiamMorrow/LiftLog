using System.Collections.Immutable;
using System.Text.Json;
using LiftLog.Lib;
using LiftLog.Lib.Models;
using LiftLog.Lib.Serialization;
using LiftLog.Ui.Models.SessionBlueprintDao;
using LiftLog.Ui.Repository;
using LiftLog.Ui.Util;

namespace LiftLog.Ui.Services;

public class KeyValueCurrentProgramRepository(IKeyValueStore keyValueStore)
    : ICurrentProgramRepository
{
    private const string StorageKey = "Program";
    private bool _initialised;
    private ImmutableListValue<SessionBlueprint> _sessions =
        ImmutableList.Create<SessionBlueprint>();

    public async ValueTask<ImmutableListValue<SessionBlueprint>> GetSessionsInProgramAsync()
    {
        await InitialiseAsync();
        return _sessions;
    }

    public async ValueTask PersistSessionsInProgramAsync(IReadOnlyList<SessionBlueprint> sessions)
    {
        await InitialiseAsync();
        _sessions = sessions.ToImmutableList();
        await keyValueStore.SetItemAsync($"{StorageKey}-Version", "1");
        await keyValueStore.SetItemAsync(
            StorageKey,
            JsonSerializer.Serialize(
                SessionBlueprintContainerDaoV1.FromModel(_sessions),
                StorageJsonContext.Context.SessionBlueprintContainerDaoV1
            )
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
            var storedDataJson = await keyValueStore.GetItemAsync(StorageKey);
            var storedData = version switch
            {
                "1"
                    => JsonSerializer
                        .Deserialize<SessionBlueprintContainerDaoV1>(
                            storedDataJson ?? "null",
                            StorageJsonContext.Context.SessionBlueprintContainerDaoV1
                        )
                        ?.ToModel(),
                _ => throw new Exception($"Unknown version {version} of {StorageKey}"),
            };
            _sessions = storedData ?? ImmutableList.Create<SessionBlueprint>();
            _initialised = true;
        }
    }
}
