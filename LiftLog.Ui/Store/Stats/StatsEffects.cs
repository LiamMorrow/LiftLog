using System.Collections.Immutable;
using Fluxor;
using LiftLog.Lib;
using LiftLog.Lib.Models;
using LiftLog.Ui.Models;
using LiftLog.Ui.Repository;
using LiftLog.Ui.Services;

namespace LiftLog.Ui.Store.Stats;

public class StatsEffects(IState<StatsState> state, IProgressRepository progressRepository)
{
    [EffectMethod()]
    public async Task HandleFetchStats(FetchStatsAction _, IDispatcher dispatcher)
    {
        if (!state.Value.IsDirty || state.Value.IsLoading)
        {
            return;
        }

        dispatcher.Dispatch(new SetStatsIsLoadingAction(true));

        await Task.Run(async () =>
        {
            var sessions = await progressRepository
                .GetOrderedSessions()
                .Where(x => x.RecordedExercises.Any())
                .ToListAsync();

            var bodyweightStats = CreateBodyweightStatistic(sessions);
            var sessionStats = sessions
                .GroupBy(session => session.Blueprint.Name)
                .Select(CreateSessionStatistic)
                .ToImmutableList();

            var exerciseStats = sessions
                .SelectMany(x =>
                    x.RecordedExercises.Where(x => x.LastRecordedSet?.Set is not null)
                        .Select(ex => new DatedRecordedExercise(
                            x.Date.ToDateTime(ex.LastRecordedSet!.Set!.CompletionTime),
                            ex
                        ))
                )
                .GroupBy(x => NormalizeName(x.RecordedExercise.Blueprint.Name))
                .Select(CreateExerciseStatistic)
                .ToImmutableList();

            dispatcher.Dispatch(
                new SetStatsAction(
                    ExerciseStats: exerciseStats,
                    SessionStats: sessionStats,
                    BodyweightStats: bodyweightStats
                )
            );

            dispatcher.Dispatch(new SetStatsIsDirtyAction(false));
            dispatcher.Dispatch(new SetStatsIsLoadingAction(false));
        });
    }

    private static string NormalizeName(string name)
    {
        var lowerName = name.ToLower().Trim().Replace("flies", "flys").Replace("flyes", "flys");
        var withoutPlural = lowerName switch
        {
            string s when s.EndsWith("es") => s[..^2],
            string s when s.EndsWith('s') => s[..^1],
            _ => lowerName
        };

        return withoutPlural;
    }

    private static StatisticOverTime CreateBodyweightStatistic(IEnumerable<Session> sessions)
    {
        return new(
            "Bodyweight",
            sessions
                .Where(x => x.Bodyweight is not null)
                .Select(session => new TimeTrackedStatistic(
                    session.Date.ToDateTime(TimeOnly.MinValue),
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
                    session.Date.ToDateTime(TimeOnly.MinValue),
                    session.TotalWeightLifted
                ))
                .ToImmutableList()
        );
    }

    private static ExerciseStatisticOverTime CreateExerciseStatistic(
        IEnumerable<DatedRecordedExercise> exercises
    )
    {
        return new ExerciseStatisticOverTime(
            exercises.First().RecordedExercise.Blueprint.Name,
            Statistics: exercises
                .Select(exercise => new TimeTrackedStatistic(
                    exercise.DateTime,
                    exercise.RecordedExercise.Weight
                ))
                .ToImmutableList(),
            OneRepMax: exercises.First().RecordedExercise.OneRepMax
        );
    }
}
