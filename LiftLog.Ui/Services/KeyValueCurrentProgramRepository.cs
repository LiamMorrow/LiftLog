using System.Buffers.Text;
using System.Collections.Immutable;
using System.Text.Json;
using Google.Protobuf;
using LiftLog.Lib;
using LiftLog.Lib.Models;
using LiftLog.Lib.Serialization;
using LiftLog.Ui.Models.SessionBlueprintDao;
using LiftLog.Ui.Repository;

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
        await keyValueStore.SetItemAsync($"{StorageKey}-Version", "2");
        await keyValueStore.SetItemAsync(
            StorageKey,
            SessionBlueprintContainerDaoV2.FromModel(_sessions).ToByteArray()
        );
    }

    private async ValueTask InitialiseAsync()
    {
        if (!_initialised)
        {
            var version = await keyValueStore.GetItemAsync($"{StorageKey}-Version");
            if (version is null)
            {
                version = "2";
                await keyValueStore.SetItemAsync($"{StorageKey}-Version", "2");
            }

            var storedData = version switch
            {
                "1"
                    => JsonSerializer
                        .Deserialize<SessionBlueprintContainerDaoV1>(
                            await keyValueStore.GetItemAsync(StorageKey) ?? "null",
                            StorageJsonContext.Context.SessionBlueprintContainerDaoV1
                        )
                        ?.ToModel(),
                "2"
                    => SessionBlueprintContainerDaoV2
                        .Parser.ParseFrom(await keyValueStore.GetItemBytesAsync(StorageKey) ?? [])
                        .ToModel(),
                _ => throw new Exception($"Unknown version {version} of {StorageKey}"),
            };
            _sessions = storedData ?? ImmutableList.Create<SessionBlueprint>();
            _initialised = true;
        }
    }
}
