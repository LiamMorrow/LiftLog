import { describe, expect, it } from 'vitest';
import { levelFor, sessionVolume, volumeScaleOf } from '@/store/activity/volume';
import { SessionBlueprint } from '@/models/blueprint-models';
import { PotentialSet, RecordedSet, RecordedWeightedExercise, Session } from '@/models/session-models';
import { makeWeightedBlueprint } from '@/models/session-models/__test__/helpers';
import { Weight } from '@/models/weight';
import { LocalDate, OffsetDateTime } from '@js-joda/core';

function sessionWith(usesBodyweight: boolean, addedKg: number, reps: number, bodyweight: Weight | undefined): Session {
  const blueprint = makeWeightedBlueprint('Pull Up', false, usesBodyweight);
  const time = OffsetDateTime.parse('2025-01-01T10:00:00Z');
  const sets = [new PotentialSet(new RecordedSet(reps, time), new Weight(addedKg, 'kilograms'))];
  const exercise = new RecordedWeightedExercise(blueprint, sets, undefined);
  return new Session(
    'id',
    new SessionBlueprint('Test', [blueprint], ''),
    [exercise],
    LocalDate.of(2025, 1, 1),
    bodyweight,
    undefined,
  );
}

describe('sessionVolume with bodyweight exercises', () => {
  const bodyweight = new Weight(80, 'kilograms');

  it('folds the session bodyweight into the moved load', () => {
    expect(sessionVolume(sessionWith(true, 10, 10, bodyweight))).toBe(900);
  });

  it('counts only the added weight when no bodyweight is recorded', () => {
    expect(sessionVolume(sessionWith(true, 10, 10, undefined))).toBe(100);
  });

  it('subtracts assistance (negative added weight) from the bodyweight', () => {
    expect(sessionVolume(sessionWith(true, -20, 10, bodyweight))).toBe(600);
  });

  it('ignores the session bodyweight for a plain weighted exercise', () => {
    expect(sessionVolume(sessionWith(false, 10, 10, bodyweight))).toBe(100);
  });
});

describe('volumeScaleOf', () => {
  it('uses the 10th and 90th percentile, so one huge day does not wash out the rest', () => {
    const volumes = [100, 100, 100, 100, 100, 100, 100, 100, 100, 100_000];

    const scale = volumeScaleOf(volumes);

    expect(scale.hi).toBeLessThan(100_000);
  });

  it('is degenerate for a single session', () => {
    const scale = volumeScaleOf([5000]);

    expect(scale.lo).toBe(5000);
    expect(scale.hi).toBe(5000);
  });

  it('is degenerate when every session is identical', () => {
    const scale = volumeScaleOf([5000, 5000, 5000]);

    expect(scale.hi).toBe(scale.lo);
  });

  it('handles an empty history', () => {
    expect(volumeScaleOf([])).toEqual({ lo: 0, hi: 0 });
  });
});

describe('levelFor', () => {
  const scale = { lo: 1000, hi: 5000 };

  it('grades a zero-volume (cardio-only) session as 1, never 0', () => {
    // 0 is reserved for "no session at all" — grading a cardio day 0 would tell the user they didn't train.
    expect(levelFor(0, scale)).toBe(1);
  });

  it('grades the bottom of the range as 1 and the top as the maximum', () => {
    expect(levelFor(1000, scale)).toBe(1);
    expect(levelFor(5000, scale)).toBe(4);
  });

  it('clamps volume above the 90th percentile rather than overflowing', () => {
    expect(levelFor(500_000, scale)).toBe(4);
  });

  it('grades the middle of the range in between', () => {
    const level = levelFor(3000, scale);

    expect(level).toBeGreaterThan(1);
    expect(level).toBeLessThan(4);
  });

  it('falls back to the middle level when there is no spread to grade against', () => {
    expect(levelFor(5000, { lo: 5000, hi: 5000 })).toBe(3);
    expect(levelFor(0, { lo: 0, hi: 0 })).toBe(3);
  });
});
