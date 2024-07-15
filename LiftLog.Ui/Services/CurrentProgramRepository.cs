using System.Buffers.Text;
using System.Collections.Immutable;
using System.Text.Json;
using Google.Protobuf;
using LiftLog.Lib;
using LiftLog.Lib.Models;
using LiftLog.Lib.Serialization;
using LiftLog.Ui.Models.SessionBlueprintDao;

namespace LiftLog.Ui.Services;

public class CurrentProgramRepository(IKeyValueStore keyValueStore)
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
                "2"
                    => SessionBlueprintContainerDaoV2
                        .Parser.ParseFrom(await keyValueStore.GetItemBytesAsync(StorageKey) ?? [])
                        .ToModel(),
                _
                    => throw new InvalidOperationException(
                        $"Unknown version {version} of {StorageKey}"
                    ),
            };
            _sessions = storedData ?? ImmutableList.Create<SessionBlueprint>();
            _initialised = true;
        }
    }
}
