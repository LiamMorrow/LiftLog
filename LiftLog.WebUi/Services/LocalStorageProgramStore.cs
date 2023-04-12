using System.Collections.Immutable;
using Blazored.LocalStorage;
using LiftLog.Lib;
using LiftLog.Lib.Models;
using LiftLog.Lib.Store;

namespace LiftLog.WebUi.Services;

public class LocalStorageProgramStore : IProgramStore
{
    private const string StorageKey = "Program";
    private bool _initialised;
    private readonly ILocalStorageService _localStorage;
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

    public LocalStorageProgramStore(ILocalStorageService localStorage)
    {
        _localStorage = localStorage;
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
        await _localStorage.SetItemAsync(StorageKey, new StorageDao(_sessions));
    }

    private async ValueTask InitialiseAsync()
    {
        if (!_initialised)
        {
            // TODO fix race
            var storedData = await _localStorage.GetItemAsync<StorageDao?>(StorageKey);
            _sessions = storedData?.SessionBlueprints ?? _defaultSessionBlueprints;
            _initialised = true;
        }
    }

    private record StorageDao(ImmutableListSequence<SessionBlueprint> SessionBlueprints);
}
