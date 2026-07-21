import { describe, it, expect, beforeEach } from 'vitest';
import { Weight } from '@/models/weight';
import {
  PotentialSet,
  RecordedSet,
  RecordedWeightedExercise,
} from '@/models/session-models/recorded-weighted-exercise';
import { filledPotentialSet, makeWeightedBlueprint, tick } from '@/models/session-models/__test__/helpers';
import { IndexOutOfBoundsError } from '@/utils/index-out-of-bounds';

describe('RecordedWeightedExercise.withWeight', () => {
  let exercise: RecordedWeightedExercise;
  const light = new Weight(60, 'kilograms');
  const heavy = new Weight(120, 'kilograms');

  beforeEach(() => {
    const t = tick();
    exercise = new RecordedWeightedExercise(
      makeWeightedBlueprint(),
      [
        filledPotentialSet(10, t), // set 0 – completed
        new PotentialSet(undefined, light), // set 1 – uncompleted
        new PotentialSet(undefined, light), // set 2 – uncompleted
      ],
      undefined,
    );
  });

  it('thisSet only changes the targeted set', () => {
    const result = exercise.withWeight(1, heavy, 'thisSet');
    expect(result.potentialSets[0]!.weight).toEqual(exercise.potentialSets[0]!.weight);
    expect(result.potentialSets[1]!.weight).toEqual(heavy);
    expect(result.potentialSets[2]!.weight).toEqual(light);
  });

  it('uncompletedSets leaves completed sets alone', () => {
    const originalCompletedWeight = exercise.potentialSets[0]!.weight;
    const result = exercise.withWeight(1, heavy, 'uncompletedSets');
    expect(result.potentialSets[0]!.weight).toEqual(originalCompletedWeight);
    expect(result.potentialSets[1]!.weight).toEqual(heavy);
    expect(result.potentialSets[2]!.weight).toEqual(heavy);
  });

  it('allSets updates every set including completed ones', () => {
    const result = exercise.withWeight(0, heavy, 'allSets');
    expect(result.potentialSets.every((s) => s.weight.equals(heavy))).toBe(true);
  });
});

// ─── withNothingCompleted ─────────────────────────────────────────────────────

describe('RecordedWeightedExercise.withNothingCompleted', () => {
  it('clears all recorded sets and notes', () => {
    const bp = makeWeightedBlueprint();
    const t = tick();
    const exercise = new RecordedWeightedExercise(
      bp,
      [filledPotentialSet(10, t), filledPotentialSet(10, t.plusSeconds(30))],
      'some note',
    );

    const result = exercise.withNothingCompleted();

    expect(result.potentialSets.every((s) => s.set === undefined)).toBe(true);
    expect(result.notes).toBeUndefined();
  });

  it('preserves weights after clearing', () => {
    const bp = makeWeightedBlueprint();
    const t = tick();
    const weight = new Weight(80, 'kilograms');
    const exercise = new RecordedWeightedExercise(bp, [new PotentialSet(new RecordedSet(10, t), weight)], undefined);

    const result = exercise.withNothingCompleted();
    expect(result.potentialSets[0]!.weight).toEqual(weight);
  });
});

// ─── getSet ───────────────────────────────────────────────────────────────────

describe('RecordedWeightedExercise.getSet', () => {
  it('returns the set at the index', () => {
    const set = new PotentialSet(undefined, new Weight(60, 'kilograms'));
    const exercise = new RecordedWeightedExercise(makeWeightedBlueprint(), [set], undefined);
    expect(exercise.getSet(0)).toBe(set);
  });

  it('throws when the index is out of bounds', () => {
    const exercise = new RecordedWeightedExercise(makeWeightedBlueprint(), [], undefined);
    expect(() => exercise.getSet(0)).toThrow(IndexOutOfBoundsError);
  });
});

// ─── withRepCount ─────────────────────────────────────────────────────────────

describe('RecordedWeightedExercise.withRepCount', () => {
  it('records a set with the given reps', () => {
    const t = tick();
    const exercise = new RecordedWeightedExercise(
      makeWeightedBlueprint(),
      [new PotentialSet(undefined, new Weight(60, 'kilograms'))],
      undefined,
    );

    const result = exercise.withRepCount(0, 8, t);

    expect(result.potentialSets[0]!.set).toEqual(new RecordedSet(8, t));
  });

  it('clears the set when reps is undefined', () => {
    const t = tick();
    const exercise = new RecordedWeightedExercise(makeWeightedBlueprint(), [filledPotentialSet(10, t)], undefined);

    const result = exercise.withRepCount(0, undefined, t);

    expect(result.potentialSets[0]!.set).toBeUndefined();
  });
});

