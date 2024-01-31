using LiftLog.Lib;
using LiftLog.Lib.Models;

namespace LiftLog.Ui.Store.Stats;

public record StatsState(
    bool IsDirty,
    bool IsLoading,
    string? OverallViewSessionName,
    TimeSpan OverallViewTime,
    GranularStatisticView? OverallView,
    ImmutableListValue<PinnedStatistic> PinnedStatistics
);

public enum StatisticType
{
    Bodyweight = 0,
    Exercise = 1,
    Session = 2,
}

public record PinnedStatistic(StatisticType Type, string Title);

public record StatisticOverTime(string Title, ImmutableListValue<TimeTrackedStatistic> Statistics);

public record ExerciseStatisticOverTime(
    string Title,
    ImmutableListValue<TimeTrackedStatistic> Statistics,
    decimal OneRepMax
) : StatisticOverTime(Title, Statistics)
{
    public decimal TotalLifted { get; } = Statistics.Sum(x => x.Value);

    public decimal Max { get; } = Statistics.Max(x => x.Value);

    public decimal Current => Statistics[^1].Value;
}

public record TimeTrackedStatistic(DateTime DateTime, decimal Value);

public record GranularStatisticView(
    TimeSpan AverageTimeBetweenSets,
    TimeSpan AverageSessionLength,
    RecordedExercise? HeaviestLift,
    TimeSpentExercise? ExerciseMostTimeSpent,
    ImmutableListValue<ExerciseStatisticOverTime> ExerciseStats,
    ImmutableListValue<StatisticOverTime> SessionStats,
    StatisticOverTime BodyweightStats
);

public record TimeSpentExercise(string ExerciseName, TimeSpan TimeSpent);
