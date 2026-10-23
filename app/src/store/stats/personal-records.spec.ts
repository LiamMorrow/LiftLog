import { describe, expect, it } from 'vitest';
import { LocalDate, OffsetDateTime } from '@js-joda/core';
import { Resistance, SessionBlueprint } from '@/models/blueprint-models';
import { RecordedWeightedExercise, Session } from '@/models/session-models';
import { Weight } from '@/models/weight';
import { makeRecordedExercise, makeWeightedBlueprint } from '@/models/session-models/__test__/helpers';
import { findPersonalRecords, PersonalRecord } from '@/store/stats/personal-records';

const kg = (n: number) => new Weight(n, 'kilograms');
const time = OffsetDateTime.parse('2026-01-01T10:00:00Z');

function lift(name: string, reps: number[], weight: Weight, resistance: Resistance = 'external') {
  const blueprint = makeWeightedBlueprint({ name, resistance, sets: reps.length });
  return makeRecordedExercise(blueprint, reps, weight, () => time);
}

const squat = (weightKg: number, reps: number[]) => lift('Squat', reps, kg(weightKg));
const pullUps = (reps: number[], addedKg = 0) => lift('Pull up', reps, kg(addedKg), 'bodyweight');
const crunches = (reps: number[]) => lift('Crunch', reps, kg(0), 'none');

function sessions(...workouts: { exercises: RecordedWeightedExercise[]; bodyweightKg?: number }[]) {
  return workouts.map(
    ({ exercises, bodyweightKg }, index) =>
      new Session(
        `s${index}`,
        new SessionBlueprint('Day', [], ''),
        exercises,
        LocalDate.of(2026, 7, index + 1),
        bodyweightKg === undefined ? undefined : kg(bodyweightKg),
        undefined,
      ),
  );
}

const only = (...exercises: RecordedWeightedExercise[]) => ({ exercises });

function kindsBySession(records: Map<string, PersonalRecord[]>, count: number) {
  return Array.from({ length: count }, (_, index) => records.get(`s${index}`)?.map((x) => x.kind) ?? []);
}

