import { LocalDateRange } from '@/models/time-models';
import { WeightedExerciseStatistics } from '@/store/stats';

export function formatWeeklyRate(value: number) {
  return Math.abs(value - Math.round(value)) < 0.05
    ? Math.round(value).toString()
    : value.toFixed(1);
}

export function getWeightedExerciseSetsPerWeek(
  stats: WeightedExerciseStatistics,
  timePeriod: LocalDateRange,
) {
  const totalSets = Object.values(stats.repsStatistics.breakdown).reduce(
    (sum, { numberOfSets }) => sum + numberOfSets,
    0,
  );
  const totalDays =
    timePeriod.to.toEpochDay() - timePeriod.from.toEpochDay() + 1;
  return totalSets / Math.max(totalDays / 7, 1 / 7);
}

export function getUsualRepRange(stats: WeightedExerciseStatistics) {
  const sortedBreakdown = Object.entries(stats.repsStatistics.breakdown)
    .map(([reps, { numberOfSets }]) => ({
      reps: Number(reps),
      numberOfSets,
    }))
    .sort((a, b) => a.reps - b.reps);

  if (!sortedBreakdown.length) {
    return '-';
  }

  const totalSets = sortedBreakdown.reduce(
    (sum, { numberOfSets }) => sum + numberOfSets,
    0,
  );

  const lowerBound = getRepsAtPercentile(sortedBreakdown, totalSets, 0.1);
  const upperBound = getRepsAtPercentile(sortedBreakdown, totalSets, 0.9);
  return `${lowerBound}-${upperBound}`;
}

function getRepsAtPercentile(
  sortedBreakdown: { reps: number; numberOfSets: number }[],
  totalSets: number,
  percentile: number,
) {
  const targetSet = Math.ceil(totalSets * percentile);
  let seenSets = 0;

  for (const { reps, numberOfSets } of sortedBreakdown) {
    seenSets += numberOfSets;
    if (seenSets >= targetSet) {
      return reps.toString();
    }
  }

  return sortedBreakdown.at(-1)?.reps.toString() ?? '-';
}
