using LiftLog.Lib;
using LiftLog.Lib.Models;

namespace LiftLog.Ui.Store.Stats;

public record StatsState(
    bool IsDirty,
    bool IsLoading,
    string? OverallViewSessionName,
    TimeSpan OverallViewTime,
    GranularStatisticView? OverallView,
    ImmutableListValue<PinnedExerciseStatistic> PinnedExerciseStatistics
)
{
    public bool IsExercisePinned(ExerciseStatistics exerciseStatistics) =>
        PinnedExerciseStatistics
            .Select(x => x.ExerciseName == exerciseStatistics.ExerciseName)
            .Any();

    public IEnumerable<ExerciseStatistics> GetPinnedExercises() =>
        PinnedExerciseStatistics
            .Select(x => x.ExerciseName)
            .Select(x => OverallView?.ExerciseStats.FirstOrDefault(y => y.ExerciseName == x))
            .WhereNotNull();
}

public record PinnedExerciseStatistic(string ExerciseName);

public record StatisticOverTime(string Title, ImmutableListValue<TimeTrackedStatistic> Statistics);

public record ExerciseStatistics(
    string ExerciseName,
    StatisticOverTime Statistics,
    StatisticOverTime OneRepMaxStatistics
)
{
    public decimal TotalLifted { get; } = Statistics.Statistics.Sum(x => x.Value);

    public decimal Max { get; } = Statistics.Statistics.Max(x => x.Value);

    public decimal Current => Statistics.Statistics[^1].Value;

    public decimal OneRepMax => OneRepMaxStatistics.Statistics[^1].Value;
}

public record TimeTrackedStatistic(DateTime DateTime, decimal Value);

public record GranularStatisticView(
    TimeSpan AverageTimeBetweenSets,
    TimeSpan AverageSessionLength,
    RecordedExercise? HeaviestLift,
    TimeSpentExercise? ExerciseMostTimeSpent,
    ImmutableListValue<ExerciseStatistics> ExerciseStats,
    ImmutableListValue<StatisticOverTime> SessionStats,
    StatisticOverTime BodyweightStats
);

public record TimeSpentExercise(string ExerciseName, TimeSpan TimeSpent);
