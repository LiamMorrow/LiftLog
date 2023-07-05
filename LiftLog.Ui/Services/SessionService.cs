using System.Collections.Immutable;
using Fluxor;
using LiftLog.Lib.Models;
using LiftLog.Lib.Store;
using LiftLog.Ui.Store.CurrentSession;

namespace LiftLog.Ui.Services;

public class SessionService
{
    private readonly IState<CurrentSessionState> _currentSessionState;
    private readonly IProgressStore _progressStore;
    private readonly IProgramStore _programStore;

    public SessionService(IState<CurrentSessionState> currentSessionState, IProgressStore progressStore, IProgramStore programStore)
    {
        _currentSessionState = currentSessionState;
        _progressStore = progressStore;
        _programStore = programStore;
    }

    /// <summary>
    /// Returns all future sessions in order, including the current session if there is one.
    /// This enumerable is infinite, so ensure to limit output when consuming.
    /// </summary>
    public async IAsyncEnumerable<Session> GetUpcomingSessionsAsync()
    {
        var sessionBluePrints = await _programStore.GetSessionsInProgramAsync();
        if (!sessionBluePrints.Any())
        {
            yield break;
        }
        var latestRecordedExercises = await _progressStore.GetLatestRecordedExercisesAsync();
        var currentSession = _currentSessionState.Value.WorkoutSession;
        if (currentSession != null)
            yield return currentSession;

        var latestSession =
            currentSession ?? await _progressStore.GetOrderedSessions().FirstOrDefaultAsync();
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
        return _progressStore.GetOrderedSessions();
    }

    private Session GetNextSession(
        Session previousSession,
        ImmutableList<SessionBlueprint> sessionBlueprints,
        IReadOnlyDictionary<ExerciseBlueprint, RecordedExercise> latestRecordedExercises
    )
    {
        var lastBlueprint = previousSession.Blueprint;
        var lastBlueprintIndex = sessionBlueprints.IndexOf(lastBlueprint);
        return CreateNewSession(
            sessionBlueprints[(lastBlueprintIndex + 1) % sessionBlueprints.Count],
            latestRecordedExercises
        );
    }

    private Session CreateNewSession(
        SessionBlueprint sessionBlueprint,
        IReadOnlyDictionary<ExerciseBlueprint, RecordedExercise> latestRecordedExercises
    )
    {
        RecordedExercise GetNextExercise(ExerciseBlueprint e)
        {
            var lastExercise = latestRecordedExercises.GetValueOrDefault(e);
            return new RecordedExercise(
                e,
                lastExercise switch
                {
                    null => e.InitialKilograms,
                    { SucceededAllSets: true }
                        => lastExercise.Kilograms + e.KilogramsIncreaseOnSuccess,
                    _ => lastExercise.Kilograms
                },
                Enumerable.Range(0, e.Sets).Select(_ => (RecordedSet?)null).ToImmutableList()
            );
        }

        return new Session(
            Guid.NewGuid(),
            sessionBlueprint,
            sessionBlueprint.Exercises.Select(GetNextExercise).ToImmutableList(),
            DateTimeOffset.Now
        );
    }

}