// ─── equals ───────────────────────────────────────────────────────────────────

describe('RecordedWeightedExercise.equals', () => {
  const t = tick();
  const base = () => new RecordedWeightedExercise(makeWeightedBlueprint(), [filledPotentialSet(10, t)], 'note');

  it('is false against undefined', () => {
    expect(base().equals(undefined)).toBe(false);
  });

  it('is true against itself', () => {
    const e = base();
    expect(e.equals(e)).toBe(true);
  });

  it('is true for a structurally equal exercise', () => {
    expect(base().equals(base())).toBe(true);
  });

  it('is false when notes differ', () => {
    expect(base().equals(base().with({ notes: 'other' }))).toBe(false);
  });

  it('is false when the number of sets differs', () => {
    expect(base().equals(base().with({ potentialSets: [] }))).toBe(false);
  });
});

// ─── derived properties ───────────────────────────────────────────────────────

describe('RecordedWeightedExercise derived values', () => {
  it('currentSetIndex points at the first uncompleted set', () => {
    const t = tick();
    const exercise = new RecordedWeightedExercise(
      makeWeightedBlueprint(),
      [filledPotentialSet(10, t), new PotentialSet(undefined, new Weight(60, 'kilograms'))],
      undefined,
    );
    expect(exercise.currentSetIndex).toBe(1);
  });

  it('totalWeightLifted sums weight times reps completed', () => {
    const t = tick();
    const exercise = new RecordedWeightedExercise(
      makeWeightedBlueprint(),
      [
        new PotentialSet(new RecordedSet(5, t), new Weight(100, 'kilograms')),
        new PotentialSet(new RecordedSet(3, t), new Weight(50, 'kilograms')),
        new PotentialSet(undefined, new Weight(50, 'kilograms')),
      ],
      undefined,
    );
    expect(exercise.totalWeightLifted).toEqual(new Weight(650, 'kilograms'));
  });

  it('duration spans the earliest to latest completion time', () => {
    const first = tick();
    const last = first.plusSeconds(90);
    const exercise = new RecordedWeightedExercise(
      makeWeightedBlueprint(),
      [filledPotentialSet(10, last), filledPotentialSet(10, first)],
      undefined,
    );
    expect(exercise.earliestTime).toEqual(first);
    expect(exercise.latestTime).toEqual(last);
    expect(exercise.duration!.seconds()).toBe(90);
  });

  it('duration is undefined when nothing is recorded', () => {
    const exercise = RecordedWeightedExercise.empty(makeWeightedBlueprint(), 'kilograms');
    expect(exercise.duration).toBeUndefined();
  });

  it('isSuccessForProgressiveOverload requires every set to hit the target reps', () => {
    const t = tick();
    const success = new RecordedWeightedExercise(
      makeWeightedBlueprint(),
      [filledPotentialSet(10, t), filledPotentialSet(11, t)],
      undefined,
    );
    const failure = success.withRepCount(1, 9, t);
    expect(success.isSuccessForProgressiveOverload).toBe(true);
    expect(failure.isSuccessForProgressiveOverload).toBe(false);
  });
});

// ─── rep schemes: ranges & pyramids ───────────────────────────────────────────

describe('RecordedWeightedExercise.withCycledRepCount', () => {
  it('fills an empty set to the top of a rep range', () => {
    const bp = makeWeightedBlueprint().with({ repsConfig: { type: 'range', min: 10, max: 12 } });
    const result = RecordedWeightedExercise.empty(bp, 'kilograms').withCycledRepCount(0, tick());
    expect(result.getSet(0).set?.repsCompleted).toBe(12);
  });

  it('fills each set to its own target for a pyramid', () => {
    const bp = makeWeightedBlueprint().with({
      sets: 3,
      repsConfig: {
        type: 'perSet',
        targets: [
          { min: 12, max: 12 },
          { min: 10, max: 10 },
          { min: 8, max: 8 },
        ],
      },
    });
    const exercise = RecordedWeightedExercise.empty(bp, 'kilograms');
    expect(exercise.withCycledRepCount(0, tick()).getSet(0).set?.repsCompleted).toBe(12);
    expect(exercise.withCycledRepCount(2, tick()).getSet(2).set?.repsCompleted).toBe(8);
  });

  it('decrements from the top on repeated taps', () => {
    const bp = makeWeightedBlueprint().with({ repsConfig: { type: 'range', min: 10, max: 12 } });
    const once = RecordedWeightedExercise.empty(bp, 'kilograms').withCycledRepCount(0, tick());
    expect(once.withCycledRepCount(0, tick()).getSet(0).set?.repsCompleted).toBe(11);
  });
});

