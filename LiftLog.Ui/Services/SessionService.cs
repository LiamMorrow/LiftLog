using System.Collections.Immutable;
using Fluxor;
using LiftLog.Lib;
using LiftLog.Lib.Models;
using LiftLog.Ui.Store.CurrentSession;
using LiftLog.Ui.Store.Settings;

namespace LiftLog.Ui.Services;

public class SessionService(
    IState<SettingsState> settingsState,
    IState<CurrentSessionState> currentSessionState,
    ProgressRepository progressRepository
)
{
    /// <summary>
    /// Returns all future sessions in order, including the current session if there is one.
    /// This enumerable is infinite, so ensure to limit output when consuming.
    /// </summary>
    public async IAsyncEnumerable<Session> GetUpcomingSessionsAsync(
        ImmutableListValue<SessionBlueprint> sessionBlueprints
    )
    {
        if (!sessionBlueprints.Any())
        {
            yield break;
        }

        var latestRecordedExercises = await progressRepository.GetLatestRecordedExercisesAsync();
        var currentSession = currentSessionState.Value.WorkoutSession;
        if (currentSession?.IsStarted == true)
            yield return currentSession;

        var latestSession = currentSession switch
        {
            { IsStarted: true } => currentSession,
            _ => await progressRepository
                .GetOrderedSessions()
                .FirstOrDefaultAsync(x => !x.IsFreeform),
        };
        if (latestSession == null)
        {
            latestSession = CreateNewSession(sessionBlueprints[0], latestRecordedExercises);
            yield return latestSession;
        }

        // We need the blueprint that comes after this session
        while (true)
        {
            latestSession = GetNextSession(
                latestSession,
                sessionBlueprints,
                latestRecordedExercises
            );
            yield return latestSession;
        }
    }

    public IAsyncEnumerable<Session> GetLatestSessionsAsync()
    {
        return progressRepository.GetOrderedSessions();
    }

    public async Task<Session> HydrateSessionFromBlueprint(SessionBlueprint sessionBlueprint)
    {
        var latestRecordedExercises = await progressRepository.GetLatestRecordedExercisesAsync();
        return CreateNewSession(sessionBlueprint, latestRecordedExercises);
    }

    private Session GetNextSession(
        Session previousSession,
        ImmutableList<SessionBlueprint> sessionBlueprints,
        IReadOnlyDictionary<KeyedExerciseBlueprint, RecordedExercise> latestRecordedExercises
    )
    {
        var lastBlueprint = previousSession.Blueprint;
        var lastBlueprintIndex = sessionBlueprints.FindIndex(x => x.Name == lastBlueprint.Name);
        return CreateNewSession(
            sessionBlueprints[(lastBlueprintIndex + 1) % sessionBlueprints.Count],
            latestRecordedExercises
        ) with
        {
            Bodyweight = previousSession.Bodyweight,
        };
    }

    private Session CreateNewSession(
        SessionBlueprint sessionBlueprint,
        IReadOnlyDictionary<KeyedExerciseBlueprint, RecordedExercise> latestRecordedExercises
    )
    {
        var splitWeightByDefault = settingsState.Value.SplitWeightByDefault;
        RecordedExercise GetNextExercise(ExerciseBlueprint e)
        {
            var lastExercise = latestRecordedExercises.GetValueOrDefault(e);
            var potentialSets = lastExercise switch
            {
                null or { PerSetWeight: false } => Enumerable.Repeat(
                    new PotentialSet(
                        null,
                        lastExercise?.PotentialSets.FirstOrDefault()?.Weight ?? 0
                    ),
                    e.Sets
                ),
                { IsSuccessForProgressiveOverload: true } => lastExercise.PotentialSets.Select(
                    x => new PotentialSet(null, x.Weight + e.WeightIncreaseOnSuccess)
                ),
                _ => lastExercise.PotentialSets.Select(x => new PotentialSet(null, x.Weight)),
            };
            return new RecordedExercise(
                e,
                potentialSets.ToImmutableList(),
                null,
                splitWeightByDefault || (lastExercise?.PerSetWeight ?? false)
            );
        }

        return new Session(
            Guid.NewGuid(),
            sessionBlueprint,
            sessionBlueprint.Exercises.Select(GetNextExercise).ToImmutableList(),
            DateOnly.FromDateTime(DateTime.Now),
            null
        );
    }
}
