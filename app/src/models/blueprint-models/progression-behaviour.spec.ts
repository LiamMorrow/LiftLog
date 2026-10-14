import { describe, expect, it } from 'vitest';
import BigNumber from 'bignumber.js';
import {
  applyProgression,
  IncreaseStrategy,
  ProgressionRule,
  WeightedExerciseBlueprint,
  weightIncrementFor,
} from '@/models/blueprint-models';
import { RecordedWeightedExercise } from '@/models/session-models';
import { Weight } from '@/models/weight';
import { emptyPotentialSet, filledPotentialSet, tick } from '@/models/session-models/__test__/helpers';

/**
 * What progressive overload puts on the bar next session, held as data rather than as calls into a
 * particular shape. `configure` and `apply` below are the only place this file knows how progression
 * is modelled, so a rewrite of the model is measured against expectations that never moved.
 */

type ProgressionConfig =
  | { kind: 'none' }
  | { kind: 'allEvenly'; amount: number }
  | { kind: 'lowestSet'; amount: number; pick: IncreaseStrategy };

function configure(config: ProgressionConfig): ProgressionRule[] {
  switch (config.kind) {
    case 'none':
      return [];
    case 'allEvenly':
      return [ProgressionRule.load(BigNumber(config.amount))];
    case 'lowestSet':
      return [ProgressionRule.load(BigNumber(config.amount), { type: 'lowestSets', pick: config.pick })];
  }
}

function apply(config: ProgressionConfig, exercise: RecordedWeightedExercise): RecordedWeightedExercise {
  return applyProgression(configure(config), exercise);
}

function weightIncrementOf(config: ProgressionConfig): number {
  return weightIncrementFor(configure(config)).toNumber();
}

function exerciseWith(weights: number[], recorded = false): RecordedWeightedExercise {
  const blueprint = WeightedExerciseBlueprint.of({
    name: 'Squat',
    plannedSets: weights.map(() => ({ reps: { min: 10, max: 10 } })),
  });
  return new RecordedWeightedExercise(
    blueprint,
    weights.map((w) =>
      recorded
        ? filledPotentialSet(10, tick(), new Weight(w, 'kilograms'))
        : emptyPotentialSet(new Weight(w, 'kilograms')),
    ),
    undefined,
  );
}

function weightsOf(exercise: RecordedWeightedExercise): number[] {
  return exercise.potentialSets.map((s) => s.weight.value.toNumber());
}

interface Case {
  name: string;
  config: ProgressionConfig;
  from: number[];
  to: number[];
}

/** Sets `[60, 80, 60, 70, 60]` put the lowest weight at indices 0, 2 and 4, so each pick is distinct. */
const mixed = [60, 80, 60, 70, 60];

