import { describe, expect, it } from 'vitest';
import BigNumber from 'bignumber.js';
import {
  applyProgression,
  IncreaseStrategy,
  Resistance,
  ProgressionRule,
  RepsTarget,
  unreachableFrom,
  WeightedExerciseBlueprint,
  withAddedRule,
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
  options: { at?: RepsTarget[]; resistance?: Resistance; weight?: number } = {},
): RecordedWeightedExercise {
  const blueprint = WeightedExerciseBlueprint.of({
    name: 'Chin Up',
    plannedSets: planned.map((reps) => ({ reps })),
    resistance: options.resistance ?? 'none',
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
    const result = applyProgression([repsRule(1)], exercise(at(10), { resistance: 'external', weight: 60 }));

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
      const result = applyProgression(stalled, exercise(at(10), { resistance: 'external', weight: 60 }));

      expect(targetsOf(result)).toEqual(at(10));
      expect(weightsOf(result)).toEqual([62.5]);
    });
  });

  describe('scope', () => {
    it('lowestSets ranks by target, not by weight', () => {
      // The heaviest set is the one asking for fewest reps, so ranking by load would pick the wrong one.
      const pyramid = exercise(at(12, 10, 8), { resistance: 'external' });
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
      exercise(at(8, 8), { at: targets, resistance: 'external', weight });

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

  /**
   * A banded target with a load rule is already a double progression, since a set only counts as
   * successful at the top of its band. Adding an explicit reps rule on top is a second way to say the
   * same thing, and these pin which one wins.
   */
  describe('a band and a reps rule together', () => {
    const banded = (target: RepsTarget) =>
      new RecordedWeightedExercise(
        WeightedExerciseBlueprint.of({ plannedSets: [{ reps: target }], resistance: 'external' }),
        [emptyPotentialSet(new Weight(60, 'kilograms'), target)],
        undefined,
      );

    it('lets the reps rule shift the band while it has room, leaving the bar alone', () => {
      const result = applyProgression(
        [repsRule(1, { ceiling: 15, onCeiling: 'reset' }), ProgressionRule.load(bn(2.5))],
        banded({ min: 8, max: 12 }),
      );

      expect(targetsOf(result)).toEqual([{ min: 9, max: 13 }]);
      expect(weightsOf(result)).toEqual([60]);
    });

    it('contributes nothing when its ceiling is the band top the plan already asks for', () => {
      // The reps rule is exhausted before it ever fires, so the band behaves exactly as it does
      // without one: the bar goes up and the reset puts the band back where it started.
      const result = applyProgression(
        [repsRule(1, { ceiling: 12, onCeiling: 'reset' }), ProgressionRule.load(bn(2.5))],
        banded({ min: 8, max: 12 }),
      );

      expect(targetsOf(result)).toEqual([{ min: 8, max: 12 }]);
      expect(weightsOf(result)).toEqual([62.5]);
    });
  });

  describe('unreachableFrom', () => {
    const load = ProgressionRule.load(bn(2.5));

    it('has nothing unreachable in an empty list', () => {
      expect(unreachableFrom([], true)).toBeUndefined();
    });

    it('has nothing unreachable when the only rule never runs out', () => {
      expect(unreachableFrom([load], true)).toBeUndefined();
      expect(unreachableFrom([repsRule(1)], true)).toBeUndefined();
    });

    it('reports everything behind a load rule', () => {
      expect(unreachableFrom([load, repsRule(1, { ceiling: 12 })], true)).toBe(1);
    });

    it('reports everything behind an unbounded reps rule', () => {
      expect(unreachableFrom([repsRule(1), load], true)).toBe(1);
    });

    it('reports a double-progression ladder as fully reachable', () => {
      expect(unreachableFrom([repsRule(1, { ceiling: 12, onCeiling: 'reset' }), load], true)).toBeUndefined();
    });

    it('lets a load rule hand over on an exercise carrying no load', () => {
      expect(unreachableFrom([load, repsRule(1, { ceiling: 12 })], false)).toBeUndefined();
    });

    it('reports from the first blocker, not the last', () => {
      expect(unreachableFrom([load, load, load], true)).toBe(1);
    });
  });

  describe('withAddedRule', () => {
    const load = ProgressionRule.load(bn(2.5));
    const blueprint = (progression: ProgressionRule[], init: { reps?: number; resistance?: Resistance } = {}) =>
      WeightedExerciseBlueprint.of({
        plannedSets: at(init.reps ?? 8, init.reps ?? 8).map((reps) => ({ reps })),
        resistance: init.resistance ?? 'external',
        progression,
      });

    it('starts a load exercise off on the bar', () => {
      const [added, ...rest] = withAddedRule(blueprint([]));

      expect(rest).toEqual([]);
      expect(added?.axis).toBe('load');
      expect(added?.step.toNumber()).toBe(2.5);
    });

    it('starts an exercise carrying no load off on reps', () => {
      const [added] = withAddedRule(blueprint([], { resistance: 'none' }));

      expect(added?.axis).toBe('reps');
      expect(added?.ceiling).toBeUndefined();
    });

    it('gives an unbounded reps rule somewhere to stop before adding behind it', () => {
      const [ladderRung, added] = withAddedRule(blueprint([repsRule(1)]));

      expect(ladderRung?.ceiling?.toNumber()).toBe(12);
      expect(ladderRung?.onCeiling).toBe('reset');
      expect(added?.axis).toBe('load');
    });

    it('pitches the ceiling above where the plan starts, not at a fixed rung', () => {
      const [ladderRung] = withAddedRule(blueprint([repsRule(1)], { reps: 15 }));

      expect(ladderRung?.ceiling?.toNumber()).toBe(19);
    });

    it('slots a rung in front of a load rule rather than behind it', () => {
      const chain = withAddedRule(blueprint([load]));

      expect(chain.map((rule) => rule.axis)).toEqual(['reps', 'load']);
      expect(chain[0]?.ceiling?.toNumber()).toBe(12);
      expect(chain[1]).toBe(load);
    });

    it('appends behind a load rule that can never fire anyway', () => {
      const chain = withAddedRule(blueprint([load], { resistance: 'none' }));

      expect(chain.map((rule) => rule.axis)).toEqual(['load', 'reps']);
    });

    it('leaves a reps rule that already stops alone', () => {
      const bounded = repsRule(1, { ceiling: 12, onCeiling: 'reset' });
      const chain = withAddedRule(blueprint([bounded]));

      expect(chain[0]).toBe(bounded);
      expect(chain[1]?.axis).toBe('load');
    });

    it('never builds a chain with an unreachable rule in it', () => {
      const chains = [[], [load], [repsRule(1)], [repsRule(1, { ceiling: 12 }), load]];

      for (const start of chains) {
        const chain = withAddedRule(blueprint(start));
        expect(unreachableFrom(chain, true)).toBeUndefined();
      }
    });
  });
});
