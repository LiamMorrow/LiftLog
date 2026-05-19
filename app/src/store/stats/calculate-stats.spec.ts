import { describe, it, expect } from 'vitest';
import {
  Session,
  PotentialSet,
  RecordedWeightedExercise,
  RecordedSet,
} from '@/models/session-models';
import { Weight } from '@/models/weight';
import {
  SessionBlueprint,
  WeightedExerciseBlueprint,
} from '@/models/blueprint-models';
import {
  LocalDate,
  LocalTime,
  OffsetDateTime,
  ZoneOffset,
  Duration,
} from '@js-joda/core';
import { LocalDateRange } from '@/models/time-models';
import { calculateStats } from '@/store/stats/calculate-stats';
import BigNumber from 'bignumber.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeOffset(date: LocalDate, hour = 10, minute = 0): OffsetDateTime {
  return LocalTime.of(hour, minute).atDate(date).atOffset(ZoneOffset.UTC);
}

function makeBlueprint(
  name: string,
  sets = 3,
  reps = 8,
): WeightedExerciseBlueprint {
  return new WeightedExerciseBlueprint(
    name,
    sets,
    reps,
    BigNumber(0),
    {
      maxRest: Duration.ofSeconds(0),
      minRest: Duration.ofSeconds(90),
      failureRest: Duration.ofSeconds(180),
    },
    false,
    '',
    '',
  );
}

function makeSessionBlueprint(
  name: string,
  exercises: WeightedExerciseBlueprint[] = [],
): SessionBlueprint {
  return new SessionBlueprint(name, exercises, '');
}

/**
 * Build a RecordedWeightedExercise with `sets` completed sets, each at the
 * given weight/reps, timestamps spaced 1 minute apart starting from baseTime.
 */
function makeCompletedExercise(
  blueprint: WeightedExerciseBlueprint,
  weightKg: number,
  repsPerSet: number,
  baseTime: OffsetDateTime,
): RecordedWeightedExercise {
  const potentialSets = Array.from(
    { length: blueprint.sets },
    (_, i) =>
      new PotentialSet(
        new RecordedSet(repsPerSet, baseTime.plusSeconds(i * 60)),
        new Weight(weightKg, 'kilograms'),
      ),
  );
  return new RecordedWeightedExercise(blueprint, potentialSets, undefined);
}

/**
 * Build a Session with a single exercise completed on the given date.
 */
function makeSession(
  date: LocalDate,
  exerciseName: string,
  weightKg: number,
  reps = 8,
  sets = 3,
  bodyweightKg?: number,
): Session {
  const blueprint = makeBlueprint(exerciseName, sets, reps);
  const sessionBlueprint = makeSessionBlueprint('Test Session', [blueprint]);
  const baseTime = makeOffset(date);
  const exercise = makeCompletedExercise(blueprint, weightKg, reps, baseTime);
  return new Session(
    'test-id',
    sessionBlueprint,
    [exercise],
    date,
    bodyweightKg !== undefined
      ? new Weight(bodyweightKg, 'kilograms')
      : undefined,
    undefined,
  );
}

