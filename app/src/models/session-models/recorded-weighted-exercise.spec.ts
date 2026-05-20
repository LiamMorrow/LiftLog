import { describe, it, expect, beforeEach } from 'vitest';
import { Weight } from '@/models/weight';
import {
  PotentialSet,
  RecordedSet,
  RecordedWeightedExercise,
} from '@/models/session-models/recorded-weighted-exercise';
import {
  filledPotentialSet,
  makeWeightedBlueprint,
  tick,
} from '@/models/session-models/__test__/helpers';

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
    expect(result.potentialSets[0].weight).toEqual(
      exercise.potentialSets[0].weight,
    );
    expect(result.potentialSets[1].weight).toEqual(heavy);
    expect(result.potentialSets[2].weight).toEqual(light);
  });

  it('uncompletedSets leaves completed sets alone', () => {
    const originalCompletedWeight = exercise.potentialSets[0].weight;
    const result = exercise.withWeight(1, heavy, 'uncompletedSets');
    expect(result.potentialSets[0].weight).toEqual(originalCompletedWeight);
    expect(result.potentialSets[1].weight).toEqual(heavy);
    expect(result.potentialSets[2].weight).toEqual(heavy);
  });

  it('allSets updates every set including completed ones', () => {
    const result = exercise.withWeight(0, heavy, 'allSets');
    expect(result.potentialSets.every((s) => s.weight.equals(heavy))).toBe(
      true,
    );
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
    const exercise = new RecordedWeightedExercise(
      bp,
      [new PotentialSet(new RecordedSet(10, t), weight)],
      undefined,
    );

    const result = exercise.withNothingCompleted();
    expect(result.potentialSets[0].weight).toEqual(weight);
  });
});
