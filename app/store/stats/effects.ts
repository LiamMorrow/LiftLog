import { NormalizedName } from '@/models/blueprint-models';
import {
  WeightedExerciseStatistics,
  GranularStatisticView,
  HeaviestLift,
  OptionalStatisticOverTime,
  WeightedStatisticOverTime,
  TimeTrackedStatistic,
  setOverallViewTime,
  setStatsIsDirty,
  RepsBreakdownStatistics,
} from './index';
import { Duration, OffsetDateTime, ZoneId } from '@js-joda/core';
import { fetchOverallStats, setOverallStats } from './index';
import { addEffect } from '@/store/store';
import { selectSessionsBy } from '@/store/stored-sessions';
import {
  RecordedCardioExercise,
  RecordedWeightedExercise,
  Session,
} from '@/models/session-models';
import Enumerable from 'linq';
import { Weight } from '@/models/weight';
import { sleep } from '@/utils/sleep';
import { RemoteData } from '@/models/remote';
import BigNumber from 'bignumber.js';

function computeStats(sessions: Session[]): GranularStatisticView {
  if (!sessions.length)
    return {
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
  const sessionsWithExercises = sessions.filter(
    (s) => s.recordedExercises.length > 0,
  );
  const daysBetween = Enumerable.from(sessionsWithExercises)
    .select((c) => c.date)
    .distinct((x) => x.toString())
    .toArray();

  const bodyWeightStatistics = Enumerable.from(sessions)
    .where((s) => !!s.bodyweight)
    .select((session) => ({
      dateTime: session.date
        .atTime(12, 0)
        .atZone(ZoneId.systemDefault())
        .toOffsetDateTime(), // Use noon for LocalDate
      value: session.bodyweight!,
    }))
    .toArray();
  // --- Bodyweight stats over time ---
  const bodyweightStats: WeightedStatisticOverTime =
    unsortedStatsToWeightedStatisticOverTime(bodyWeightStatistics);

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
          dateTime: date
            .atTime(12, 0)
            .atZone(ZoneId.systemDefault())
            .toOffsetDateTime(),
          value: session ? session.totalWeightLifted : undefined,
        } satisfies TimeTrackedStatistic<Weight | undefined>;
      })
      .orderBy((x) => x.dateTime.toString())
      .toArray();
    const statsWithValue = statistics.filter((x) => x.value !== undefined);
    const min = statsWithValue.length
      ? Weight.min(...statsWithValue.map((x) => x.value!))
      : Weight.NIL;
    const max = statsWithValue.length
      ? Weight.max(...statsWithValue.map((x) => x.value!))
      : Weight.NIL;
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
    statistics: TimeTrackedStatistic<Weight>[];
    totalVolumeStatistics: TimeTrackedStatistic<Weight>[];
    repsStatistics: RepsBreakdownStatistics;
    currentOneRepMax: Weight;
    latestTime: OffsetDateTime;
  }
  const exerciseStatsMap = new Map<string, ExerciseStatAcc>();

  for (const session of sessionsWithExercises) {
    for (const ex of session.recordedExercises) {
      const blueprint = ex.blueprint;
      const key = NormalizedName.fromExerciseBlueprint(blueprint).toString();
      if (!ex.isStarted) continue;
      if (!exerciseStatsMap.has(key)) {
        exerciseStatsMap.set(key, {
          exerciseName: blueprint.name,
          statistics: [],
          repsStatistics: { breakdown: {} },
          totalVolumeStatistics: [],
          currentOneRepMax: Weight.NIL,
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
        .map((ps) => ps.weight)
        .reduce(
          (a, b) => (a === null ? b : a.isGreaterThan(b) ? a : b),
          null as null | Weight,
        );
      if (!maxWeight) {
        continue;
      }

      for (const set of ex.potentialSets) {
        if (!set.set) {
          continue;
        }
        exerciseStats.repsStatistics.breakdown[set.set.repsCompleted] ??= {
          numberOfSets: 0,
        };
        exerciseStats.repsStatistics.breakdown[
          set.set.repsCompleted
        ].numberOfSets += 1;
      }

      // We'll use the last set for this
      const lastSet = ex.lastRecordedSet!;
      if (exerciseStats.latestTime.isBefore(lastSet.set!.completionDateTime)) {
        exerciseStats.latestTime = lastSet.set!.completionDateTime;
        // One rep max formula (Epley): 1RM = weight * (1 + reps/30)
        const reps = lastSet.set!.repsCompleted;
        const weight = lastSet.weight;
        const oneRepMax = weight.multipliedBy(
          new BigNumber(1).plus(new BigNumber(reps).div(30)),
        );
        exerciseStats.currentOneRepMax = oneRepMax;
      }
      exerciseStats.statistics.push({
        dateTime: lastSet.set!.completionDateTime,
        value: maxWeight,
      });
      exerciseStats.totalVolumeStatistics.push({
        dateTime: lastSet.set!.completionDateTime,
        value: ex.potentialSets
          .filter((x) => x.set)
          .reduce(
            (accum, set) =>
              set.weight.multipliedBy(set.set!.repsCompleted).plus(accum),
            Weight.NIL,
          ),
      });
    }
  }

  const exerciseStats: WeightedExerciseStatistics[] = Array.from(
    exerciseStatsMap.values(),
  ).map((ex) => {
    const maxLiftedPerSessionStatistics =
      unsortedStatsToWeightedStatisticOverTime(ex.statistics);
    return {
      exerciseName: ex.exerciseName,
      maxLiftedPerSessionStatistics,
      oneRepMax: ex.currentOneRepMax,
      totalVolumeStatistics: unsortedStatsToWeightedStatisticOverTime(
        ex.totalVolumeStatistics,
      ),
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

  // --- Exercise most time spent ---
  const exerciseTimeMap = new Map<
    string,
    { exerciseName: string; timeSpent: Duration }
  >();
  for (const session of sessionsWithExercises) {
    for (const ex of session.recordedExercises) {
      const key = ex.blueprint.name.trim().toLowerCase();
      const timeSpent = ex.duration;
      if (timeSpent) {
        if (!exerciseTimeMap.has(key)) {
          exerciseTimeMap.set(key, {
            exerciseName: ex.blueprint.name,
            timeSpent: Duration.ZERO,
          });
        }
        exerciseTimeMap.get(key)!.timeSpent = exerciseTimeMap
          .get(key)!
          .timeSpent.plus(timeSpent);
      }
    }
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
        .map((ps) => ps.weight)
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
    ),
    averageSessionLength,
    heaviestLift,
    weightedExerciseStats: exerciseStats,
    sessionStats,
    bodyweightStats,
  };
}

export function applyStatsEffects() {
  addEffect(fetchOverallStats, async (_, { getState, dispatch }) => {
    const state = getState();

    if (
      state.stats.overallView.isLoading() ||
      !state.stats.isDirty ||
      !state.storedSessions.isHydrated
    ) {
      return;
    }

    dispatch(setOverallStats(RemoteData.loading()));
    await sleep(200);
    try {
      const stats = computeStats(
        selectSessionsBy(
          state,
          state.stats.overallViewTime.from,
          state.stats.overallViewTime.to,
        ),
      );
      dispatch(setOverallStats(RemoteData.success(stats)));
      dispatch(setStatsIsDirty(false));
    } catch (e) {
      dispatch(setOverallStats(RemoteData.error(e)));
    }
  });

  addEffect(setOverallViewTime, async (_, { dispatch }) => {
    dispatch(setStatsIsDirty(true));
    dispatch(fetchOverallStats());
  });
}

function unsortedStatsToWeightedStatisticOverTime(
  unsortedStats: TimeTrackedStatistic<Weight>[],
): WeightedStatisticOverTime {
  const statistics = Enumerable.from(unsortedStats)
    .orderBy((x) => x.dateTime.toString())
    .toArray();
  let max = Weight.NIL;
  let min = Weight.NIL;
  let total = Weight.NIL;

  for (const stat of statistics) {
    if (stat.value.isGreaterThan(max) || max.equals(Weight.NIL))
      max = stat.value;
    if (min.isGreaterThan(stat.value) || min.equals(Weight.NIL))
      min = stat.value;
    total = total.plus(stat.value);
  }
  return {
    statistics,
    currentValue: statistics.at(-1)?.value ?? Weight.NIL,
    totalValue: total,
    maxValue: max,
    minValue: min,
  };
}