function makeRange(from: LocalDate, to: LocalDate): LocalDateRange {
  return { from, to };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('calculateStats', () => {
  describe('calculateStats — empty input', () => {
    it('returns zeroed result for empty session list', () => {
      const today = LocalDate.now();
      const result = calculateStats([], 'kilograms', makeRange(today, today));

      expect(result.workoutsPerWeek).toBe(0);
      expect(result.setsPerWeek).toBe(0);
      expect(result.heaviestLift).toBeUndefined();
      expect(result.maxWeightLiftedInAWorkout).toBeUndefined();
      expect(result.weightedExerciseStats).toHaveLength(0);
    });
  });

  describe('calculateStats — workoutsPerWeek / setsPerWeek', () => {
    it('calculates correct rates for a 14-day range with 2 sessions of 3 sets each', () => {
      const from = LocalDate.of(2024, 1, 1);
      const to = LocalDate.of(2024, 1, 14); // exactly 2 weeks
      const s1 = makeSession(LocalDate.of(2024, 1, 3), 'Squat', 100);
      const s2 = makeSession(LocalDate.of(2024, 1, 10), 'Squat', 105);

      const result = calculateStats([s1, s2], 'kilograms', makeRange(from, to));

      expect(result.workoutsPerWeek).toBeCloseTo(1, 5); // 2 sessions / 2 weeks
      expect(result.setsPerWeek).toBeCloseTo(3, 5); // 6 sets / 2 weeks
    });

    it('does not count sessions with no exercises toward workoutsPerWeek', () => {
      const from = LocalDate.of(2024, 1, 1);
      const to = LocalDate.of(2024, 1, 7);
      const emptySession = new Session(
        'empty',
        makeSessionBlueprint('Empty'),
        [],
        LocalDate.of(2024, 1, 3),
        undefined,
        undefined,
      );
      const realSession = makeSession(LocalDate.of(2024, 1, 5), 'Bench', 80);

      const result = calculateStats(
        [emptySession, realSession],
        'kilograms',
        makeRange(from, to),
      );

      expect(result.workoutsPerWeek).toBeCloseTo(1, 5);
    });
  });

  describe('calculateStats — heaviestLift', () => {
    it('returns the heaviest single set weight across all sessions', () => {
      const date = LocalDate.of(2024, 3, 1);
      const s1 = makeSession(date, 'Deadlift', 150);
      const s2 = makeSession(date.plusDays(7), 'Deadlift', 180);
      const s3 = makeSession(date.plusDays(14), 'Squat', 160);

      const result = calculateStats(
        [s1, s2, s3],
        'kilograms',
        makeRange(date, date.plusDays(14)),
      );

      expect(result.heaviestLift?.exerciseName).toBe('Deadlift');
      expect(result.heaviestLift?.weight.value.toNumber()).toBe(180);
    });

    it('returns undefined when no sessions are present', () => {
      const today = LocalDate.now();
      const result = calculateStats([], 'kilograms', makeRange(today, today));
      expect(result.heaviestLift).toBeUndefined();
    });
  });

  describe('calculateStats — exercise stats', () => {
    it('tracks max weight and 1RM per exercise', () => {
      const date = LocalDate.of(2024, 4, 1);
      // 3 sets @ 100kg x 5 reps
      const session = makeSession(date, 'Bench Press', 100, 5, 3);
      const range = makeRange(date.minusDays(7), date);

      const result = calculateStats([session], 'kilograms', range);

      const bench = result.weightedExerciseStats.find(
        (s) => s.exerciseName === 'Bench Press',
      );
      expect(bench).toBeDefined();
      expect(
        bench!.maxLiftedPerSessionStatistics.maxValue.value.toNumber(),
      ).toBe(100);

      // Epley 1RM = weight * (1 + reps/30) = 100 * (1 + 5/30) ≈ 116.67
      const expected1RM = 100 * (1 + 5 / 30);
      expect(
        bench!.max1RMPerSessionStatistics.maxValue.value.toNumber(),
      ).toBeCloseTo(expected1RM, 2);
    });

    it('accumulates reps breakdown correctly', () => {
      const date = LocalDate.of(2024, 4, 1);
      const blueprint = makeBlueprint('OHP', 3, 8);
      const sessionBlueprint = makeSessionBlueprint('Push', [blueprint]);
      const baseTime = makeOffset(date);

      // 2 sets @ 8 reps, 1 set @ 6 reps
      const potentialSets = [
        new PotentialSet(
          new RecordedSet(8, baseTime),
          new Weight(60, 'kilograms'),
        ),
        new PotentialSet(
          new RecordedSet(8, baseTime.plusSeconds(60)),
          new Weight(60, 'kilograms'),
        ),
        new PotentialSet(
          new RecordedSet(6, baseTime.plusSeconds(120)),
          new Weight(60, 'kilograms'),
        ),
      ];
      const exercise = new RecordedWeightedExercise(
        blueprint,
        potentialSets,
        undefined,
      );
      const session = new Session(
        'id',
        sessionBlueprint,
        [exercise],
        date,
        undefined,
        undefined,
      );

      const result = calculateStats(
        [session],
        'kilograms',
        makeRange(date.minusDays(7), date),
      );
      const ohp = result.weightedExerciseStats.find(
        (s) => s.exerciseName === 'OHP',
      );

      expect(ohp!.repsStatistics.breakdown[8]?.numberOfSets).toBe(2);
      expect(ohp!.repsStatistics.breakdown[6]?.numberOfSets).toBe(1);
    });

    it('groups same exercise names under one stat entry', () => {
      const date = LocalDate.of(2024, 5, 1);
      const s1 = makeSession(date, 'Bench Press', 80, 8, 3);
      const s2 = makeSession(date.plusDays(7), 'Bench Press', 85, 8, 3);
      const range = makeRange(date, date.plusDays(7));

      const result = calculateStats([s1, s2], 'kilograms', range);

      expect(result.weightedExerciseStats).toHaveLength(1);
      expect(
        result.weightedExerciseStats[0].maxLiftedPerSessionStatistics
          .statistics,
      ).toHaveLength(2);
    });

    it('computes setsPerWeek across multiple sessions', () => {
      const from = LocalDate.of(2024, 1, 1);
      const to = LocalDate.of(2024, 1, 14); // 2 weeks
      // 3 sets each × 2 sessions = 6 total → 3 sets/week
      const s1 = makeSession(LocalDate.of(2024, 1, 3), 'Squat', 100, 8, 3);
      const s2 = makeSession(LocalDate.of(2024, 1, 10), 'Squat', 100, 8, 3);

      const result = calculateStats([s1, s2], 'kilograms', makeRange(from, to));
      const squat = result.weightedExerciseStats[0];

      expect(squat.setsPerWeek).toBeCloseTo(3, 5);
    });

    it('tracks maxValue correctly across sessions with different weights', () => {
      const date = LocalDate.of(2024, 5, 1);
      const s1 = makeSession(date, 'Squat', 100, 5, 3);
      const s2 = makeSession(date.plusDays(7), 'Squat', 120, 5, 3);
      const s3 = makeSession(date.plusDays(14), 'Squat', 110, 5, 3);

      const result = calculateStats(
        [s1, s2, s3],
        'kilograms',
        makeRange(date, date.plusDays(14)),
      );
      const squat = result.weightedExerciseStats[0];

      expect(
        squat.maxLiftedPerSessionStatistics.maxValue.value.toNumber(),
      ).toBe(120);
      expect(
        squat.maxLiftedPerSessionStatistics.currentValue.value.toNumber(),
      ).toBe(110);
    });

    it('computes totalVolumeStatistics correctly', () => {
      const date = LocalDate.of(2024, 5, 1);
      // 3 sets @ 100kg x 5 reps → total volume = 1500kg per session
      const session = makeSession(date, 'Deadlift', 100, 5, 3);

      const result = calculateStats(
        [session],
        'kilograms',
        makeRange(date, date),
      );
      const dl = result.weightedExerciseStats[0];

      expect(
        dl.totalVolumeStatistics.statistics[0].value.value.toNumber(),
      ).toBe(1500);
    });
  });

  describe('calculateStats — bodyweight stats', () => {
    it('tracks bodyweight over time', () => {
      const d1 = LocalDate.of(2024, 2, 1);
      const d2 = LocalDate.of(2024, 2, 8);
      const s1 = makeSession(d1, 'Squat', 100, 8, 3, 80);
      const s2 = makeSession(d2, 'Squat', 100, 8, 3, 82);

      const result = calculateStats([s1, s2], 'kilograms', makeRange(d1, d2));

      expect(result.bodyweightStats.statistics).toHaveLength(2);
      expect(result.bodyweightStats.minValue.value.toNumber()).toBe(80);
      expect(result.bodyweightStats.maxValue.value.toNumber()).toBe(82);
      expect(result.bodyweightStats.currentValue.value.toNumber()).toBe(82);
    });

    it('ignores sessions with no bodyweight recorded', () => {
      const date = LocalDate.of(2024, 2, 1);
      const session = makeSession(date, 'Squat', 100); // no bodyweight

      const result = calculateStats(
        [session],
        'kilograms',
        makeRange(date, date),
      );

      expect(result.bodyweightStats.statistics).toHaveLength(0);
    });
  });

  describe('calculateStats — unit conversion', () => {
    it('converts maxWeightLiftedInAWorkout to the preferred unit', () => {
      const date = LocalDate.of(2024, 6, 1);
      const session = makeSession(date, 'Deadlift', 100); // 100kg

      const result = calculateStats([session], 'pounds', makeRange(date, date));

      // 2400kg * 2.20462 ≈ 5291.088 lbs
      expect(result.maxWeightLiftedInAWorkout?.value.toNumber()).toBeCloseTo(
        5291.088,
        1,
      );
      expect(result.maxWeightLiftedInAWorkout?.unit).toBe('pounds');
    });
  });

  describe('calculateStats — averageSessionLength', () => {
    it('returns zero duration when no sessions have computable durations', () => {
      // Sessions only have a duration if at least one exercise has timestamps.
      // An exercise with no completed sets has no timestamps → session.duration is undefined.
      const date = LocalDate.of(2024, 7, 1);
      const blueprint = makeBlueprint('Press', 2, 5);
      const sessionBlueprint = makeSessionBlueprint('S', [blueprint]);
      const noSets = [
        new PotentialSet(undefined, new Weight(60, 'kilograms')),
        new PotentialSet(undefined, new Weight(60, 'kilograms')),
      ];
      const exercise = new RecordedWeightedExercise(
        blueprint,
        noSets,
        undefined,
      );
      const session = new Session(
        'id',
        sessionBlueprint,
        [exercise],
        date,
        undefined,
        undefined,
      );

      const result = calculateStats(
        [session],
        'kilograms',
        makeRange(date, date),
      );

      expect(result.averageSessionLength.isZero()).toBe(true);
    });

    it('computes average across sessions that have durations', () => {
      const date = LocalDate.of(2024, 7, 1);
      const blueprint = makeBlueprint('Squat', 2, 5);
      const sessionBlueprint = makeSessionBlueprint('S', [blueprint]);

      function makeTimedSession(
        id: string,
        d: LocalDate,
        startMinute: number,
        endMinute: number,
      ) {
        const start = makeOffset(d, 10, startMinute);
        const end = makeOffset(d, 10, endMinute);
        const sets = [
          new PotentialSet(
            new RecordedSet(5, start),
            new Weight(100, 'kilograms'),
          ),
          new PotentialSet(
            new RecordedSet(5, end),
            new Weight(100, 'kilograms'),
          ),
        ];
        const ex = new RecordedWeightedExercise(blueprint, sets, undefined);
        return new Session(id, sessionBlueprint, [ex], d, undefined, undefined);
      }

      // Session 1: 30 min, Session 2: 60 min → average 45 min
      const s1 = makeTimedSession('s1', date, 0, 30);
      const s2 = makeTimedSession('s2', date.plusDays(7), 0, 59);

      const result = calculateStats(
        [s1, s2],
        'kilograms',
        makeRange(date, date.plusDays(7)),
      );

      expect(result.averageSessionLength.toMinutes()).toBe(44);
    });
  });
});
