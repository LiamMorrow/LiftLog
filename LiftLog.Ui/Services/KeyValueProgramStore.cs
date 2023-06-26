using System.Collections.Immutable;
using System.Text.Json;
using LiftLog.Lib;
using LiftLog.Lib.Models;
using LiftLog.Lib.Serialization;
using LiftLog.Lib.Store;
using LiftLog.Ui.Models.SessionBlueprintDao;
using LiftLog.Ui.Util;

namespace LiftLog.Ui.Services;

public class KeyValueProgramStore : IProgramStore
{
    private const string StorageKey = "Program";
    private bool _initialised;
    private readonly IKeyValueStore _keyValueStore;

    private ImmutableListSequence<SessionBlueprint> _sessions =
        ImmutableList.Create<SessionBlueprint>();

    private static readonly Rest DefaultRest =
        new(TimeSpan.FromSeconds(90), TimeSpan.FromMinutes(3), TimeSpan.FromMinutes(5));

    private readonly ImmutableListSequence<SessionBlueprint> _defaultSessionBlueprints =
        ImmutableList.Create(
            new SessionBlueprint(
                "Workout A",
                ImmutableList.Create(
                    new ExerciseBlueprint("Squat", 5, 5, 20, 2.5m, DefaultRest),
                    new ExerciseBlueprint("Bench press", 5, 5, 20, 2.5m, DefaultRest),
                    new ExerciseBlueprint("Bent over row", 5, 5, 20, 2.5m, DefaultRest)
                )
            ),
            new SessionBlueprint(
                "Workout B",
                ImmutableList.Create(
                    new ExerciseBlueprint("Squat", 5, 5, 20, 2.5m, DefaultRest),
                    new ExerciseBlueprint("Overhead press", 5, 5, 20, 2.5m, DefaultRest),
                    new ExerciseBlueprint("Dead lift", 1, 5, 20, 5m, DefaultRest)
                )
            )
        );

    public KeyValueProgramStore(IKeyValueStore keyValueStore)
    {
        _keyValueStore = keyValueStore;
    }

    public async ValueTask<ImmutableListSequence<SessionBlueprint>> GetSessionsInProgramAsync()
    {
        await InitialiseAsync();
        return _sessions;
    }

    public async ValueTask PersistSessionsInProgramAsync(IReadOnlyList<SessionBlueprint> sessions)
    {
        await InitialiseAsync();
        _sessions = sessions.ToImmutableList();
        await _keyValueStore.SetItemAsync($"{StorageKey}-Version", "1");
        await _keyValueStore.SetItemAsync(
            StorageKey,
            JsonSerializer.Serialize(SessionBlueprintContainerDaoV1.FromModel(_sessions), JsonSerializerSettings.LiftLog)
        );
    }

    private async ValueTask InitialiseAsync()
    {
        if (!_initialised)
        {
            var version = await _keyValueStore.GetItemAsync($"{StorageKey}-Version");
            if (version is null)
            {
                version = "1";
                await _keyValueStore.SetItemAsync($"{StorageKey}-Version", "1");
            }
            var storedDataJson = await _keyValueStore.GetItemAsync(StorageKey);
            var storedData = version switch
            {
                "1" => JsonSerializer.Deserialize<SessionBlueprintContainerDaoV1?>(
                    storedDataJson ?? "null",
                    JsonSerializerSettings.LiftLog
                )?.ToModel(),
                _ => throw new Exception($"Unknown version {version} of {StorageKey}"),
            };
            _sessions = storedData ?? _defaultSessionBlueprints;
            _initialised = true;
        }
    }
}
