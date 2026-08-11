import { describe, expect, it } from 'vitest';
import BigNumber from 'bignumber.js';
import {
  applyProgression,
  IncreaseStrategy,
  LoadBasis,
  ProgressionRule,
  RepsTarget,
  WeightedExerciseBlueprint,
} from '@/models/blueprint-models';
import { RecordedWeightedExercise } from '@/models/session-models';
import { Weight } from '@/models/weight';
import { emptyPotentialSet } from '@/models/session-models/__test__/helpers';

const bn = (n: number) => new BigNumber(n);

function repsRule(
  step: number,
  init: { ceiling?: number; onCeiling?: 'reset'; pick?: IncreaseStrategy } = {},
): ProgressionRule {
  return ProgressionRule.of({
    axis: 'reps',
    step: bn(step),
    scope: init.pick ? { type: 'lowestSets', pick: init.pick } : { type: 'allSets' },
    ceiling: init.ceiling === undefined ? undefined : bn(init.ceiling),
    onCeiling: init.onCeiling,
  });
}

/** An exercise sitting on the targets it is currently chasing, which need not be the plan's. */
function exercise(
  planned: RepsTarget[],
  options: { at?: RepsTarget[]; loadBasis?: LoadBasis; weight?: number } = {},
): RecordedWeightedExercise {
  const blueprint = WeightedExerciseBlueprint.of({
    name: 'Chin Up',
    plannedSets: planned.map((reps) => ({ reps })),
    loadBasis: options.loadBasis ?? 'none',
  });
  const targets = options.at ?? planned;
  return new RecordedWeightedExercise(
    blueprint,
    targets.map((target) => emptyPotentialSet(new Weight(options.weight ?? 0, 'kilograms'), target)),
    undefined,
  );
}

const at = (...values: number[]): RepsTarget[] => values.map((v) => ({ min: v, max: v }));
const targetsOf = (ex: RecordedWeightedExercise) => ex.potentialSets.map((s) => s.target);
const weightsOf = (ex: RecordedWeightedExercise) => ex.potentialSets.map((s) => s.weight.value.toNumber());

