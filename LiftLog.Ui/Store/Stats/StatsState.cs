using System.Collections.Immutable;
using System.Diagnostics.CodeAnalysis;
using LiftLog.Lib;
using LiftLog.Lib.Models;

namespace LiftLog.Ui.Store.Stats;

public record StatsState(
    ImmutableListValue<ExerciseStatisticOverTime> ExerciseStats,
    ImmutableListValue<StatisticOverTime> SessionStats,
    StatisticOverTime BodyweightStats,
    bool IsDirty,
    bool IsLoading
);

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