describe('RecordedWeightedExercise.isSuccessForProgressiveOverload with rep schemes', () => {
  it('requires the top of the range on every set', () => {
    const bp = makeWeightedBlueprint().with({ sets: 2, repsConfig: { type: 'range', min: 10, max: 12 } });
    const t = tick();
    const topOnAll = new RecordedWeightedExercise(
      bp,
      [filledPotentialSet(12, t), filledPotentialSet(12, t)],
      undefined,
    );
    const oneShort = new RecordedWeightedExercise(
      bp,
      [filledPotentialSet(12, t), filledPotentialSet(11, t)],
      undefined,
    );
    expect(topOnAll.isSuccessForProgressiveOverload).toBe(true);
    expect(oneShort.isSuccessForProgressiveOverload).toBe(false);
  });

  it("uses each set's own target for a pyramid", () => {
    const bp = makeWeightedBlueprint().with({
      sets: 3,
      repsConfig: {
        type: 'perSet',
        targets: [
          { min: 12, max: 12 },
          { min: 10, max: 10 },
          { min: 8, max: 8 },
        ],
      },
    });
    const t = tick();
    const hit = new RecordedWeightedExercise(
      bp,
      [filledPotentialSet(12, t), filledPotentialSet(10, t), filledPotentialSet(8, t)],
      undefined,
    );
    const miss = hit.withRepCount(2, 7, t);
    expect(hit.isSuccessForProgressiveOverload).toBe(true);
    expect(miss.isSuccessForProgressiveOverload).toBe(false);
  });
});

// ─── JSON round-trips ─────────────────────────────────────────────────────────

describe('RecordedWeightedExercise JSON', () => {
  it('round-trips through toJSON/fromJSON', () => {
    const t = tick();
    const exercise = new RecordedWeightedExercise(
      makeWeightedBlueprint(),
      [filledPotentialSet(10, t), new PotentialSet(undefined, new Weight(60, 'kilograms'))],
      'a note',
    );

    const restored = RecordedWeightedExercise.fromJSON(exercise.toJSON());

    expect(restored.equals(exercise)).toBe(true);
  });

  it('RecordedSet round-trips and compares by value', () => {
    const t = tick();
    const set = new RecordedSet(7, t);
    const restored = RecordedSet.fromJSON(set.toJSON());
    expect(restored.equals(set)).toBe(true);
    expect(set.equals(undefined)).toBe(false);
    expect(set.equals(set)).toBe(true);
    expect(set.equals(new RecordedSet(8, t))).toBe(false);
  });

  it('PotentialSet round-trips and compares by value', () => {
    const t = tick();
    const filled = filledPotentialSet(10, t);
    const empty = new PotentialSet(undefined, new Weight(60, 'kilograms'));
    expect(PotentialSet.fromJSON(filled.toJSON()).equals(filled)).toBe(true);
    expect(PotentialSet.fromJSON(empty.toJSON()).equals(empty)).toBe(true);
    expect(filled.equals(undefined)).toBe(false);
    expect(filled.equals(filled)).toBe(true);
    expect(filled.equals(empty)).toBe(false);
  });
});

