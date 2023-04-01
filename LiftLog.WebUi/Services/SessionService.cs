using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Linq;
using System.Threading.Tasks;
using Blazored.LocalStorage;
using LiftLog.Lib.Models;
using LiftLog.Lib.Store;

namespace LiftLog.WebUi.Services;

public class SessionService
{
    private readonly IProgressStore progressStore;

    public SessionService(IProgressStore progressStore)
    {
        this.progressStore = progressStore;
    }

    private static Rest DefaultRest =
        new(TimeSpan.FromSeconds(90), TimeSpan.FromMinutes(3), TimeSpan.FromMinutes(5));
    private readonly List<SessionBlueprint> defaultSessionBlueprints =
        new()
        {
            new SessionBlueprint(
                "Workout A",
                ImmutableList.Create(
                    new ExerciseBlueprint("Squat", 5, 5, 20, 2.5m, DefaultRest),
                    new ExerciseBlueprint("Bench press", 5, 5, 20, 2.5m, DefaultRest),
                    new ExerciseBlueprint("Bent over row", 1, 5, 20, 2.5m, DefaultRest)
                )
            ),
            new SessionBlueprint(
                "Workout B",
                ImmutableList.Create(
                    new ExerciseBlueprint("Squat", 5, 5, 20, 2.5m, DefaultRest),
                    new ExerciseBlueprint("Overhead press", 5, 5, 20, 2.5m, DefaultRest),
                    new ExerciseBlueprint("Dead lift", 1, 5, 20, 5m, DefaultRest)
                )
            ),
        };

    public async Task<Session> GetCurrentOrNextSession()
    {
        var currentSession = await progressStore.GetCurrentSessionAsync();
        if (currentSession != null)
            return currentSession;

        var latestSession = await progressStore.GetOrderedSessions().FirstOrDefaultAsync();
        if (latestSession == null)
        {
            return CreateNewSession(defaultSessionBlueprints[0]);
        }

        // We need the blueprint that comes after this session
        var lastBlueprint = latestSession.Blueprint;
        var lastBlueprintIndex = defaultSessionBlueprints.IndexOf(lastBlueprint);
        return CreateNewSession(
            defaultSessionBlueprints[(lastBlueprintIndex + 1) % defaultSessionBlueprints.Count]
        );
    }

    private Session CreateNewSession(SessionBlueprint sessionBlueprint)
    {
        var latestRecordedExcercises = new Dictionary<ExerciseBlueprint, RecordedExercise>();
        return new Session(
            Guid.NewGuid(),
            sessionBlueprint,
            sessionBlueprint.Exercises
                .Select(
                    e =>
                        new RecordedExercise(
                            e,
                            e.InitialKilograms,
                            Enumerable
                                .Range(0, e.Sets)
                                .Select(_ => (RecordedSet?)null)
                                .ToImmutableList(),
                            false
                        )
                )
                .ToImmutableList(),
            DateTimeOffset.Now
        );
    }
}
