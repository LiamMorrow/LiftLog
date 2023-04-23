using System.Collections.Immutable;
using System.Text.Json;
using LiftLog.Lib;
using LiftLog.Lib.Models;
using LiftLog.Lib.Store;
using LiftLog.Ui.Util;

namespace LiftLog.Ui.Services;

public class KeyValueProgramStore : IProgramStore
{
    private const string StorageKey = "Program";
    private bool _initialised;
    private readonly IKeyValueStore _keyValueStore;
    private readonly JsonSerializerOptions _jsonSerializerOptions;

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
        _jsonSerializerOptions = new JsonSerializerOptions(JsonSerializerOptions.Default);
        _jsonSerializerOptions.Converters.Add(new TimespanJsonConverter());
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
        await _keyValueStore.SetItemAsync(
            StorageKey,
            JsonSerializer.Serialize(new StorageDao(_sessions), _jsonSerializerOptions)
        );
    }

    private async ValueTask InitialiseAsync()
    {
        if (!_initialised)
        {
            // TODO fix race
            var storedDataJson = await _keyValueStore.GetItemAsync(StorageKey);
            var storedData = JsonSerializer.Deserialize<StorageDao?>(
                storedDataJson ?? "null",
                _jsonSerializerOptions
            );
            _sessions = storedData?.SessionBlueprints ?? _defaultSessionBlueprints;
            _initialised = true;
        }
    }

    private record StorageDao(ImmutableListSequence<SessionBlueprint> SessionBlueprints);
}
