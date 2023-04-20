using System.Collections.Immutable;
using LiftLog.Lib;
using LiftLog.Lib.Models;
using LiftLog.Lib.Store;

namespace LiftLog.App.Services;

public class LocalStorageProgramStore : IProgramStore
{
    private const string StorageKey = "Program";
    private bool _initialised;
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

    public LocalStorageProgramStore()
    {
    }

    public async ValueTask<ImmutableListSequence<SessionBlueprint>> GetSessionsInProgramAsync()
    {
        return _defaultSessionBlueprints;
    }

    public async ValueTask PersistSessionsInProgramAsync(IReadOnlyList<SessionBlueprint> sessions)
    {
    }

    private async ValueTask InitialiseAsync()
    {
    }

}
