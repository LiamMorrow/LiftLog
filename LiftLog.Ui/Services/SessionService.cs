using System.Collections.Immutable;
using Fluxor;
using LiftLog.Lib.Models;
using LiftLog.Ui.Repository;
using LiftLog.Ui.Store.CurrentSession;
using LiftLog.Ui.Util;

namespace LiftLog.Ui.Services;

public class SessionService
{
    private readonly IState<CurrentSessionState> _currentSessionState;
    private readonly IProgressRepository _progressRepository;
    private readonly ICurrentProgramRepository _programRepository;

    public SessionService(
        IState<CurrentSessionState> currentSessionState,
        IProgressRepository progressRepository,
        ICurrentProgramRepository programRepository
    )
    {
        _currentSessionState = currentSessionState;
        _progressRepository = progressRepository;
        _programRepository = programRepository;
    }

    /// <summary>
    /// Returns all future sessions in order, including the current session if there is one.
    /// This enumerable is infinite, so ensure to limit output when consuming.
    /// </summary>
    public async IAsyncEnumerable<Session> GetUpcomingSessionsAsync()
    {
        var sessionBluePrints = await _programRepository.GetSessionsInProgramAsync();
        if (!sessionBluePrints.Any())
        {
            yield break;
        }
        var latestRecordedExercises = await _progressRepository.GetLatestRecordedExercisesAsync();
        var currentSession = _currentSessionState.Value.WorkoutSession;
        if (currentSession?.IsStarted == true)
            yield return currentSession;

        var latestSession = currentSession switch
        {
            { IsStarted: true } => currentSession,
            _ => await _progressRepository.GetOrderedSessions().FirstOrDefaultAsync()
        };
        if (latestSession == null)
        {
            latestSession = CreateNewSession(sessionBluePrints[0], latestRecordedExercises);
            yield return latestSession;
        }

        // We need the blueprint that comes after this session
        while (true)
        {
            latestSession = GetNextSession(
                latestSession,
                sessionBluePrints,
                latestRecordedExercises
            );
            yield return latestSession;
        }
    }

    public IAsyncEnumerable<Session> GetLatestSessionsAsync()
    {
        return _progressRepository.GetOrderedSessions();
    }

    public async Task<Session> HydrateSessionFromBlueprint(SessionBlueprint sessionBlueprint)
    {
        var latestRecordedExercises = await _progressRepository.GetLatestRecordedExercisesAsync();
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
            Bodyweight = previousSession.Bodyweight
        };
    }

    private Session CreateNewSession(
        SessionBlueprint sessionBlueprint,
        IReadOnlyDictionary<KeyedExerciseBlueprint, RecordedExercise> latestRecordedExercises
    )
    {
        RecordedExercise GetNextExercise(ExerciseBlueprint e)
        {
            var lastExercise = latestRecordedExercises.GetValueOrDefault(e);
            var weight = lastExercise switch
            {
                null => e.InitialWeight,
                { SucceededAllSets: true } => lastExercise.Weight + e.WeightIncreaseOnSuccess,
                _ => lastExercise.Weight
            };
            return new RecordedExercise(
                e,
                weight,
                Enumerable
                    .Range(0, e.Sets)
                    .Select(_ => new PotentialSet(null, weight))
                    .ToImmutableList(),
                null
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