describe('RecordedSet.power', () => {
  it('defaults power to undefined', () => {
    expect(new RecordedSet(10, tick()).power).toBeUndefined();
  });

  it('stores power and handles it in with()', () => {
    const set = new RecordedSet(10, tick(), 312);
    expect(set.power).toBe(312);
    expect(set.with({ repsCompleted: 9 }).power).toBe(312);
    expect(set.with({ power: 400 }).power).toBe(400);
    expect(set.with({ power: undefined }).power).toBeUndefined();
  });

  it('round-trips power through JSON and defaults to undefined when absent', () => {
    const time = tick();
    const withPower = new RecordedSet(8, time, 250);
    const roundTripped = RecordedSet.fromJSON(withPower.toJSON());
    expect(roundTripped.equals(withPower)).toBe(true);
    expect(roundTripped.power).toBe(250);

    const withoutPower = new RecordedSet(8, time);
    expect(withoutPower.toJSON().power).toBeUndefined();
    expect(RecordedSet.fromJSON(withoutPower.toJSON()).power).toBeUndefined();
  });

  it('includes power in equality', () => {
    const time = tick();
    const a = new RecordedSet(10, time, 312);
    expect(a.equals(new RecordedSet(10, time, 312))).toBe(true);
    expect(a.equals(new RecordedSet(10, time, 300))).toBe(false);
    expect(a.equals(new RecordedSet(10, time))).toBe(false);
  });
});

describe('RecordedWeightedExercise power operations', () => {
  function makeExercise() {
    return new RecordedWeightedExercise(
      makeWeightedBlueprint(),
      [
        filledPotentialSet(10, tick(), undefined, 250),
        filledPotentialSet(10, tick(), undefined, 312),
        new PotentialSet(undefined, new Weight(100, 'kilograms')),
      ],
      undefined,
    );
  }

  it('withPower sets power on a completed set', () => {
    const result = makeExercise().withPower(0, 400);
    expect(result.getSet(0).set?.power).toBe(400);
    expect(result.getSet(1).set?.power).toBe(312);
  });

  it('withPower(undefined) clears power but keeps the completed set', () => {
    const result = makeExercise().withPower(1, undefined);
    expect(result.getSet(1).set?.power).toBeUndefined();
    expect(result.getSet(1).set?.repsCompleted).toBe(10);
  });

  it('withPower is a no-op on an uncompleted set', () => {
    const exercise = makeExercise();
    const result = exercise.withPower(2, 400);
    expect(result.getSet(2).set).toBeUndefined();
    expect(result.equals(exercise)).toBe(true);
  });

  it('withRepCount preserves existing power when editing reps', () => {
    const result = makeExercise().withRepCount(1, 8, tick());
    expect(result.getSet(1).set?.repsCompleted).toBe(8);
    expect(result.getSet(1).set?.power).toBe(312);
  });

  it('withRepCount(undefined) clears the whole set including power', () => {
    expect(makeExercise().withRepCount(1, undefined, tick()).getSet(1).set).toBeUndefined();
  });

  it('withCycledRepCount decrement preserves power', () => {
    const result = makeExercise().withCycledRepCount(1, tick());
    expect(result.getSet(1).set?.repsCompleted).toBe(9);
    expect(result.getSet(1).set?.power).toBe(312);
  });

  it('withNothingCompleted drops power with the set', () => {
    const result = makeExercise().withNothingCompleted();
    expect(result.potentialSets.every((x) => x.set === undefined)).toBe(true);
  });

  it('maxPower returns the max across sets, or undefined when none recorded', () => {
    expect(makeExercise().maxPower).toBe(312);
    const noPower = new RecordedWeightedExercise(makeWeightedBlueprint(), [filledPotentialSet(10, tick())], undefined);
    expect(noPower.maxPower).toBeUndefined();
  });

  it('latestRecordedPower returns the power of the most recently completed set that has one', () => {
    const exercise = new RecordedWeightedExercise(
      makeWeightedBlueprint(),
      [
        filledPotentialSet(10, tick(), undefined, 250),
        filledPotentialSet(10, tick(), undefined, 312),
        filledPotentialSet(10, tick()),
      ],
      undefined,
    );
    expect(exercise.latestRecordedPower).toBe(312);
    expect(makeExercise().withPower(1, undefined).latestRecordedPower).toBe(250);
    const noPower = new RecordedWeightedExercise(makeWeightedBlueprint(), [filledPotentialSet(10, tick())], undefined);
    expect(noPower.latestRecordedPower).toBeUndefined();
  });

  it('latestRecordedPower uses completion time, not array order', () => {
    const t1 = tick();
    const t2 = tick();
    const t3 = tick();
    const exercise = new RecordedWeightedExercise(
      makeWeightedBlueprint(),
      [
        filledPotentialSet(10, t3, undefined, 300),
        filledPotentialSet(10, t1, undefined, 400),
        filledPotentialSet(10, t2, undefined, 312),
      ],
      undefined,
    );
    expect(exercise.latestRecordedPower).toBe(300);
  });
});
