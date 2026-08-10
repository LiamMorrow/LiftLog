import { PotentialSet, RecordedCardioExercise, RecordedWeightedExercise, Session } from '@/models/session-models';
import { ExerciseBlueprint, MovementKey } from '@/models/blueprint-models';
import { LocalDateRange } from '@/models/time-models';
import { Weight, WeightUnit } from '@/models/weight';
import {
  GranularStatisticView,
  HeaviestLift,
  OptionalStatisticOverTime,
  RepsBreakdownStatistics,
  StatisticOverTime,
  TimeTrackedStatistic,
  WeightedExerciseStatistics,
  WeightedStatisticOverTime,
} from '@/store/stats';
import { loadOps, QuantityOps, repsOps, StatAxis } from '@/store/stats/quantity';
import { Duration, OffsetDateTime, ZoneId } from '@js-joda/core';
import BigNumber from 'bignumber.js';
import Enumerable from 'linq';

/** Epley: 1RM = weight * (1 + reps/30). `weight` is the effective load, folding in bodyweight. */
export function calculateOneRepMax(ps: PotentialSet, weight: Weight): Weight {
  const reps = ps.set!.repsCompleted;
  return weight.multipliedBy(new BigNumber(1).plus(new BigNumber(reps).div(30)));
}

export function calculateStats(
  sessions: Session[],
  preferredUnit: WeightUnit,
  timeRange: LocalDateRange,
): GranularStatisticView {
  if (!sessions.length)
    return {
      workoutsPerWeek: 0,
      setsPerWeek: 0,
      averageSessionLength: Duration.ZERO,
      maxWeightLiftedInAWorkout: undefined,
      bodyweightStats: {
        statistics: [],
        currentValue: Weight.NIL,
        totalValue: Weight.NIL,
        minValue: Weight.NIL,
        maxValue: Weight.NIL,
      },
      weightedExerciseStats: [],
      heaviestLift: undefined,
      sessionStats: [],
    };

  // Only sessions with at least one exercise
  const sessionsWithExercises = sessions.filter((s) => s.recordedExercises.length > 0);
  const daysBetween = Enumerable.from(sessionsWithExercises)
    .select((c) => c.date)
    .distinct((x) => x.toString())
    .toArray();
  const workoutCount = sessionsWithExercises.length;
  const totalSets = sessionsWithExercises.reduce(
    (sessionTotal, session) =>
      sessionTotal +
      session.recordedExercises.reduce((exerciseTotal, exercise) => {
        if (exercise instanceof RecordedWeightedExercise) {
          return exerciseTotal + exercise.potentialSets.filter((set) => set.set !== undefined).length;
        }
        return exerciseTotal + exercise.sets.filter((set) => set.completionDateTime !== undefined).length;
      }, 0),
    0,
  );
  const totalDays = timeRange.to.toEpochDay() - timeRange.from.toEpochDay() + 1;
  const totalWeeks = Math.max(totalDays / 7, 1);
  const workoutsPerWeek = workoutCount / totalWeeks;
  const setsPerWeek = totalSets / totalWeeks;

  const bodyWeightStatistics = Enumerable.from(sessions)
    .where((s) => !!s.bodyweight)
    .select((session) => ({
      dateTime: session.date.atTime(12, 0).atZone(ZoneId.systemDefault()).toOffsetDateTime(), // Use noon for LocalDate
      value: session.bodyweight!,
    }))
    .toArray();
  // --- Bodyweight stats over time ---
  const bodyweightStats: WeightedStatisticOverTime = toStatisticOverTime(bodyWeightStatistics, loadOps);

  // --- Session stats grouped by blueprint name ---
  const sessionStats: OptionalStatisticOverTime<Weight>[] = [];
  const sessionsByBlueprint = new Map<string, Session[]>();
  for (const session of sessionsWithExercises) {
    const key = session.blueprint.name;
    if (!sessionsByBlueprint.has(key)) sessionsByBlueprint.set(key, []);
    sessionsByBlueprint.get(key)!.push(session);
  }
  for (const [name, group] of sessionsByBlueprint.entries()) {
    const statistics = Enumerable.from(daysBetween)
      .select((date) => {
        const session = group.find((s) => s.date.equals(date));
        return {
          dateTime: date.atTime(12, 0).atZone(ZoneId.systemDefault()).toOffsetDateTime(),
          value: session ? session.totalWeightLifted : undefined,
        } satisfies TimeTrackedStatistic<Weight | undefined>;
      })
      .orderBy((x) => x.dateTime.toString())
      .toArray();
    const statsWithValue = statistics.filter((x) => x.value !== undefined);
    const min = statsWithValue.length ? Weight.min(...statsWithValue.map((x) => x.value!)) : Weight.NIL;
    const max = statsWithValue.length ? Weight.max(...statsWithValue.map((x) => x.value!)) : Weight.NIL;
    sessionStats.push({
      title: name,
      statistics,
      minValue: min,
      maxValue: max,
    });
  }

  // --- Exercise stats grouped by normalized exercise name ---
  interface ExerciseStatAcc {
    exerciseName: string;
    primary: StatAxis;
    maxWeightStatistics: TimeTrackedStatistic<Weight>[];
    maxRepsStatistics: TimeTrackedStatistic<number>[];
    max1RMStatistics: TimeTrackedStatistic<Weight>[];
    totalVolumeStatistics: TimeTrackedStatistic<Weight>[];
    repsStatistics: RepsBreakdownStatistics;
    latestTime: OffsetDateTime;
  }
  const exerciseStatsMap = new Map<MovementKey, ExerciseStatAcc>();

  for (const session of sessionsWithExercises) {
    for (const ex of session.recordedExercises) {
      const blueprint = ex.blueprint;
      const key = blueprint.movementKey();
      if (!ex.isStarted) continue;
      if (!exerciseStatsMap.has(key)) {
        exerciseStatsMap.set(key, {
          exerciseName: blueprint.name,
          primary: primaryAxisFor(blueprint),
          maxWeightStatistics: [],
          maxRepsStatistics: [],
          max1RMStatistics: [],
          repsStatistics: { breakdown: {} },
          totalVolumeStatistics: [],
          latestTime: OffsetDateTime.MIN,
        });
      }
      if (!(ex instanceof RecordedWeightedExercise)) {
        continue;
      }
      const exerciseStats = exerciseStatsMap.get(key)!;
      // Max weight lifted for this exercise in this session
      const maxWeight = ex.potentialSets
        .filter((ps) => ps.set)
        .map((ps) => ex.effectiveWeight(ps, session.bodyweight))
        .reduce((a, b) => (a === null ? b : a.isGreaterThan(b) ? a : b), null as null | Weight);
      if (!maxWeight) {
        continue;
      }

      // Max 1RM for this exercise in this session
      const max1RM = ex.potentialSets
        .filter((ps) => ps.set)
        .filter((ps) => ps.set!.repsCompleted)
        .map((ps) => calculateOneRepMax(ps, ex.effectiveWeight(ps, session.bodyweight)))
        .reduce((a, b) => (a === null ? b : a.isGreaterThan(b) ? a : b), null as null | Weight);
      if (!max1RM) {
        continue;
      }

      for (const set of ex.potentialSets) {
        if (!set.set) {
          continue;
        }
        exerciseStats.repsStatistics.breakdown[set.set.repsCompleted] ??= {
          numberOfSets: 0,
        };
        exerciseStats.repsStatistics.breakdown[set.set.repsCompleted]!.numberOfSets += 1;
      }

      // We'll use the last set for this
      const lastSet = ex.lastRecordedSet!;
      if (exerciseStats.latestTime.isBefore(lastSet.set!.completionDateTime)) {
        exerciseStats.latestTime = lastSet.set!.completionDateTime;
        // How the exercise is programmed now, not how it was the first time it was logged.
        exerciseStats.primary = primaryAxisFor(blueprint);
      }
      exerciseStats.maxWeightStatistics.push({
        dateTime: lastSet.set!.completionDateTime,
        value: maxWeight,
      });
      exerciseStats.maxRepsStatistics.push({
        dateTime: lastSet.set!.completionDateTime,
        value: ex.potentialSets.reduce((most, ps) => Math.max(most, ps.set?.repsCompleted ?? 0), 0),
      });
      exerciseStats.max1RMStatistics.push({
        dateTime: lastSet.set!.completionDateTime,
        value: max1RM,
      });
      exerciseStats.totalVolumeStatistics.push({
        dateTime: lastSet.set!.completionDateTime,
        value: ex.potentialSets
          .filter((x) => x.set)
          .reduce(
            (accum, set) =>
              ex.effectiveWeight(set, session.bodyweight).multipliedBy(set.set!.repsCompleted).plus(accum),
            Weight.NIL,
          ),
      });
    }
  }

  const exerciseStats: WeightedExerciseStatistics[] = Array.from(exerciseStatsMap.values()).map((ex) => {
    const maxLiftedPerSessionStatistics = toStatisticOverTime(ex.maxWeightStatistics, loadOps);
    const max1RMPerSessionStatistics = toStatisticOverTime(ex.max1RMStatistics, loadOps);
    return {
      exerciseName: ex.exerciseName,
      setsPerWeek:
        Object.values(ex.repsStatistics.breakdown).reduce((accum, entry) => accum + entry.numberOfSets, 0) / totalWeeks,
      primary: ex.primary,
      series: {
        load: maxLiftedPerSessionStatistics,
        reps: toStatisticOverTime(ex.maxRepsStatistics, repsOps),
      },
      maxLiftedPerSessionStatistics,
      max1RMPerSessionStatistics,
      totalVolumeStatistics: toStatisticOverTime(ex.totalVolumeStatistics, loadOps),
      repsStatistics: ex.repsStatistics,
    } satisfies WeightedExerciseStatistics;
  });

  // --- Average session length ---
  const sessionDurations: Duration[] = [];
  for (const session of sessionsWithExercises) {
    if (session.duration) {
      sessionDurations.push(session.duration);
    }
  }
  let averageSessionLength = Duration.ZERO;
  if (sessionDurations.length > 0) {
    averageSessionLength = sessionDurations
      .reduce((a, b) => a.plus(b), Duration.ZERO)
      .dividedBy(sessionDurations.length);
  }

  // --- Heaviest lift ---
  let heaviestLift: HeaviestLift | undefined = undefined;
  for (const session of sessionsWithExercises) {
    for (const ex of session.recordedExercises) {
      if (ex instanceof RecordedCardioExercise) {
        continue;
      }
      const maxWeight = ex.potentialSets
        .filter((ps) => ps.set)
        .map((ps) => ex.effectiveWeight(ps, session.bodyweight))
        .reduce((a, b) => (a.isGreaterThan(b) ? a : b), Weight.NIL);
      if (!heaviestLift || maxWeight.isGreaterThan(heaviestLift.weight)) {
        heaviestLift = {
          exerciseName: ex.blueprint.name,
          weight: maxWeight,
        };
      }
    }
  }

  return {
    workoutsPerWeek,
    setsPerWeek,
    maxWeightLiftedInAWorkout: Weight.max(
      ...Enumerable.from(sessionStats)
        .defaultIfEmpty({
          maxValue: Weight.NIL,
          minValue: Weight.NIL,
          title: '',
          statistics: [],
        })
        .select((x) => x.maxValue)
        .toArray(),
    ).convertTo(preferredUnit),
    averageSessionLength,
    heaviestLift,
    weightedExerciseStats: exerciseStats,
    sessionStats,
    bodyweightStats,
  };
}

