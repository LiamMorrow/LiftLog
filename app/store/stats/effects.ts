import { NormalizedName } from '@/models/blueprint-models';
import {
  ExerciseStatistics,
  GranularStatisticView,
  HeaviestLift,
  OptionalStatisticOverTime,
  StatisticOverTime,
  TimeSpentExercise,
  TimeTrackedStatistic,
} from './index';
import { Duration, LocalDate, LocalDateTime } from '@js-joda/core';
import BigNumber from 'bignumber.js';
import { fetchOverallStats, setOverallStats, setStatsIsLoading } from './index';
import { addEffect } from '@/store/store';
import { selectSessionsBy } from '@/store/stored-sessions';
import {
  RecordedCardioExercise,
  RecordedWeightedExercise,
  Session,
} from '@/models/session-models';
import Enumerable from 'linq';

function computeStats(sessions: Session[]): GranularStatisticView | undefined {
  if (!sessions.length)
    return {
      averageSessionLength: Duration.ZERO,
      maxWeightLiftedInAWorkout: undefined,
      bodyweightStats: {
        statistics: [],
        title: 'Bodyweight',
        minValue: 0,
        maxValue: 0,
      },
      exerciseMostTimeSpent: undefined,
      exerciseStats: [],
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
    .where((s) => !!s.bodyweight && !s.bodyweight.isNaN())
    .select((session) => ({
      dateTime: session.date.atTime(12, 0), // Use noon for LocalDate
      value: session.bodyweight!.toNumber(),
    }))
    .orderBy((x) => x.dateTime.toString())
    .toArray();
  // --- Bodyweight stats over time ---
  const bodyweightStats: StatisticOverTime = {
    title: 'Bodyweight',
    statistics: bodyWeightStatistics,
    minValue: Math.min(...bodyWeightStatistics.map((x) => x.value)),
    maxValue: Math.max(...bodyWeightStatistics.map((x) => x.value)),
  };

  // --- Session stats grouped by blueprint name ---
  const sessionStats: OptionalStatisticOverTime[] = [];
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
          dateTime: date.atTime(12, 0),
          value: session ? session.totalWeightLifted.toNumber() : undefined,
        };
      })
      .orderBy((x) => x.dateTime.toString())
      .toArray();
    const statsWithValue = statistics.filter((x) => x.value !== undefined);
    const min = Math.min(...statsWithValue.map((x) => x.value!));
    const max = Math.max(...statsWithValue.map((x) => x.value!));
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
    statistics: TimeTrackedStatistic[];
    oneRepMaxStatistics: TimeTrackedStatistic[];
    allLifted: number[];
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
          oneRepMaxStatistics: [],
          allLifted: [],
        });
      }
      if (!(ex instanceof RecordedWeightedExercise)) {
        continue;
      }
      // Max weight lifted for this exercise in this session
      const maxWeight = ex.potentialSets
        .filter((ps) => ps.set)
        .map((ps) => ps.weight)
        .reduce(
          (a, b) => (a === null ? b : a.isGreaterThan(b) ? a : b),
          null as null | BigNumber,
        );
      if (!maxWeight) {
        continue;
      }
      // One rep max formula (Epley): 1RM = weight * (1 + reps/30)
      // We'll use the last set for this
      const lastSet = ex.lastRecordedSet!;
      const reps = lastSet.set!.repsCompleted;
      const weight = lastSet.weight;
      const oneRepMax = weight.multipliedBy(
        new BigNumber(1).plus(new BigNumber(reps).div(30)),
      );

      exerciseStatsMap.get(key)!.statistics.push({
        dateTime: lastSet.set!.completionDateTime,
        value: maxWeight.toNumber(),
      });
      exerciseStatsMap.get(key)!.oneRepMaxStatistics.push({
        dateTime: lastSet.set!.completionDateTime,
        value: oneRepMax.toNumber(),
      });
      exerciseStatsMap.get(key)!.allLifted.push(maxWeight.toNumber());
    }
  }

  const exerciseStats: ExerciseStatistics[] = Array.from(
    exerciseStatsMap.values(),
  ).map((ex) => {
    const statistics = Enumerable.from(ex.statistics)
      .orderBy((x) => x.dateTime.toString())
      .toArray();
    const oneRepMaxStatistics = Enumerable.from(ex.oneRepMaxStatistics)
      .orderBy((x) => x.dateTime.toString())
      .toArray();
    const max = statistics.length
      ? Math.max(
          ...statistics.map((s) => s.value).filter((x) => x !== undefined),
        )
      : 0;
    const min = statistics.length
      ? Math.min(
          ...statistics.map((s) => s.value).filter((x) => x !== undefined),
        )
      : 0;
    const oneRMmax = oneRepMaxStatistics.length
      ? Math.max(
          ...oneRepMaxStatistics
            .map((s) => s.value)
            .filter((x) => x !== undefined),
        )
      : 0;
    const oneRMMin = oneRepMaxStatistics.length
      ? Math.min(
          ...oneRepMaxStatistics
            .map((s) => s.value)
            .filter((x) => x !== undefined),
        )
      : 0;
    return {
      exerciseName: ex.exerciseName,
      statistics: {
        title: ex.exerciseName,
        statistics,
        maxValue: max,
        minValue: min,
      },
      oneRepMaxStatistics: {
        title: 'One rep max',
        statistics: oneRepMaxStatistics,
        maxValue: oneRMmax,
        minValue: oneRMMin,
      },
      totalLifted: ex.allLifted.reduce((a, b) => a + b, 0),
      max,
      current: statistics.length
        ? (statistics[statistics.length - 1].value ?? 0)
        : 0,
      oneRepMax: ex.oneRepMaxStatistics.length
        ? (ex.oneRepMaxStatistics[ex.oneRepMaxStatistics.length - 1].value ?? 0)
        : 0,
    };
  });

  // --- Average time between sets ---
  const allSetTimes: LocalDateTime[] = [];
  for (const session of sessionsWithExercises) {
    for (const ex of session.recordedExercises) {
      if (ex instanceof RecordedWeightedExercise) {
        for (const ps of ex.potentialSets) {
          if (ps.set) allSetTimes.push(ps.set.completionDateTime);
        }
      }
    }
  }
  allSetTimes.sort((a, b) => a.compareTo(b));
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
  let exerciseMostTimeSpent: TimeSpentExercise | undefined = undefined;
  for (const val of exerciseTimeMap.values()) {
    if (
      !exerciseMostTimeSpent ||
      val.timeSpent.compareTo(exerciseMostTimeSpent.timeSpent) > 0
    ) {
      exerciseMostTimeSpent = val;
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
        .reduce((a, b) => (a.isGreaterThan(b) ? a : b), new BigNumber(0));
      if (!heaviestLift || maxWeight.isGreaterThan(heaviestLift.weight)) {
        heaviestLift = {
          exerciseName: ex.blueprint.name,
          weight: maxWeight,
        };
      }
    }
  }

  return {
    maxWeightLiftedInAWorkout: Enumerable.from(sessionStats)
      .defaultIfEmpty({ maxValue: 0, minValue: 0, title: '', statistics: [] })
      .max((x) => x.maxValue),
    averageSessionLength,
    heaviestLift,
    exerciseMostTimeSpent,
    exerciseStats,
    sessionStats,
    bodyweightStats,
  };
}

export function applyStatsEffects() {
  addEffect(fetchOverallStats, async (action, { getState, dispatch }) => {
    const state = getState();

    if (
      state.stats.isLoading ||
      !state.stats.isDirty ||
      !state.storedSessions.isHydrated
    ) {
      return;
    }

    dispatch(setStatsIsLoading(true));

    try {
      const stats = computeStats(
        selectSessionsBy(
          state,
          LocalDate.now().minus(state.stats.overallViewTime),
          state.stats.overallViewSessionName,
        ),
      );
      dispatch(setOverallStats(stats));
    } finally {
      dispatch(setStatsIsLoading(false));
    }
  });
}