const cases: Case[] = [
  { name: 'none leaves every set alone', config: { kind: 'none' }, from: [60, 70, 80], to: [60, 70, 80] },

  {
    name: 'allEvenly raises every set',
    config: { kind: 'allEvenly', amount: 5 },
    from: [60, 70, 80],
    to: [65, 75, 85],
  },
  {
    name: 'allEvenly carries a fractional increment',
    config: { kind: 'allEvenly', amount: 2.5 },
    from: [100],
    to: [102.5],
  },
  {
    name: 'allEvenly with a zero amount is a no-op, not the 2.5 fallback',
    config: { kind: 'allEvenly', amount: 0 },
    from: [60, 70],
    to: [60, 70],
  },
  { name: 'allEvenly over no sets', config: { kind: 'allEvenly', amount: 5 }, from: [], to: [] },
  {
    name: 'allEvenly raises negative weights towards zero',
    config: { kind: 'allEvenly', amount: 5 },
    from: [-10, 0, 10],
    to: [-5, 5, 15],
  },

  {
    name: 'lowestSet/all raises every set tied for lowest',
    config: { kind: 'lowestSet', amount: 5, pick: 'all' },
    from: mixed,
    to: [65, 80, 65, 70, 65],
  },
  {
    name: 'lowestSet/first raises only the earliest lowest set',
    config: { kind: 'lowestSet', amount: 5, pick: 'first' },
    from: mixed,
    to: [65, 80, 60, 70, 60],
  },
  {
    name: 'lowestSet/last raises only the final lowest set',
    config: { kind: 'lowestSet', amount: 5, pick: 'last' },
    from: mixed,
    to: [60, 80, 60, 70, 65],
  },
  {
    name: 'lowestSet/middle raises the lowest set nearest the centre',
    config: { kind: 'lowestSet', amount: 5, pick: 'middle' },
    from: mixed,
    to: [60, 80, 65, 70, 60],
  },
  {
    name: 'lowestSet/middle breaks an equidistant tie towards the earlier set',
    config: { kind: 'lowestSet', amount: 5, pick: 'middle' },
    from: [60, 80, 60],
    to: [65, 80, 60],
  },
  {
    name: 'lowestSet/middle picks the nearer of two adjacent lowest sets',
    config: { kind: 'lowestSet', amount: 5, pick: 'middle' },
    from: [80, 80, 80, 60, 60],
    to: [80, 80, 80, 65, 60],
  },
  {
    name: 'lowestSet/all over a uniform exercise raises everything',
    config: { kind: 'lowestSet', amount: 2.5, pick: 'all' },
    from: [50, 50, 50],
    to: [52.5, 52.5, 52.5],
  },
  {
    name: 'lowestSet ranks a negative weight as the lowest',
    config: { kind: 'lowestSet', amount: 5, pick: 'all' },
    from: [-20, -10],
    to: [-15, -10],
  },
  {
    name: 'lowestSet with a zero amount is a no-op',
    config: { kind: 'lowestSet', amount: 0, pick: 'all' },
    from: mixed,
    to: mixed,
  },
  { name: 'lowestSet over no sets', config: { kind: 'lowestSet', amount: 5, pick: 'all' }, from: [], to: [] },
];

describe('progressive overload behaviour', () => {
  it.each(cases)('$name', ({ config, from, to }) => {
    expect(weightsOf(apply(config, exerciseWith(from)))).toEqual(to);
  });

  it.each(['all', 'first', 'last', 'middle'] as const)('lowestSet/%s raises a lone set', (pick) => {
    expect(weightsOf(apply({ kind: 'lowestSet', amount: 5, pick }, exerciseWith([100])))).toEqual([105]);
  });

  it.each(cases)('$name — applies the same way to sets already logged', ({ config, from, to }) => {
    expect(weightsOf(apply(config, exerciseWith(from, true)))).toEqual(to);
  });

  it('returns the very same exercise when nothing moves', () => {
    const configured = exerciseWith([60, 70, 80]);
    expect(apply({ kind: 'none' }, configured)).toBe(configured);

    const setless = exerciseWith([]);
    expect(apply({ kind: 'lowestSet', amount: 5, pick: 'all' }, setless)).toBe(setless);
  });

  it('leaves the reps target alone on every axis', () => {
    const applied = apply({ kind: 'allEvenly', amount: 5 }, exerciseWith(mixed));
    expect(applied.potentialSets.map((s) => s.target)).toEqual(mixed.map(() => ({ min: 10, max: 10 })));
  });

  it('leaves what was logged alone', () => {
    const applied = apply({ kind: 'allEvenly', amount: 5 }, exerciseWith([60, 70], true));
    expect(applied.potentialSets.map((s) => s.set?.repsCompleted)).toEqual([10, 10]);
  });
});

/** Drives the weight stepper in the set counter, so it has to survive independently of what moves. */
describe('weightIncrement', () => {
  it.each([
    { config: { kind: 'none' } as ProgressionConfig, increment: 2.5 },
    { config: { kind: 'allEvenly', amount: 0 } as ProgressionConfig, increment: 2.5 },
    { config: { kind: 'allEvenly', amount: 5 } as ProgressionConfig, increment: 5 },
    { config: { kind: 'allEvenly', amount: 2.5 } as ProgressionConfig, increment: 2.5 },
    { config: { kind: 'lowestSet', amount: 0, pick: 'all' } as ProgressionConfig, increment: 2.5 },
    { config: { kind: 'lowestSet', amount: 7.5, pick: 'first' } as ProgressionConfig, increment: 7.5 },
  ])('$config.kind with amount $config.amount steps by $increment', ({ config, increment }) => {
    expect(weightIncrementOf(config)).toBe(increment);
  });
});