describe('reps progression', () => {
  it('raises every set by the step', () => {
    const result = applyProgression([repsRule(1)], exercise(at(15, 15, 15)));

    expect(targetsOf(result)).toEqual(at(16, 16, 16));
  });

  it('climbs from where the lineage got to, not from what the plan says', () => {
    const result = applyProgression([repsRule(1)], exercise(at(15), { at: at(22) }));

    expect(targetsOf(result)).toEqual(at(23));
  });

  it('carries a whole band up, keeping its width', () => {
    const result = applyProgression([repsRule(2)], exercise([{ min: 8, max: 12 }]));

    expect(targetsOf(result)).toEqual([{ min: 10, max: 14 }]);
  });

  it('moves nothing on an exercise with no sets', () => {
    const setless = exercise([]);

    expect(applyProgression([repsRule(1)], setless)).toBe(setless);
  });

  it('leaves the load alone', () => {
    const result = applyProgression([repsRule(1)], exercise(at(10), { loadBasis: 'external', weight: 60 }));

    expect(weightsOf(result)).toEqual([60]);
  });

  describe('ceiling', () => {
    it('stops exactly at the ceiling rather than overshooting it', () => {
      const result = applyProgression([repsRule(5, { ceiling: 12 })], exercise(at(10)));

      expect(targetsOf(result)).toEqual(at(12));
    });

    it('takes a partial step so the band still keeps its width', () => {
      const result = applyProgression([repsRule(5, { ceiling: 12 })], exercise([{ min: 6, max: 10 }]));

      expect(targetsOf(result)).toEqual([{ min: 8, max: 12 }]);
    });

    it('cannot move once the top of the band sits on the ceiling', () => {
      const capped = exercise(at(12));

      expect(applyProgression([repsRule(1, { ceiling: 12 })], capped)).toBe(capped);
    });

    it('climbs without limit when no ceiling is set', () => {
      const result = applyProgression([repsRule(1)], exercise(at(99)));

      expect(targetsOf(result)).toEqual(at(100));
    });
  });

  describe('whole reps only', () => {
    it('rounds a fractional step down rather than asking for half a repetition', () => {
      const result = applyProgression([repsRule(1.5)], exercise(at(10)));

      expect(targetsOf(result)).toEqual(at(11));
    });

    it('lands on a whole rep under a fractional ceiling', () => {
      const result = applyProgression([repsRule(5, { ceiling: 12.5 })], exercise(at(10)));

      expect(targetsOf(result)).toEqual(at(12));
    });

    it('hands the move on when the step rounds away to nothing', () => {
      const stalled = [repsRule(0.5), ProgressionRule.load(bn(2.5))];
      const result = applyProgression(stalled, exercise(at(10), { loadBasis: 'external', weight: 60 }));

      expect(targetsOf(result)).toEqual(at(10));
      expect(weightsOf(result)).toEqual([62.5]);
    });
  });

  describe('scope', () => {
    it('lowestSets ranks by target, not by weight', () => {
      // The heaviest set is the one asking for fewest reps, so ranking by load would pick the wrong one.
      const pyramid = exercise(at(12, 10, 8), { loadBasis: 'external' });
      const withWeights = pyramid.with({
        potentialSets: pyramid.potentialSets.map((s, i) =>
          s.with({ weight: new Weight([60, 70, 80][i]!, 'kilograms') }),
        ),
      });

      const result = applyProgression([repsRule(1, { pick: 'all' })], withWeights);

      expect(targetsOf(result)).toEqual(at(12, 10, 9));
    });

    it('raises every set tied for the lowest target', () => {
      const result = applyProgression([repsRule(1, { pick: 'all' })], exercise(at(8, 12, 8)));

      expect(targetsOf(result)).toEqual(at(9, 12, 9));
    });

    it.each([
      ['first', at(9, 12, 8)],
      ['last', at(8, 12, 9)],
      ['middle', at(9, 12, 8)],
    ] as [IncreaseStrategy, RepsTarget[]][])('pick %s raises one of the tied lowest sets', (pick, expected) => {
      expect(targetsOf(applyProgression([repsRule(1, { pick })], exercise(at(8, 12, 8))))).toEqual(expected);
    });
  });

  describe('double progression', () => {
    const ladder = [repsRule(1, { ceiling: 12, onCeiling: 'reset' }), ProgressionRule.load(bn(2.5))];
    const chinUp = (targets: RepsTarget[], weight: number) =>
      exercise(at(8, 8), { at: targets, loadBasis: 'external', weight });

    it('climbs the reps while there is room, leaving the bar alone', () => {
      const result = applyProgression(ladder, chinUp(at(8, 8), 60));

      expect(targetsOf(result)).toEqual(at(9, 9));
      expect(weightsOf(result)).toEqual([60, 60]);
    });

    it('hands over to the load rule at the ceiling and drops back to the plan', () => {
      const result = applyProgression(ladder, chinUp(at(12, 12), 60));

      expect(weightsOf(result)).toEqual([62.5, 62.5]);
      expect(targetsOf(result)).toEqual(at(8, 8));
    });

    it('walks the whole ladder and starts the next rung', () => {
      const walked = Array.from({ length: 6 }).reduce<RecordedWeightedExercise>(
        (ex) => applyProgression(ladder, ex),
        chinUp(at(8, 8), 60),
      );

      // 8 → 9 → 10 → 11 → 12, then the bar goes up and the reps reset, then 8 → 9 again.
      expect(weightsOf(walked)).toEqual([62.5, 62.5]);
      expect(targetsOf(walked)).toEqual(at(9, 9));
    });

    it('does not reset a rule that never asked to', () => {
      const noReset = [repsRule(1, { ceiling: 12 }), ProgressionRule.load(bn(2.5))];
      const result = applyProgression(noReset, chinUp(at(12, 12), 60));

      expect(weightsOf(result)).toEqual([62.5, 62.5]);
      expect(targetsOf(result)).toEqual(at(12, 12));
    });

    it('resets only when a later rule actually fires', () => {
      // Load cannot move on an exercise carrying none, so the exhausted reps rule stays put.
      const result = applyProgression(ladder, exercise(at(8), { at: at(12) }));

      expect(targetsOf(result)).toEqual(at(12));
    });

    it('runs the reps rule first even when the load rule could also move', () => {
      const result = applyProgression(ladder, chinUp(at(8, 8), 60));

      expect(weightsOf(result)).toEqual([60, 60]);
    });
  });
});
