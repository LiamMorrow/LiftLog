import { describe, expect, it } from 'vitest';
import { LocalDate } from '@js-joda/core';
import { Resistance, SessionBlueprint } from '@/models/blueprint-models';
import { RecordedWeightedExercise, Session } from '@/models/session-models';
import { Weight } from '@/models/weight';
import { makeRecordedExercise, makeWeightedBlueprint } from '@/models/session-models/__test__/helpers';
import { compareExercises, plannedSetCount } from '@/utils/session-comparison';

const kg = (n: number) => new Weight(n, 'kilograms');

function lift(name: string, reps: (number | undefined)[], weight: Weight, resistance: Resistance = 'external') {
  return makeRecordedExercise(makeWeightedBlueprint({ name, resistance, sets: reps.length }), reps, weight);
}

function session(...exercises: RecordedWeightedExercise[]) {
  return new Session(
    's',
    new SessionBlueprint('Pull', [], ''),
    exercises,
    LocalDate.of(2026, 10, 31),
    undefined,
    undefined,
  );
}

const changeOf = (current: Session, previous: Session | undefined, inProgress = false) =>
  compareExercises(current, previous, inProgress).map((x) => x.change);

describe('compareExercises', () => {
  it('reports a volume increase as a percentage', () => {
    const [change] = changeOf(session(lift('Deadlift', [5, 5], kg(110))), session(lift('Deadlift', [5, 5], kg(100))));

    expect(change).toMatchObject({ kind: 'better' });
    expect(change && 'amount' in change && change.amount.toNumber()).toBe(10);
  });

  it('reports a volume decrease rather than staying silent', () => {
    const [change] = changeOf(session(lift('Curl', [10, 5], kg(20))), session(lift('Curl', [10, 10], kg(20))));

    expect(change).toMatchObject({ kind: 'worse' });
    expect(change && 'amount' in change && change.amount.toNumber()).toBe(25);
  });

  it('compares bodyweight movements by reps, since their volume is zero', () => {
    const [comparison] = compareExercises(
      session(lift('Pullups', [9, 9, 8], kg(0), 'bodyweight')),
      session(lift('Pullups', [8, 8, 8], kg(0), 'bodyweight')),
      false,
    );

    expect(comparison?.measure).toEqual({ kind: 'reps', current: 26, previous: 24 });
    expect(comparison?.change).toMatchObject({ kind: 'better' });
  });

  it('calls an exercise with no completed sets skipped once finished, and pending while in progress', () => {
    const current = session(lift('Hammer Curl', [undefined, undefined], kg(20)));
    const previous = session(lift('Hammer Curl', [10, 10], kg(20)));

    expect(changeOf(current, previous)).toEqual([{ kind: 'skipped' }]);
    expect(changeOf(current, previous, true)).toEqual([{ kind: 'pending' }]);
  });

  it('calls an exercise new when last time had none of it', () => {
    expect(changeOf(session(lift('Wrist Rotations', [12], kg(6))), undefined)).toEqual([{ kind: 'new' }]);
    expect(
      changeOf(session(lift('Wrist Rotations', [12], kg(6))), session(lift('Wrist Rotations', [undefined], kg(6)))),
    ).toEqual([{ kind: 'new' }]);
  });

  it('compares across units', () => {
    const [change] = changeOf(
      session(lift('Row', [10], new Weight(100, 'pounds'))),
      session(lift('Row', [10], new Weight(100, 'pounds').convertTo('kilograms'))),
    );

    expect(change).toEqual({ kind: 'same' });
  });
});

describe('plannedSetCount', () => {
  it('counts every set whether or not it was done', () => {
    expect(plannedSetCount(session(lift('A', [5, undefined], kg(10)), lift('B', [undefined], kg(10))))).toBe(3);
  });
});
