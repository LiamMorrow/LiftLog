import { describe, it, expect } from 'vitest';
import { progressiveOverloadToRules } from './progressive-overload-to-rules';

type BigNumberString = string & { _BRAND: 'BigNumber' };
const amount = (value: string) => value as BigNumberString;

type IncreaseStrategy = 'first' | 'middle' | 'last' | 'all';

type ProgressiveOverload =
  | { type: 'NoProgressiveOverload' }
  | { type: 'IncreaseAllEvenlyProgressiveOverload'; amount: BigNumberString }
  | { type: 'IncreaseLowestSetProgressiveOverload'; amount: BigNumberString; increaseStrategy: IncreaseStrategy };

function weighted(progressiveOverload: ProgressiveOverload) {
  return {
    type: 'WeightedExerciseBlueprint' as const,
    name: 'Squat',
    plannedSets: [{ reps: { min: 5, max: 5 } }],
    loadBasis: 'external' as const,
    progressiveOverload,
    supersetWithNext: false,
    notes: '',
    link: '',
  };
}

const loadRule = (step: string, scope: unknown) => ({ axis: 'load', step, scope, trigger: 'allSetsMetTarget' });

describe('progressiveOverloadToRules', () => {
  it.each([
    ['no progression at all', weighted({ type: 'NoProgressiveOverload' }), []],
    [
      'increase all evenly',
      weighted({ type: 'IncreaseAllEvenlyProgressiveOverload', amount: amount('2.5') }),
      [loadRule('2.5', { type: 'allSets' })],
    ],
    [
      'increase the lowest set, every match',
      weighted({ type: 'IncreaseLowestSetProgressiveOverload', amount: amount('5'), increaseStrategy: 'all' }),
      [loadRule('5', { type: 'lowestSets', pick: 'all' })],
    ],
    [
      'increase the lowest set, one pick',
      weighted({ type: 'IncreaseLowestSetProgressiveOverload', amount: amount('2.5'), increaseStrategy: 'middle' }),
      [loadRule('2.5', { type: 'lowestSets', pick: 'middle' })],
    ],
  ])('migrates %s', (_name, input, expected) => {
    expect(progressiveOverloadToRules(input).progression).toEqual(expected);
  });

  it.each(['first', 'middle', 'last', 'all'] as const)('carries the %s pick through verbatim', (increaseStrategy) => {
    const migrated = progressiveOverloadToRules(
      weighted({ type: 'IncreaseLowestSetProgressiveOverload', amount: amount('5'), increaseStrategy }),
    );

    expect(migrated.progression[0]!.scope).toEqual({ type: 'lowestSets', pick: increaseStrategy });
  });

  it('keeps a zero amount at zero rather than seeding the editor fallback', () => {
    const migrated = progressiveOverloadToRules(
      weighted({ type: 'IncreaseAllEvenlyProgressiveOverload', amount: amount('0') }),
    );

    expect(migrated.progression[0]!.step).toBe('0');
  });

  it('leaves every other field of the exercise alone', () => {
    const before = weighted({ type: 'IncreaseAllEvenlyProgressiveOverload', amount: amount('2.5') });
    const { progression, ...after } = progressiveOverloadToRules(before);
    const { progressiveOverload: _dropped, ...expected } = before;

    expect(after).toEqual(expected);
    expect(progression).toHaveLength(1);
  });

  it('drops the old field', () => {
    const migrated = progressiveOverloadToRules(weighted({ type: 'NoProgressiveOverload' }));

    expect(migrated).not.toHaveProperty('progressiveOverload');
  });

  it('emits no ceiling for a load rule, so nothing stops it climbing', () => {
    const migrated = progressiveOverloadToRules(
      weighted({ type: 'IncreaseAllEvenlyProgressiveOverload', amount: amount('5') }),
    );

    expect(migrated.progression[0]).not.toHaveProperty('ceiling');
    expect(migrated.progression[0]).not.toHaveProperty('onCeiling');
  });
});
