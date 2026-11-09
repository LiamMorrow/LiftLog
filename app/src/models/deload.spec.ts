import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import BigNumber from 'bignumber.js';
import {
  deloadDifference,
  deloadExercise,
  deloadSession,
  deloadSetCount,
  restoreNormalExercise,
  snapToStep,
} from '@/models/deload';
import { ProgressionRule } from '@/models/blueprint-models';
import { RecordedWeightedExercise } from '@/models/session-models';
import {
  emptyPotentialSet,
  filledPotentialSet,
  makeCardioBlueprint,
  makeSession,
  makeWeightedBlueprint,
} from '@/models/session-models/__test__/helpers';
import { Weight } from '@/models/weight';
import { OffsetDateTime } from '@js-joda/core';

const lighter = { style: 'lighterWeight', weightPercent: 60, setsPercent: 50 } as const;
const fewer = { style: 'fewerSets', weightPercent: 60, setsPercent: 50 } as const;

const loggedAt = OffsetDateTime.parse('2026-01-01T10:00:00Z');

function partlyLoggedExercise(logged: number[], remaining: number[]) {
  return new RecordedWeightedExercise(
    makeWeightedBlueprint({ progression: [] }),
    [
      ...logged.map((weight) => filledPotentialSet(10, loggedAt, new Weight(weight, 'kilograms'))),
      ...remaining.map((weight) => emptyPotentialSet(new Weight(weight, 'kilograms'))),
    ],
    undefined,
  );
}

function exerciseOf(
  weights: number[],
  blueprint = makeWeightedBlueprint(),
  unit: 'kilograms' | 'pounds' = 'kilograms',
) {
  return new RecordedWeightedExercise(
    blueprint,
    weights.map((weight) => emptyPotentialSet(new Weight(weight, unit))),
    undefined,
  );
}

const steps = fc.constantFrom(1, 1.25, 2.5, 5, 10).map((x) => new BigNumber(x));
const weights = fc.integer({ min: 0, max: 4000 }).map((x) => new BigNumber(x).dividedBy(4));

describe('snapToStep', () => {
  it('snaps to a multiple of the step', () => {
    fc.assert(
      fc.property(weights, steps, (weight, step) => {
        expect(snapToStep(weight, step).modulo(step).isZero()).toBe(true);
      }),
    );
  });

  it('never goes negative', () => {
    fc.assert(
      fc.property(weights, steps, (weight, step) => {
        expect(snapToStep(weight, step).isNegative()).toBe(false);
      }),
    );
  });

  it('keeps zero at zero', () => {
    fc.assert(
      fc.property(steps, (step) => {
        expect(snapToStep(new BigNumber(0), step).isZero()).toBe(true);
      }),
    );
  });
});

describe('deloadSetCount', () => {
  it('keeps the percentage of sets, rounded up, and at least one', () => {
    expect(deloadSetCount(5, 50)).toBe(3);
    expect(deloadSetCount(5, 60)).toBe(3);
    expect(deloadSetCount(5, 80)).toBe(4);
    expect(deloadSetCount(3, 40)).toBe(2);
    expect(deloadSetCount(0, 50)).toBe(1);
  });

  it('never keeps more sets than there were', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 20 }), fc.integer({ min: 1, max: 100 }), (sets, percent) => {
        expect(deloadSetCount(sets, percent)).toBeLessThanOrEqual(sets);
      }),
    );
  });
});

