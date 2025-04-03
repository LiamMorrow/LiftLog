using System.Collections.Immutable;
using Fluxor;
using Google.Protobuf.WellKnownTypes;
using LiftLog.Lib;
using LiftLog.Lib.Models;
using LiftLog.Ui.Models;
using LiftLog.Ui.Services;
using LiftLog.Ui.Store.Program;

namespace LiftLog.Ui.Store.Stats;

public class StatsEffects(
    IState<StatsState> state,
    ProgressRepository progressRepository,
    IState<ProgramState> programState
)
{
    [EffectMethod]
    public async Task HandleFetchStats(FetchOverallStatsAction _, IDispatcher dispatcher)
    {
        if (!state.Value.IsDirty || state.Value.IsLoading)
        {
            return;
        }

        dispatcher.Dispatch(new SetStatsIsLoadingAction(true));

        var latestTime = DateOnly.FromDateTime(DateTime.Now);
        var earliestTime = DateOnly.FromDateTime(
            latestTime.ToDateTime(TimeOnly.MinValue, DateTimeKind.Local)
                - state.Value.OverallViewTime
        );

        var filteringToCurrentSessions = "CURRENT_SESSIONS".Equals(
            state.Value.OverallViewSessionName
        );
        var currentSessionNames = programState
            .Value.GetActivePlanSessionBlueprints()
            .Select(x => x.Name)
            .ToHashSet();

        await Task.Run(async () =>
        {
            var sessions = await progressRepository
                .GetOrderedSessions()
                .Where(session => session.Date >= earliestTime && session.Date <= latestTime)
                .Where(session =>
                    state.Value.OverallViewSessionName is null
                    || session.Blueprint.Name == state.Value.OverallViewSessionName
                    || (
                        filteringToCurrentSessions
                        && currentSessionNames.Contains(session.Blueprint.Name)
                    )
                )
                .ToListAsync();
            var sessionsWithExercises = sessions.Where(x => x.RecordedExercises.Any()).ToList();
            if (sessions.Count == 0)
            {
                dispatcher.Dispatch(new SetStatsIsLoadingAction(false));
                dispatcher.Dispatch(new SetOverallStatsAction(null));
                return;
            }

            var bodyweightStats = CreateBodyweightStatistic(sessions);
            var sessionStats = sessionsWithExercises
                .GroupBy(session => session.Blueprint.Name)
                .Select(CreateSessionStatistic)
                .ToImmutableList();

            var exerciseStats = sessionsWithExercises
                .SelectMany(x =>
                    x.RecordedExercises.Where(y => y.LastRecordedSet?.Set is not null)
                        .Select(ex => new DatedRecordedExercise(
                            ex.LastRecordedSet!.Set!.CompletionDateTime,
                            ex
                        ))
                )
                .GroupBy(
                    x => (KeyedExerciseBlueprint)x.RecordedExercise.Blueprint,
                    KeyedExerciseBlueprint.NormalizedNameOnlyEqualityComparer.Instance
                )
                .Select(CreateExerciseStatistic)
                .ToImmutableList();

            var averageTimeBetweenSets = sessionsWithExercises
                .SelectMany(x => x.RecordedExercises)
                .SelectMany(x =>
                    x.PotentialSets.Select(set => set.Set)
                        .WhereNotNull()
                        .Select(set => set.CompletionDateTime)
                        .Order()
                        .Pairwise((a, b) => b - a)
                )
                .Aggregate(
                    (TimeSpan.Zero, RunningAvg: 0),
                    (acc, x) => (acc.Zero + x, acc.RunningAvg + 1),
                    acc => acc.RunningAvg != 0 ? acc.Zero / acc.RunningAvg : TimeSpan.Zero
                );

            var averageSessionLength = sessionsWithExercises
                .Select(session => session.SessionLength)
                .WhereNotNull()
                .Aggregate(
                    (TimeSpan.Zero, 0),
                    (acc, x) => (acc.Zero + x, acc.Item2 + 1),
                    acc => acc.Item2 != 0 ? acc.Zero / acc.Item2 : TimeSpan.Zero
                );

            var exerciseMostTimeSpent = sessionsWithExercises
                .SelectMany(x => x.RecordedExercises)
                .Where(x => x.LastRecordedSet?.Set is not null)
                .GroupBy(
                    x => (KeyedExerciseBlueprint)x.Blueprint,
                    KeyedExerciseBlueprint.NormalizedNameOnlyEqualityComparer.Instance
                )
                .Select(x => new TimeSpentExercise(
                    x.First().Blueprint.Name,
                    x.Select(x => x.TimeSpent).Aggregate((a, b) => a + b)
                ))
                .MaxBy(x => x.TimeSpent);

            var heaviestLift = sessionsWithExercises
                .SelectMany(x => x.RecordedExercises)
                .Where(x => x.FirstRecordedSet is not null)
                .MaxBy(x => x.MaxWeightLifted);

            dispatcher.Dispatch(
                new SetOverallStatsAction(
                    new GranularStatisticView(
                        AverageTimeBetweenSets: averageTimeBetweenSets,
                        AverageSessionLength: averageSessionLength,
                        HeaviestLift: heaviestLift is null
                            ? null
                            : new(heaviestLift.Blueprint.Name, heaviestLift.MaxWeightLifted),
                        ExerciseMostTimeSpent: exerciseMostTimeSpent,
                        ExerciseStats: exerciseStats,
                        SessionStats: sessionStats,
                        BodyweightStats: bodyweightStats
                    )
                )
            );

            dispatcher.Dispatch(new SetStatsIsDirtyAction(false));
            dispatcher.Dispatch(new SetStatsIsLoadingAction(false));
        });
    }

    private static StatisticOverTime CreateBodyweightStatistic(IEnumerable<Session> sessions)
    {
        return new(
            "Bodyweight",
            sessions
                .Where(x => x.Bodyweight is not null)
                .Select(session => new TimeTrackedStatistic(
                    session.Date.ToDateTime(TimeOnly.MinValue, DateTimeKind.Local),
                    session.Bodyweight!.Value
                ))
                .ToImmutableList()
        );
    }

    private static StatisticOverTime CreateSessionStatistic(IGrouping<string, Session> sessions)
    {
        return new StatisticOverTime(
            sessions.Key,
            sessions
                .Select(session => new TimeTrackedStatistic(
                    session.Date.ToDateTime(TimeOnly.MinValue, DateTimeKind.Local),
                    session.TotalWeightLifted
                ))
                .ToImmutableList()
        );
    }

    private static ExerciseStatistics CreateExerciseStatistic<T>(
        IGrouping<T, DatedRecordedExercise> exercises
    )
    {
        return new ExerciseStatistics(
            exercises.First().RecordedExercise.Blueprint.Name,
            Statistics: new StatisticOverTime(
                exercises.First().RecordedExercise.Blueprint.Name,
                exercises
                    .Select(exercise => new TimeTrackedStatistic(
                        exercise.DateTime,
                        exercise.RecordedExercise.MaxWeightLifted
                    ))
                    .ToImmutableList()
            ),
            OneRepMaxStatistics: new StatisticOverTime(
                "One Rep Max",
                exercises
                    .Select(exercise => new TimeTrackedStatistic(
                        exercise.DateTime,
                        exercise.RecordedExercise.OneRepMax
                    ))
                    .ToImmutableList()
            )
        );
    }
}