/**
 * Sort a series by time and roll up its extremes and total. Parametric over the axis's arithmetic,
 * so a rep count aggregates by the same code as a load without ever being treated as a mass.
 */
function toStatisticOverTime<T>(unsortedStats: TimeTrackedStatistic<T>[], ops: QuantityOps<T>): StatisticOverTime<T> {
  const statistics = Enumerable.from(unsortedStats)
    .orderBy((x) => x.dateTime.toString())
    .toArray();
  let max = ops.zero;
  let min = ops.zero;
  let total = ops.zero;

  for (const stat of statistics) {
    if (ops.isGreaterThan(stat.value, max) || ops.equals(max, ops.zero)) max = stat.value;
    if (ops.isGreaterThan(min, stat.value) || ops.equals(min, ops.zero)) min = stat.value;
    total = ops.plus(total, stat.value);
  }
  return {
    statistics,
    currentValue: statistics.at(-1)?.value ?? ops.zero,
    totalValue: total,
    maxValue: max,
    minValue: min,
  };
}

/**
 * Which axis an exercise's progress is read on. Externally loaded, weight style exercises (squats)
 * return 'load'
 */
function primaryAxisFor(blueprint: ExerciseBlueprint): StatAxis {
  return blueprint.type === 'WeightedExerciseBlueprint' && blueprint.loadBasis === 'none' ? 'reps' : 'load';
}
