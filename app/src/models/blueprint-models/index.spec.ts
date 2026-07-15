import { describe, expect, it } from 'vitest';
import BigNumber from 'bignumber.js';
import { Duration } from '@js-joda/core';
import {
  CardioExerciseBlueprint,
  CardioExerciseSetBlueprint,
  IncreaseAllEvenlyProgressiveOverload,
  IncreaseLowestSetProgressiveOverload,
  KeyedExerciseBlueprint,
  NoProgressiveOverload,
  NormalizedName,
  WeightedExerciseBlueprint,
  cardioTargetEquals,
} from '@/models/blueprint-models';
import { PotentialSet, RecordedWeightedExercise } from '@/models/session-models';
import { Weight } from '@/models/weight';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function bn(n: number) {
  return new BigNumber(n);
}

function kg(n: number): Weight {
  return new Weight(n, 'kilograms');
}

/**
 * Build a RecordedWeightedExercise whose sets have the given weights (kg).
 * No sets are recorded (all potential).
 */
function exerciseWithWeights(...weights: number[]): RecordedWeightedExercise {
  const blueprint = WeightedExerciseBlueprint.empty().with({
    sets: weights.length,
  });
  const potentialSets = weights.map((w) => new PotentialSet(undefined, kg(w)));
  return new RecordedWeightedExercise(blueprint, potentialSets, undefined);
}

