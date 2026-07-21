import { describe, expect, it } from 'vitest';
import { LocalDate, OffsetDateTime } from '@js-joda/core';
import BigNumber from 'bignumber.js';
import { findPersonalRecords } from '@/store/stats/personal-records';
import { PotentialSet, RecordedSet, RecordedWeightedExercise, Session } from '@/models/session-models';
import {
  IncreaseLowestSetProgressiveOverload,
  Rest,
  SessionBlueprint,
  WeightedExerciseBlueprint,
} from '@/models/blueprint-models';
import { Weight } from '@/models/weight';

function exercise(name: string, weight: Weight, reps: number) {
  const blueprint = new WeightedExerciseBlueprint(
    name,
    3,
    { type: 'fixed', reps: 5 },
    new IncreaseLowestSetProgressiveOverload(new BigNumber(2.5), 'middle'),
    Rest.long,
    false,
    '',
    '',
  );
  const set = new RecordedSet(reps, OffsetDateTime.parse('2026-01-01T10:00:00Z'));
  return new RecordedWeightedExercise(blueprint, [new PotentialSet(set, weight)], undefined);
}

function session(id: string, date: LocalDate, exercises: RecordedWeightedExercise[]) {
  return new Session(id, new SessionBlueprint('Day', [], ''), exercises, date, undefined, undefined);
}

const kg = (n: number) => new Weight(n, 'kilograms');
const day = (n: number) => LocalDate.of(2026, 7, n);

describe('findPersonalRecords', () => {
  it('does not award a record on the first sighting of an exercise', () => {
    // Otherwise a user with a single event in your feed gets a badge on everything they do.
    const records = findPersonalRecords([session('s1', day(1), [exercise('Squat', kg(100), 5)])]);

    expect(records.size).toBe(0);
  });

  it('awards a record when a later session beats an earlier one', () => {
    const records = findPersonalRecords([
      session('s1', day(1), [exercise('Squat', kg(100), 5)]),
      session('s2', day(8), [exercise('Squat', kg(110), 5)]),
    ]);

    expect(records.get('s2')?.[0]?.exerciseName).toBe('Squat');
    expect(records.has('s1')).toBe(false);
  });

  it('does not award a record for matching or regressing', () => {
    const records = findPersonalRecords([
      session('s1', day(1), [exercise('Squat', kg(100), 5)]),
      session('s2', day(8), [exercise('Squat', kg(100), 5)]),
      session('s3', day(15), [exercise('Squat', kg(90), 5)]),
    ]);

    expect(records.size).toBe(0);
  });

  it('compares estimated 1RM, so more reps at a lighter weight can be a record', () => {
    // Epley: 100kg x 5 = 116.7; 95kg x 10 = 126.7.
    const records = findPersonalRecords([
      session('s1', day(1), [exercise('Squat', kg(100), 5)]),
      session('s2', day(8), [exercise('Squat', kg(95), 10)]),
    ]);

    expect(records.has('s2')).toBe(true);
  });

  it('tracks each exercise separately', () => {
    const records = findPersonalRecords([
      session('s1', day(1), [exercise('Squat', kg(100), 5), exercise('Bench', kg(60), 5)]),
      session('s2', day(8), [exercise('Squat', kg(110), 5), exercise('Bench', kg(50), 5)]),
    ]);

    const names = records.get('s2')?.map((x) => x.exerciseName);
    expect(names).toEqual(['Squat']);
  });

  it('handles weights in different units', () => {
    const records = findPersonalRecords([
      session('s1', day(1), [exercise('Squat', kg(100), 5)]),
      session('s2', day(8), [exercise('Squat', new Weight(250, 'pounds'), 5)]),
    ]);

    expect(records.has('s2')).toBe(true);
  });

  it('folds bodyweight into the estimated 1RM for a bodyweight exercise', () => {
    // Same +10kg added both sessions, but a heavier bodyweight makes the effective 1RM a record.
    const blueprint = new WeightedExerciseBlueprint(
      'Pull Up',
      3,
      { type: 'fixed', reps: 5 },
      new IncreaseLowestSetProgressiveOverload(new BigNumber(2.5), 'middle'),
      Rest.long,
      false,
      '',
      '',
      true,
    );
    const build = (id: string, date: LocalDate, bodyweightKg: number) => {
      const set = new RecordedSet(5, OffsetDateTime.parse('2026-01-01T10:00:00Z'));
      const ex = new RecordedWeightedExercise(blueprint, [new PotentialSet(set, kg(10))], undefined);
      return new Session(id, new SessionBlueprint('Day', [], ''), [ex], date, new Weight(bodyweightKg, 'kilograms'), undefined);
    };

    const records = findPersonalRecords([build('s1', day(1), 80), build('s2', day(8), 85)]);

    expect(records.has('s2')).toBe(true);
  });

  it('ignores sessions with no completed sets', () => {
    const records = findPersonalRecords([
      session('s1', day(1), [exercise('Squat', kg(100), 5)]),
      session('s2', day(8), []),
      session('s3', day(15), [exercise('Squat', kg(120), 5)]),
    ]);

    expect(records.has('s2')).toBe(false);
    expect(records.has('s3')).toBe(true);
  });
});
