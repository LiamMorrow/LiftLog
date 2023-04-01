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

    public async Task<Session> GetCurrentOrNextSessionAsync()
    {
        var currentSession = await progressStore.GetCurrentSessionAsync();
        if (currentSession != null)
            return currentSession;

        var latestSession = (await progressStore.GetOrderedSessions()).FirstOrDefault();
        if (latestSession == null)
        {
            return await CreateNewSessionAsync(defaultSessionBlueprints[0]);
        }

        // We need the blueprint that comes after this session
        var lastBlueprint = latestSession.Blueprint;
        var lastBlueprintIndex = defaultSessionBlueprints.IndexOf(lastBlueprint);
        return await CreateNewSessionAsync(
            defaultSessionBlueprints[(lastBlueprintIndex + 1) % defaultSessionBlueprints.Count]
        );
    }

    private async Task<Session> CreateNewSessionAsync(SessionBlueprint sessionBlueprint)
    {
        var latestRecordedExcercises = await progressStore.GetLatestRecordedExercisesAsync();
        RecordedExercise getNextExercise(ExerciseBlueprint e)
        {
            var lastExercise = latestRecordedExcercises.GetValueOrDefault(e);
            return new RecordedExercise(
                e,
                lastExercise switch
                {
                    null => e.InitialKilograms,
                    { SucceededAllSets: true }
                        => lastExercise.Kilograms + e.KilogramsIncreaseOnSuccess,
                    _ => lastExercise.Kilograms
                },
                Enumerable.Range(0, e.Sets).Select(_ => (RecordedSet?)null).ToImmutableList(),
                false
            );
        }

        return new Session(
            Guid.NewGuid(),
            sessionBlueprint,
            sessionBlueprint.Exercises.Select(getNextExercise).ToImmutableList(),
            DateTimeOffset.Now
        );
    }
}