describe('deloadExercise', () => {
  it('lightens every set and snaps to the nearest 2.5 when there is no weight rule', () => {
    const exercise = exerciseOf([102.5, 82.5, 140], makeWeightedBlueprint({ progression: [] }));

    const deloaded = deloadExercise(exercise, lighter);

    expect(deloaded.potentialSets.map((set) => set.weight.value.toNumber())).toEqual([62.5, 50, 85]);
  });

  it('snaps to the step of the first weight rule', () => {
    const exercise = exerciseOf(
      [100],
      makeWeightedBlueprint({ progression: [ProgressionRule.load(new BigNumber(5))] }),
    );

    expect(deloadExercise(exercise, lighter).potentialSets[0]!.weight.value.toNumber()).toBe(60);
    expect(deloadExercise(exercise, { ...lighter, weightPercent: 63 }).potentialSets[0]!.weight.value.toNumber()).toBe(
      65,
    );
  });

  it('snaps in the exercise’s own unit', () => {
    const exercise = exerciseOf(
      [225],
      makeWeightedBlueprint({ progression: [ProgressionRule.load(new BigNumber(5))] }),
      'pounds',
    );

    const set = deloadExercise(exercise, lighter).potentialSets[0]!;

    expect(set.weight.unit).toBe('pounds');
    expect(set.weight.value.toNumber()).toBe(135);
  });

  it('drops a set from an exercise that lifts no weight', () => {
    const noResistance = exerciseOf([0, 0, 0], makeWeightedBlueprint({ resistance: 'none' }));
    const bodyweight = exerciseOf([0, 0, 0], makeWeightedBlueprint({ resistance: 'bodyweight' }));

    expect(deloadExercise(noResistance, lighter).potentialSets).toHaveLength(2);
    expect(deloadExercise(bodyweight, lighter).potentialSets).toHaveLength(2);
  });

  it('keeps one set of an exercise that lifts no weight', () => {
    expect(deloadExercise(exerciseOf([0]), lighter).potentialSets).toHaveLength(1);
  });

  it('keeps the chosen percentage of the sets at the same weight, for fewer sets', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 10 }), fc.constantFrom(40, 50, 60, 70, 80), (sets, setsPercent) => {
        const exercise = exerciseOf(Array.from({ length: sets }, () => 100));
        const deloaded = deloadExercise(exercise, { ...fewer, setsPercent });
        expect(deloaded.potentialSets).toHaveLength(deloadSetCount(sets, setsPercent));
        expect(deloaded.potentialSets.every((set) => set.weight.value.toNumber() === 100)).toBe(true);
      }),
    );
  });

  it('leaves logged sets alone when lightening the weight', () => {
    const deloaded = deloadExercise(partlyLoggedExercise([100], [100, 100]), lighter);

    expect(deloaded.potentialSets.map((set) => set.weight.value.toNumber())).toEqual([100, 60, 60]);
    expect(deloaded.potentialSets[0]!.isComplete).toBe(true);
  });

  it('counts logged sets towards the sets kept', () => {
    expect(deloadExercise(partlyLoggedExercise([100], [100, 100, 100]), fewer).potentialSets).toHaveLength(2);
  });

  it('never drops a logged set', () => {
    const deloaded = deloadExercise(partlyLoggedExercise([100, 100, 100], [100]), fewer);

    expect(deloaded.potentialSets).toHaveLength(3);
    expect(deloaded.potentialSets.every((set) => set.isComplete)).toBe(true);
  });

  it('changes nothing for a deload that keeps the workout as is', () => {
    const exercise = exerciseOf([100, 100]);

    expect(deloadExercise(exercise, { ...lighter, style: 'unchanged' })).toBe(exercise);
  });

  it('keeps the blueprint', () => {
    const exercise = exerciseOf([100, 100, 100]);

    expect(deloadExercise(exercise, fewer).blueprint).toBe(exercise.blueprint);
  });
});

describe('deloadSession', () => {
  it('marks the session and leaves cardio alone', () => {
    const session = makeSession([makeWeightedBlueprint(), makeCardioBlueprint()]);

    const deloaded = deloadSession(session, fewer);

    expect(deloaded.deload).toBe(true);
    expect(deloaded.recordedExercises[1]).toBe(session.recordedExercises[1]);
  });

  it('lightens a session only once', () => {
    const deloaded = deloadSession(makeSession([makeWeightedBlueprint()]), lighter);

    expect(deloadSession(deloaded, lighter)).toBe(deloaded);
  });
});

describe('restoreNormalExercise', () => {
  const weightsOf = (exercise: RecordedWeightedExercise) =>
    exercise.potentialSets.map((set) => set.weight.value.toNumber());

  it('puts back the normal weight on sets not yet logged', () => {
    const normal = partlyLoggedExercise([], [100, 100]);

    expect(weightsOf(restoreNormalExercise(deloadExercise(normal, lighter), normal))).toEqual([100, 100]);
  });

  it('keeps logged sets as they were performed', () => {
    const restored = restoreNormalExercise(
      partlyLoggedExercise([60], [60, 60]),
      partlyLoggedExercise([], [100, 100, 100]),
    );

    expect(weightsOf(restored)).toEqual([60, 100, 100]);
    expect(restored.potentialSets[0]!.isComplete).toBe(true);
  });

  it('puts back the sets a deload removed', () => {
    const normal = partlyLoggedExercise([], [100, 100, 100, 100]);

    expect(restoreNormalExercise(deloadExercise(normal, fewer), normal).potentialSets).toHaveLength(4);
  });

  it('keeps sets added beyond what the plan asks for', () => {
    const restored = restoreNormalExercise(
      partlyLoggedExercise([100, 100, 100], [100]),
      partlyLoggedExercise([], [100, 100]),
    );

    expect(restored.potentialSets).toHaveLength(4);
  });
});

describe('deloadDifference', () => {
  it('reports the normal weight when the weight changed', () => {
    const normal = exerciseOf([100, 100]);

    expect(deloadDifference(deloadExercise(normal, lighter), normal)).toEqual({
      type: 'weight',
      normal: normal.maxWeight,
    });
  });

  it('reports the normal weight when only the remaining sets were lightened', () => {
    const normal = partlyLoggedExercise([100], [100, 100]);

    expect(deloadDifference(deloadExercise(normal, lighter), normal)).toEqual({
      type: 'weight',
      normal: normal.maxWeight,
    });
  });

  it('reports the normal set count when only the sets changed', () => {
    const normal = exerciseOf([100, 100, 100]);

    expect(deloadDifference(deloadExercise(normal, fewer), normal)).toEqual({ type: 'sets', normal: 3 });
  });

  it('reports nothing when nothing changed', () => {
    const normal = exerciseOf([100]);

    expect(deloadDifference(normal, normal)).toBeUndefined();
  });
});