describe('blueprint models', () => {
  // ---------------------------------------------------------------------------
  // NoProgressiveOverload
  // ---------------------------------------------------------------------------

  describe('NoProgressiveOverload', () => {
    it('returns the exercise unchanged', () => {
      const ex = exerciseWithWeights(60, 70, 80);
      const result = new NoProgressiveOverload().applyProgressiveOverload(ex);
      expect(result).toBe(ex);
    });

    it('equals only another NoProgressiveOverload', () => {
      const npo = new NoProgressiveOverload();
      expect(npo.equals(new NoProgressiveOverload())).toBe(true);
      expect(npo.equals(new IncreaseAllEvenlyProgressiveOverload(bn(2.5)))).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // IncreaseAllEvenlyProgressiveOverload
  // ---------------------------------------------------------------------------

  describe('IncreaseAllEvenlyProgressiveOverload', () => {
    it('increases every set by the given amount', () => {
      const ex = exerciseWithWeights(60, 70, 80);
      const result = new IncreaseAllEvenlyProgressiveOverload(bn(5)).applyProgressiveOverload(ex);

      expect(result.potentialSets.map((s) => s.weight.value)).toEqual([bn(65), bn(75), bn(85)]);
    });

    it('works with a fractional increment', () => {
      const ex = exerciseWithWeights(100);
      const result = new IncreaseAllEvenlyProgressiveOverload(bn(2.5)).applyProgressiveOverload(ex);

      expect(result.potentialSets[0]!.weight.value).toEqual(bn(102.5));
    });

    it('weightIncrement falls back to 2.5 when amount is zero', () => {
      const po = new IncreaseAllEvenlyProgressiveOverload(bn(0));
      expect(po.weightIncrement.toNumber()).toBe(2.5);
    });

    it('weightIncrement returns amount when non-zero', () => {
      const po = new IncreaseAllEvenlyProgressiveOverload(bn(5));
      expect(po.weightIncrement.toNumber()).toBe(5);
    });
  });

  // ---------------------------------------------------------------------------
  // IncreaseLowestSetProgressiveOverload — shared setup
  // ---------------------------------------------------------------------------

  /**
   * Sets: [60, 80, 60, 70, 60]  — indices 0, 2, 4 are the lowest (60 kg).
   * Useful for testing which of the lowest sets is selected.
   */
  function mixedExercise() {
    return exerciseWithWeights(60, 80, 60, 70, 60);
  }

  describe('IncreaseLowestSetProgressiveOverload — strategy: all', () => {
    it('increases every set that matches the lowest weight', () => {
      const result = new IncreaseLowestSetProgressiveOverload(bn(5), 'all').applyProgressiveOverload(mixedExercise());

      const weights = result.potentialSets.map((s) => s.weight.value);
      expect(weights).toEqual([bn(65), bn(80), bn(65), bn(70), bn(65)]);
    });

    it('leaves non-lowest sets untouched', () => {
      const result = new IncreaseLowestSetProgressiveOverload(bn(5), 'all').applyProgressiveOverload(mixedExercise());

      expect(result.potentialSets[1]!.weight.value).toEqual(bn(80));
      expect(result.potentialSets[3]!.weight.value).toEqual(bn(70));
    });

    it('handles a uniform exercise (all sets same weight)', () => {
      const ex = exerciseWithWeights(50, 50, 50);
      const result = new IncreaseLowestSetProgressiveOverload(bn(2.5), 'all').applyProgressiveOverload(ex);

      expect(result.potentialSets.map((s) => s.weight.value)).toEqual([bn(52.5), bn(52.5), bn(52.5)]);
    });
  });

  describe('IncreaseLowestSetProgressiveOverload — strategy: first', () => {
    it('increases only the first set matching the lowest weight', () => {
      // lowest sets are at indices 0, 2, 4 — first is index 0
      const result = new IncreaseLowestSetProgressiveOverload(bn(5), 'first').applyProgressiveOverload(mixedExercise());

      const weights = result.potentialSets.map((s) => s.weight.value);
      expect(weights).toEqual([bn(65), bn(80), bn(60), bn(70), bn(60)]);
    });

    it('does not touch any other lowest set', () => {
      const result = new IncreaseLowestSetProgressiveOverload(bn(5), 'first').applyProgressiveOverload(mixedExercise());

      expect(result.potentialSets[2]!.weight.value).toEqual(bn(60));
      expect(result.potentialSets[4]!.weight.value).toEqual(bn(60));
    });
  });

  describe('IncreaseLowestSetProgressiveOverload — strategy: last', () => {
    it('increases only the last set matching the lowest weight', () => {
      // lowest sets are at indices 0, 2, 4 — last is index 4
      const result = new IncreaseLowestSetProgressiveOverload(bn(5), 'last').applyProgressiveOverload(mixedExercise());

      const weights = result.potentialSets.map((s) => s.weight.value);
      expect(weights).toEqual([bn(60), bn(80), bn(60), bn(70), bn(65)]);
    });

    it('does not touch the first lowest set', () => {
      const result = new IncreaseLowestSetProgressiveOverload(bn(5), 'last').applyProgressiveOverload(mixedExercise());

      expect(result.potentialSets[0]!.weight.value).toEqual(bn(60));
    });
  });

  describe('IncreaseLowestSetProgressiveOverload — strategy: middle', () => {
    it('picks the lowest set closest to the centre of all sets', () => {
      // Sets: [60, 80, 60, 70, 60] — length 5, midpoint = 2.0
      // Lowest indices: 0, 2, 4. Distances from 2.0: 2, 0, 2 → index 2 wins
      const result = new IncreaseLowestSetProgressiveOverload(bn(5), 'middle').applyProgressiveOverload(
        mixedExercise(),
      );

      const weights = result.potentialSets.map((s) => s.weight.value);
      expect(weights).toEqual([bn(60), bn(80), bn(65), bn(70), bn(60)]);
    });

    it('breaks a tie towards the first equidistant candidate', () => {
      // Sets: [60, 80, 60] — length 3, midpoint = 1.0
      // Lowest indices: 0, 2. Distances: 1, 1 — tie → reduce keeps the first (index 0)
      const ex = exerciseWithWeights(60, 80, 60);
      const result = new IncreaseLowestSetProgressiveOverload(bn(5), 'middle').applyProgressiveOverload(ex);

      const weights = result.potentialSets.map((s) => s.weight.value);
      expect(weights).toEqual([bn(65), bn(80), bn(60)]);
    });

    it('handles a single lowest set with no tie possible', () => {
      // Sets: [60, 80, 80] — only one lowest set at index 0
      const ex = exerciseWithWeights(60, 80, 80);
      const result = new IncreaseLowestSetProgressiveOverload(bn(5), 'middle').applyProgressiveOverload(ex);

      expect(result.potentialSets[0]!.weight.value).toEqual(bn(65));
      expect(result.potentialSets[1]!.weight.value).toEqual(bn(80));
    });

    it('selects the single lowest set closest to the centre in an asymmetric layout', () => {
      // Sets: [80, 80, 80, 60, 60] — length 5, midpoint = 2.0
      // Lowest indices: 3, 4. Distances: 1, 2 → index 3 wins
      const ex = exerciseWithWeights(80, 80, 80, 60, 60);
      const result = new IncreaseLowestSetProgressiveOverload(bn(5), 'middle').applyProgressiveOverload(ex);

      const weights = result.potentialSets.map((s) => s.weight.value);
      expect(weights).toEqual([bn(80), bn(80), bn(80), bn(65), bn(60)]);
    });

    it('does not increase multiple sets', () => {
      const result = new IncreaseLowestSetProgressiveOverload(bn(5), 'middle').applyProgressiveOverload(
        mixedExercise(),
      );

      const increased = result.potentialSets.filter(
        (s, i) => !s.weight.value.isEqualTo(mixedExercise().potentialSets[i]!.weight.value),
      );
      expect(increased).toHaveLength(1);
    });
  });

  describe('IncreaseLowestSetProgressiveOverload — empty / single set edge cases', () => {
    it('returns exercise unchanged when there are no sets', () => {
      const blueprint = WeightedExerciseBlueprint.empty().with({ sets: 0 });
      const ex = new RecordedWeightedExercise(blueprint, [], undefined);
      const result = new IncreaseLowestSetProgressiveOverload(bn(5), 'all').applyProgressiveOverload(ex);
      expect(result).toBe(ex);
    });

    it('handles a single set correctly for every strategy', () => {
      const strategies = ['all', 'first', 'last', 'middle'] as const;
      for (const strategy of strategies) {
        const ex = exerciseWithWeights(100);
        const result = new IncreaseLowestSetProgressiveOverload(bn(5), strategy).applyProgressiveOverload(ex);
        expect(result.potentialSets[0]!.weight.value).toEqual(bn(105));
      }
    });

    it('weightIncrement falls back to 2.5 when amount is zero', () => {
      const po = new IncreaseLowestSetProgressiveOverload(bn(0), 'all');
      expect(po.weightIncrement.toNumber()).toBe(2.5);
    });
  });

  // ---------------------------------------------------------------------------
  // toType conversions
  // ---------------------------------------------------------------------------

  describe('toType conversions', () => {
    it('NoProgressiveOverload → IncreaseAllEvenly seeds with 2.5', () => {
      const result = new NoProgressiveOverload().toType('IncreaseAllEvenlyProgressiveOverload');
      expect(result).toBeInstanceOf(IncreaseAllEvenlyProgressiveOverload);
      expect((result as IncreaseAllEvenlyProgressiveOverload).amount.toNumber()).toBe(2.5);
    });

    it('IncreaseAllEvenly → IncreaseLowestSet preserves amount', () => {
      const result = new IncreaseAllEvenlyProgressiveOverload(bn(10)).toType('IncreaseLowestSetProgressiveOverload');
      expect(result).toBeInstanceOf(IncreaseLowestSetProgressiveOverload);
      expect((result as IncreaseLowestSetProgressiveOverload).amount.toNumber()).toBe(10);
    });

    it('IncreaseLowestSet → IncreaseAllEvenly preserves amount', () => {
      const result = new IncreaseLowestSetProgressiveOverload(bn(7.5), 'first').toType(
        'IncreaseAllEvenlyProgressiveOverload',
      );
      expect(result).toBeInstanceOf(IncreaseAllEvenlyProgressiveOverload);
      expect((result as IncreaseAllEvenlyProgressiveOverload).amount.toNumber()).toBe(7.5);
    });

    it('toType with same type returns self', () => {
      const npo = new NoProgressiveOverload();
      expect(npo.toType('NoProgressiveOverload')).toBe(npo);

      const iae = new IncreaseAllEvenlyProgressiveOverload(bn(5));
      expect(iae.toType('IncreaseAllEvenlyProgressiveOverload')).toBe(iae);

      const ils = new IncreaseLowestSetProgressiveOverload(bn(5), 'all');
      expect(ils.toType('IncreaseLowestSetProgressiveOverload')).toBe(ils);
    });
  });

  // ---------------------------------------------------------------------------
  // NormalizedName
  // ---------------------------------------------------------------------------

  describe('NormalizedName', () => {
    it('lowercases and trims', () => {
      expect(new NormalizedName('  Bench Press  ').toString()).toBe('bench pres');
    });

    it('strips trailing "s"', () => {
      expect(new NormalizedName('curls').toString()).toBe('curl');
    });

    it('strips trailing "es"', () => {
      expect(new NormalizedName('lunges').toString()).toBe('lung');
    });

    it('normalises "flies" → "flys" then strips the s', () => {
      expect(new NormalizedName('flies').toString()).toBe('fly');
    });

    it('normalises "flyes" → "flys" then strips the s', () => {
      expect(new NormalizedName('Dumbbell Flyes').toString()).toBe('dumbbell fly');
    });

    it('treats "Dumbbell Flies" and "Dumbbell Flyes" as equal', () => {
      const a = new NormalizedName('Dumbbell Flies');
      const b = new NormalizedName('Dumbbell Flyes');
      expect(a.equals(b)).toBe(true);
    });

    it('treats differently-cased names as equal', () => {
      expect(new NormalizedName('Squat').equals(new NormalizedName('squat'))).toBe(true);
    });

    it('returns empty string for undefined/empty input', () => {
      expect(new NormalizedName('').toString()).toBe('');
    });
  });

  // ---------------------------------------------------------------------------
  // cardioTargetEquals
  // ---------------------------------------------------------------------------

  describe('cardioTargetEquals', () => {
    it('two equal time targets are equal', () => {
      expect(
        cardioTargetEquals(
          { type: 'time', value: Duration.ofMinutes(30) },
          { type: 'time', value: Duration.ofMinutes(30) },
        ),
      ).toBe(true);
    });

    it('different time durations are not equal', () => {
      expect(
        cardioTargetEquals(
          { type: 'time', value: Duration.ofMinutes(20) },
          { type: 'time', value: Duration.ofMinutes(30) },
        ),
      ).toBe(false);
    });

    it('two equal distance targets are equal', () => {
      expect(
        cardioTargetEquals(
          { type: 'distance', value: { value: bn(5), unit: 'kilometre' } },
          { type: 'distance', value: { value: bn(5), unit: 'kilometre' } },
        ),
      ).toBe(true);
    });

    it('same distance value but different units are not equal', () => {
      expect(
        cardioTargetEquals(
          { type: 'distance', value: { value: bn(5), unit: 'kilometre' } },
          { type: 'distance', value: { value: bn(5), unit: 'mile' } },
        ),
      ).toBe(false);
    });

    it('different types are not equal', () => {
      expect(
        cardioTargetEquals(
          { type: 'time', value: Duration.ofMinutes(30) },
          { type: 'distance', value: { value: bn(5), unit: 'kilometre' } },
        ),
      ).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // KeyedExerciseBlueprint
  // ---------------------------------------------------------------------------

  describe('KeyedExerciseBlueprint', () => {
    it('weighted exercise key encodes sets and repsPerSet', () => {
      const blueprint = WeightedExerciseBlueprint.empty().with({
        name: 'Squat',
        sets: 4,
        repsConfig: { type: 'fixed', reps: 8 },
      });
      const key = KeyedExerciseBlueprint.fromExerciseBlueprint(blueprint);
      expect(key.toString()).toBe('Squat_4_8');
    });

    it('two weighted blueprints with same name but different sets produce different keys', () => {
      const a = KeyedExerciseBlueprint.fromExerciseBlueprint(
        WeightedExerciseBlueprint.empty().with({
          name: 'Press',
          sets: 3,
          repsConfig: { type: 'fixed', reps: 10 },
        }),
      );
      const b = KeyedExerciseBlueprint.fromExerciseBlueprint(
        WeightedExerciseBlueprint.empty().with({
          name: 'Press',
          sets: 5,
          repsConfig: { type: 'fixed', reps: 10 },
        }),
      );
      expect(a.toString()).not.toBe(b.toString());
    });

    it('cardio exercise key encodes the target type of the first set', () => {
      const blueprint = CardioExerciseBlueprint.empty();
      // default first set target is 'time'
      const key = KeyedExerciseBlueprint.fromExerciseBlueprint(blueprint);
      expect(key.toString()).toContain('time');
    });

    it('cardio exercise key encodes distance when first set has a distance target', () => {
      const set = CardioExerciseSetBlueprint.empty().with({
        target: {
          type: 'distance',
          value: { value: bn(5), unit: 'kilometre' },
        },
      });
      const blueprint = new CardioExerciseBlueprint('Run', [set], '', '');
      const key = KeyedExerciseBlueprint.fromExerciseBlueprint(blueprint);
      expect(key.toString()).toContain('distance');
    });
  });
});

describe('WeightedExerciseBlueprint rep schemes', () => {
  const fixed = WeightedExerciseBlueprint.empty().with({ sets: 3, repsConfig: { type: 'fixed', reps: 10 } });
  const range = fixed.with({ repsConfig: { type: 'range', min: 10, max: 12 } });
  const pyramid = fixed.with({
    repsConfig: {
      type: 'perSet',
      targets: [
        { min: 12, max: 12 },
        { min: 10, max: 10 },
        { min: 8, max: 8 },
      ],
    },
  });

  it('resolves a fixed target to min === max', () => {
    expect(fixed.repsTargetForSet(0)).toEqual({ min: 10, max: 10 });
  });

  it('resolves a uniform range for every set', () => {
    expect(range.repsTargetForSet(0)).toEqual({ min: 10, max: 12 });
    expect(range.repsTargetForSet(2)).toEqual({ min: 10, max: 12 });
  });

  it('resolves per-set targets for a pyramid', () => {
    expect(pyramid.repsTargetForSet(0)).toEqual({ min: 12, max: 12 });
    expect(pyramid.repsTargetForSet(2)).toEqual({ min: 8, max: 8 });
  });

  it('falls back to the last target when the index runs past a short pyramid', () => {
    expect(pyramid.repsTargetForSet(5)).toEqual({ min: 8, max: 8 });
  });

  it('round-trips ranges and pyramids through JSON', () => {
    expect(WeightedExerciseBlueprint.fromJSON(range.toJSON()).equals(range)).toBe(true);
    expect(WeightedExerciseBlueprint.fromJSON(pyramid.toJSON()).equals(pyramid)).toBe(true);
  });
});