describe('findPersonalRecords', () => {
  it('awards nothing on the first sighting of an exercise', () => {
    // Otherwise a user with a single event in your feed gets a badge on everything they do.
    const records = findPersonalRecords(sessions(only(squat(100, [5, 5, 5]))));

    expect(records.size).toBe(0);
  });

  it('awards heaviest lift and est. 1RM when the weight goes up, but no reps record for a new weight', () => {
    const records = findPersonalRecords(sessions(only(squat(100, [5, 5, 5])), only(squat(110, [5, 5, 5]))));

    expect(kindsBySession(records, 2)).toEqual([[], ['heaviest', 'oneRepMax']]);
  });

  it('carries the value and the previous best', () => {
    const records = findPersonalRecords(sessions(only(squat(100, [5])), only(squat(110, [5]))));

    const heaviest = records.get('s1')?.find((x) => x.kind === 'heaviest');
    expect(heaviest?.value).toEqual(kg(110));
    expect(heaviest?.previous).toEqual(kg(100));
  });

  it('awards nothing for matching or regressing', () => {
    const records = findPersonalRecords(
      sessions(only(squat(100, [5, 5, 5])), only(squat(100, [5, 5, 5])), only(squat(90, [5, 5, 5]))),
    );

    expect(records.size).toBe(0);
  });

  it('compares estimated 1RM, so more reps at a lighter weight can be a record', () => {
    // Epley: 100kg x 5 = 116.7; 95kg x 10 = 126.7.
    const records = findPersonalRecords(sessions(only(squat(100, [5])), only(squat(95, [10]))));

    expect(kindsBySession(records, 2)).toEqual([[], ['oneRepMax']]);
  });

  it('tracks each exercise separately', () => {
    const bench = (weightKg: number) => lift('Bench', [5], kg(weightKg));
    const records = findPersonalRecords(sessions(only(squat(100, [5]), bench(60)), only(squat(110, [5]), bench(50))));

    expect(records.get('s1')?.map((x) => x.exerciseName)).toEqual(['Squat', 'Squat']);
  });

  it('handles weights in different units', () => {
    const records = findPersonalRecords(
      sessions(only(squat(100, [5])), only(lift('Squat', [5], new Weight(250, 'pounds')))),
    );

    expect(kindsBySession(records, 2)[1]).toContain('heaviest');
  });

  it('counts every rep of double progression', () => {
    const ladder = [
      [8, 8, 8],
      [8, 8, 9],
      [8, 9, 9],
      [9, 9, 9],
      [9, 9, 10],
      [10, 10, 10],
    ];
    const records = findPersonalRecords(
      sessions(...ladder.map((reps) => ({ exercises: [pullUps(reps)], bodyweightKg: 80 }))),
    );

    expect(kindsBySession(records, ladder.length)).toEqual([
      [],
      ['mostReps', 'bestSet'],
      ['mostReps'],
      ['mostReps'],
      ['mostReps', 'bestSet'],
      ['mostReps'],
    ]);
    expect(records.get('s5')?.[0]).toMatchObject({ kind: 'mostReps', value: 30, previous: 28, weight: kg(0) });
  });

  it('counts double progression on a loaded lift', () => {
    const records = findPersonalRecords(
      sessions(only(squat(60, [8, 8, 8])), only(squat(60, [8, 8, 9])), only(squat(60, [8, 9, 9]))),
    );

    expect(kindsBySession(records, 3)).toEqual([[], ['oneRepMax', 'mostReps'], ['mostReps']]);
  });

  it('leaves bodyweight out, so the scales neither award nor withhold a record', () => {
    const records = findPersonalRecords(
      sessions(
        { exercises: [pullUps([9, 9, 9])], bodyweightKg: 80 },
        { exercises: [pullUps([9, 9, 9])], bodyweightKg: 82 },
        { exercises: [pullUps([9, 9, 10])], bodyweightKg: 82 },
        { exercises: [pullUps([10, 10, 10])], bodyweightKg: 79 },
      ),
    );

    expect(kindsBySession(records, 4)).toEqual([[], [], ['mostReps', 'bestSet'], ['mostReps']]);
  });

  it('awards reps records when no bodyweight was recorded', () => {
    const records = findPersonalRecords(sessions(only(pullUps([8, 8, 8])), only(pullUps([8, 8, 9]))));

    expect(kindsBySession(records, 2)[1]).toEqual(['mostReps', 'bestSet']);
  });

  it('gives a bodyweight exercise no est. 1RM', () => {
    const records = findPersonalRecords(
      sessions(
        { exercises: [pullUps([5], 10)], bodyweightKg: 80 },
        { exercises: [pullUps([5], 10)], bodyweightKg: 85 },
      ),
    );

    expect(records.size).toBe(0);
  });

  it('gives an assisted lift logged as a negative weight no heaviest lift or est. 1RM', () => {
    const records = findPersonalRecords(sessions(only(squat(-40, [8])), only(squat(-30, [8]))));

    expect(records.size).toBe(0);
  });

  it('awards reps records to exercises that track no load', () => {
    const records = findPersonalRecords(sessions(only(crunches([20])), only(crunches([30]))));

    expect(kindsBySession(records, 2)).toEqual([[], ['mostReps', 'bestSet']]);
  });

  it('awards heaviest lift the first time weight is added to a bodyweight exercise', () => {
    const records = findPersonalRecords(sessions(only(pullUps([10])), only(pullUps([6], 5)), only(pullUps([8], 5))));

    expect(kindsBySession(records, 3)).toEqual([[], ['heaviest'], ['mostReps', 'bestSet']]);
  });

  it('gives a lighter weight no reps record until it is repeated', () => {
    const records = findPersonalRecords(
      sessions(only(squat(100, [5, 5, 5])), only(squat(80, [8, 8, 8])), only(squat(80, [9, 9, 9]))),
    );

    expect(kindsBySession(records, 3)).toEqual([[], [], ['mostReps']]);
    expect(records.get('s2')?.[0]).toMatchObject({ value: 27, previous: 24, weight: kg(80) });
  });

  it('awards most reps for completing a weight that was missed', () => {
    const records = findPersonalRecords(
      sessions(only(squat(100, [5, 5, 5])), only(squat(102.5, [5, 5, 4])), only(squat(102.5, [5, 5, 5]))),
    );

    expect(kindsBySession(records, 3)).toEqual([[], ['heaviest', 'oneRepMax'], ['mostReps']]);
  });

  it('never awards most reps to linear progression', () => {
    const records = findPersonalRecords(
      sessions(only(squat(100, [5, 5, 5])), only(squat(102.5, [5, 5, 5])), only(squat(105, [5, 5, 5]))),
    );

    expect(kindsBySession(records, 3).flat()).not.toContain('mostReps');
  });

  it('only compares total reps across the same number of sets', () => {
    const records = findPersonalRecords(
      sessions(only(squat(100, [5, 5, 5])), only(squat(100, [5, 5, 5, 5])), only(squat(100, [5, 5, 5, 6]))),
    );

    expect(kindsBySession(records, 3)).toEqual([[], [], ['oneRepMax', 'mostReps']]);
  });

  it('keeps the better of a movement done twice in one session', () => {
    const records = findPersonalRecords(sessions(only(squat(100, [5])), only(squat(105, [5]), squat(110, [5]))));

    expect(records.get('s1')).toMatchObject([
      { kind: 'heaviest', exerciseOrd: 1, value: kg(110) },
      { kind: 'oneRepMax', exerciseOrd: 1 },
    ]);
  });

  it('ignores sessions with no completed sets', () => {
    const records = findPersonalRecords(sessions(only(squat(100, [5])), { exercises: [] }, only(squat(120, [5]))));

    expect(kindsBySession(records, 3)).toEqual([[], [], ['heaviest', 'oneRepMax']]);
  });
});
