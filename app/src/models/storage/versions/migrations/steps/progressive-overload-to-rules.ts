/** Structurally the wire's branded decimal string, redeclared so the step imports no live types. */
type BigNumberString = string & { _BRAND: 'BigNumber' };

type IncreaseStrategy = 'first' | 'middle' | 'last' | 'all';

type ProgressiveOverload =
  | { type: 'NoProgressiveOverload' }
  | { type: 'IncreaseAllEvenlyProgressiveOverload'; amount: BigNumberString }
  | {
      type: 'IncreaseLowestSetProgressiveOverload';
      amount: BigNumberString;
      increaseStrategy: IncreaseStrategy;
    };

type SetScope = { type: 'allSets' } | { type: 'lowestSets'; pick: IncreaseStrategy };

interface ProgressionRule {
  axis: 'reps' | 'load';
  step: BigNumberString;
  scope: SetScope;
  ceiling?: BigNumberString;
  onCeiling?: 'reset';
  trigger: 'allSetsMetTarget';
}

interface Input {
  progressiveOverload: ProgressiveOverload;
}

/**
 * Replaces the three-class progressive overload union with an ordered list of rules. Each of the old
 * classes was one move along the load axis, so each becomes a single-rule list and no exercise
 * changes what it does next session.
 */
export function progressiveOverloadToRules<T extends Input>(ex: T) {
  const { progressiveOverload, ...rest } = ex;
  return { ...rest, progression: rulesFor(progressiveOverload) };
}

function rulesFor(progressiveOverload: ProgressiveOverload): ProgressionRule[] {
  switch (progressiveOverload.type) {
    case 'NoProgressiveOverload':
      return [];
    case 'IncreaseAllEvenlyProgressiveOverload':
      return [loadRule(progressiveOverload.amount, { type: 'allSets' })];
    case 'IncreaseLowestSetProgressiveOverload':
      return [
        loadRule(progressiveOverload.amount, {
          type: 'lowestSets',
          pick: progressiveOverload.increaseStrategy,
        }),
      ];
  }
}

// A zero amount stays zero. The 2.5 the editor falls back to is what it offers as a next value, not
// what the exercise was doing, and moving it into the data would start progressing exercises that
// were standing still.
function loadRule(step: BigNumberString, scope: SetScope): ProgressionRule {
  return { axis: 'load', step, scope, trigger: 'allSetsMetTarget' };
}
