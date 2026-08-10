import { describe, expect, it } from 'vitest';
import BigNumber from 'bignumber.js';
import { Duration } from '@js-joda/core';
import {
  CardioExerciseBlueprint,
  CardioExerciseSetBlueprint,
  IncreaseAllEvenlyProgressiveOverload,
  IncreaseLowestSetProgressiveOverload,
  NoProgressiveOverload,
  normalizeExerciseName,
  RepsConfig,
  WeightedExerciseBlueprint,
  cardioTargetEquals,
} from '@/models/blueprint-models';
import { RecordedWeightedExercise } from '@/models/session-models';
import { Weight } from '@/models/weight';
import { emptyPotentialSet } from '@/models/session-models/__test__/helpers';

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
  const potentialSets = weights.map((w) => emptyPotentialSet(kg(w)));
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
  // IncreaseLowestSetProgressiveOverload - shared setup
  // ---------------------------------------------------------------------------

  /**
   * Sets: [60, 80, 60, 70, 60]  - indices 0, 2, 4 are the lowest (60 kg).
   * Useful for testing which of the lowest sets is selected.
   */
  function mixedExercise() {
    return exerciseWithWeights(60, 80, 60, 70, 60);
  }

  describe('IncreaseLowestSetProgressiveOverload - strategy: all', () => {
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

  describe('IncreaseLowestSetProgressiveOverload - strategy: first', () => {
    it('increases only the first set matching the lowest weight', () => {
      // lowest sets are at indices 0, 2, 4 - first is index 0
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

  describe('IncreaseLowestSetProgressiveOverload - strategy: last', () => {
    it('increases only the last set matching the lowest weight', () => {
      // lowest sets are at indices 0, 2, 4 - last is index 4
      const result = new IncreaseLowestSetProgressiveOverload(bn(5), 'last').applyProgressiveOverload(mixedExercise());

      const weights = result.potentialSets.map((s) => s.weight.value);
      expect(weights).toEqual([bn(60), bn(80), bn(60), bn(70), bn(65)]);
    });

    it('does not touch the first lowest set', () => {
      const result = new IncreaseLowestSetProgressiveOverload(bn(5), 'last').applyProgressiveOverload(mixedExercise());

      expect(result.potentialSets[0]!.weight.value).toEqual(bn(60));
    });
  });

  describe('IncreaseLowestSetProgressiveOverload - strategy: middle', () => {
    it('picks the lowest set closest to the centre of all sets', () => {
      // Sets: [60, 80, 60, 70, 60] - length 5, midpoint = 2.0
      // Lowest indices: 0, 2, 4. Distances from 2.0: 2, 0, 2 → index 2 wins
      const result = new IncreaseLowestSetProgressiveOverload(bn(5), 'middle').applyProgressiveOverload(
        mixedExercise(),
      );

      const weights = result.potentialSets.map((s) => s.weight.value);
      expect(weights).toEqual([bn(60), bn(80), bn(65), bn(70), bn(60)]);
    });

    it('breaks a tie towards the first equidistant candidate', () => {
      // Sets: [60, 80, 60] - length 3, midpoint = 1.0
      // Lowest indices: 0, 2. Distances: 1, 1 - tie → reduce keeps the first (index 0)
      const ex = exerciseWithWeights(60, 80, 60);
      const result = new IncreaseLowestSetProgressiveOverload(bn(5), 'middle').applyProgressiveOverload(ex);

      const weights = result.potentialSets.map((s) => s.weight.value);
      expect(weights).toEqual([bn(65), bn(80), bn(60)]);
    });

    it('handles a single lowest set with no tie possible', () => {
      // Sets: [60, 80, 80] - only one lowest set at index 0
      const ex = exerciseWithWeights(60, 80, 80);
      const result = new IncreaseLowestSetProgressiveOverload(bn(5), 'middle').applyProgressiveOverload(ex);

      expect(result.potentialSets[0]!.weight.value).toEqual(bn(65));
      expect(result.potentialSets[1]!.weight.value).toEqual(bn(80));
    });

    it('selects the single lowest set closest to the centre in an asymmetric layout', () => {
      // Sets: [80, 80, 80, 60, 60] - length 5, midpoint = 2.0
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

  describe('IncreaseLowestSetProgressiveOverload - empty / single set edge cases', () => {
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
  // normalizeExerciseName
  // ---------------------------------------------------------------------------

  describe('normalizeExerciseName', () => {
    it('lowercases and trims', () => {
      expect(normalizeExerciseName('  Bench Press  ')).toBe('bench pres');
    });

    it('strips trailing "s"', () => {
      expect(normalizeExerciseName('curls')).toBe('curl');
    });

    it('strips trailing "es"', () => {
      expect(normalizeExerciseName('lunges')).toBe('lung');
    });

    it('normalises "flies" → "flys" then strips the s', () => {
      expect(normalizeExerciseName('flies')).toBe('fly');
    });

    it('normalises "flyes" → "flys" then strips the s', () => {
      expect(normalizeExerciseName('Dumbbell Flyes')).toBe('dumbbell fly');
    });

    it('treats "Dumbbell Flies" and "Dumbbell Flyes" as equal', () => {
      expect(normalizeExerciseName('Dumbbell Flies')).toBe(normalizeExerciseName('Dumbbell Flyes'));
    });

    it('treats differently-cased names as equal', () => {
      expect(normalizeExerciseName('Squat')).toBe(normalizeExerciseName('squat'));
    });

    it('returns empty string for undefined/empty input', () => {
      expect(normalizeExerciseName('')).toBe('');
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
  // progressionKey
  // ---------------------------------------------------------------------------

  describe('progressionKey', () => {
    it('weighted exercise key encodes sets and repsPerSet', () => {
      const blueprint = WeightedExerciseBlueprint.empty().with({
        name: 'Squat',
        sets: 4,
        repsConfig: { type: 'fixed', reps: 8 },
      });
      expect(blueprint.progressionKey()).toBe('Squat_WeightedExerciseBlueprint_4_8');
    });

    it('two weighted blueprints with same name but different sets produce different keys', () => {
      const a = WeightedExerciseBlueprint.empty().with({
        name: 'Press',
        sets: 3,
        repsConfig: { type: 'fixed', reps: 10 },
      });
      const b = WeightedExerciseBlueprint.empty().with({
        name: 'Press',
        sets: 5,
        repsConfig: { type: 'fixed', reps: 10 },
      });
      expect(a.progressionKey()).not.toBe(b.progressionKey());
    });

    it('cardio exercise key encodes the target type of the first set', () => {
      const blueprint = CardioExerciseBlueprint.empty();
      // default first set target is 'time'
      expect(blueprint.progressionKey()).toContain('time');
    });

    it('cardio exercise key encodes distance when first set has a distance target', () => {
      const set = CardioExerciseSetBlueprint.empty().with({
        target: {
          type: 'distance',
          value: { value: bn(5), unit: 'kilometre' },
        },
      });
      const blueprint = new CardioExerciseBlueprint('Run', [set], '', '');
      expect(blueprint.progressionKey()).toContain('distance');
    });
  });

  // ---------------------------------------------------------------------------
  // progressionKey - frozen table
  // ---------------------------------------------------------------------------

  describe('progressionKey - exact strings', () => {
    const cases: [label: string, config: RepsConfig, sets: number, key: string][] = [
      ['fixed', { type: 'fixed', reps: 5 }, 3, 'Squat_WeightedExerciseBlueprint_3_5'],
      ['range', { type: 'range', min: 8, max: 12 }, 4, 'Squat_WeightedExerciseBlueprint_4_8-12'],
      [
        'uniform perSet',
        {
          type: 'perSet',
          targets: [
            { min: 5, max: 5 },
            { min: 5, max: 5 },
            { min: 5, max: 5 },
          ],
        },
        3,
        'Squat_WeightedExerciseBlueprint_3_5',
      ],
      [
        'non-uniform perSet',
        {
          type: 'perSet',
          targets: [
            { min: 12, max: 12 },
            { min: 10, max: 10 },
            { min: 8, max: 8 },
          ],
        },
        3,
        'Squat_WeightedExerciseBlueprint_3_12,10,8',
      ],
      [
        'perSet with a band',
        {
          type: 'perSet',
          targets: [
            { min: 8, max: 12 },
            { min: 6, max: 10 },
          ],
        },
        2,
        'Squat_WeightedExerciseBlueprint_2_8-12,6-10',
      ],
    ];

    it.each(cases)('%s', (_label, repsConfig, sets, key) => {
      expect(WeightedExerciseBlueprint.empty().with({ name: 'Squat', sets, repsConfig }).progressionKey()).toBe(key);
    });

    it('bands in a perSet key use the same separator as a range key', () => {
      const range = WeightedExerciseBlueprint.empty().with({
        name: 'Squat',
        sets: 1,
        repsConfig: { type: 'range', min: 8, max: 12 },
      });
      const perSet = range.with({ repsConfig: { type: 'perSet', targets: [{ min: 8, max: 12 }] } });
      expect(perSet.progressionKey()).toBe(range.progressionKey());
    });

    it('a uniform perSet and the equivalent fixed config are one ladder', () => {
      // They are the same prescription authored two ways, so they progress together.
      const fixed = WeightedExerciseBlueprint.empty().with({
        name: 'Squat',
        sets: 3,
        repsConfig: { type: 'fixed', reps: 5 },
      });
      const perSet = fixed.with({
        repsConfig: {
          type: 'perSet',
          targets: [
            { min: 5, max: 5 },
            { min: 5, max: 5 },
            { min: 5, max: 5 },
          ],
        },
      });
      expect(perSet.progressionKey()).toBe(fixed.progressionKey());
    });

    it('an exercise that tracks no load keys without its rep scheme', () => {
      const crunch = WeightedExerciseBlueprint.of({ name: 'Crunch', sets: 3, loadBasis: 'none' });
      expect(crunch.progressionKey()).toBe('Crunch_WeightedExerciseBlueprint_3');
      expect(crunch.with({ repsConfig: { type: 'fixed', reps: 25 } }).progressionKey()).toBe(crunch.progressionKey());
      expect(crunch.withSets(4).progressionKey()).not.toBe(crunch.progressionKey());
    });
  });

  // ---------------------------------------------------------------------------
  // movementKey vs progressionKey
  // ---------------------------------------------------------------------------

  describe('movementKey vs progressionKey', () => {
    const fiveByFive = WeightedExerciseBlueprint.empty().with({
      name: 'Squats',
      sets: 5,
      repsConfig: { type: 'fixed', reps: 5 },
    });
    const threeByEight = fiveByFive.with({ sets: 3, repsConfig: { type: 'fixed', reps: 8 } });

    it('the same movement under two rep schemes is one movement but two progressions', () => {
      expect(fiveByFive.movementKey()).toBe(threeByEight.movementKey());
      expect(fiveByFive.progressionKey()).not.toBe(threeByEight.progressionKey());
    });

    it('a differently-spelled name is the same movement but a different progression', () => {
      const singular = fiveByFive.with({ name: 'Squat' });
      expect(singular.movementKey()).toBe(fiveByFive.movementKey());
      expect(singular.progressionKey()).not.toBe(fiveByFive.progressionKey());
    });

    it('a recorded exercise keys the same as the blueprint it was built from', () => {
      const recorded = RecordedWeightedExercise.empty(fiveByFive, 'kilograms');
      expect(recorded.movementKey()).toBe(fiveByFive.movementKey());
      expect(recorded.progressionKey()).toBe(fiveByFive.progressionKey());
    });

    it('a weighted and a cardio exercise of the same name are different movements', () => {
      const rowMachine = new CardioExerciseBlueprint('Row', [CardioExerciseSetBlueprint.empty()], '', '');
      const barbellRow = fiveByFive.with({ name: 'Row' });

      expect(barbellRow.movementKey()).not.toBe(rowMachine.movementKey());
      expect(barbellRow.progressionKey()).not.toBe(rowMachine.progressionKey());
      expect(normalizeExerciseName(barbellRow.name)).toBe(normalizeExerciseName(rowMachine.name));
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

  describe('with', () => {
    const targets = (b: WeightedExerciseBlueprint) => b.plannedSets.map((s) => s.reps);

    it('spreads a fixed config across the current set count', () => {
      expect(targets(fixed.with({ repsConfig: { type: 'fixed', reps: 8 } }))).toEqual(
        Array.from({ length: 3 }, () => ({ min: 8, max: 8 })),
      );
    });

    it('spreads a range across every set', () => {
      expect(targets(fixed.with({ repsConfig: { type: 'range', min: 8, max: 12 } }))).toEqual(
        Array.from({ length: 3 }, () => ({ min: 8, max: 12 })),
      );
    });

    it('resizes to a new set count while keeping the existing targets', () => {
      expect(targets(pyramid.with({ sets: 5 }))).toEqual([
        { min: 12, max: 12 },
        { min: 10, max: 10 },
        { min: 8, max: 8 },
        { min: 8, max: 8 },
        { min: 8, max: 8 },
      ]);
    });

    it('applies a set count and a rep layout together', () => {
      expect(targets(pyramid.with({ sets: 2, repsConfig: { type: 'fixed', reps: 6 } }))).toEqual([
        { min: 6, max: 6 },
        { min: 6, max: 6 },
      ]);
    });

    it('leaves the original unchanged', () => {
      const updated = fixed.with({ repsConfig: { type: 'range', min: 8, max: 12 } });
      expect(updated).not.toBe(fixed);
      expect(targets(fixed)).toEqual(Array.from({ length: 3 }, () => ({ min: 10, max: 10 })));
    });
  });

  describe('withSets', () => {
    it('grows by repeating the last target', () => {
      expect(pyramid.withSets(5).plannedSets.map((s) => s.reps)).toEqual([
        { min: 12, max: 12 },
        { min: 10, max: 10 },
        { min: 8, max: 8 },
        { min: 8, max: 8 },
        { min: 8, max: 8 },
      ]);
    });

    it('shrinks by truncating', () => {
      expect(pyramid.withSets(2).plannedSets.map((s) => s.reps)).toEqual([
        { min: 12, max: 12 },
        { min: 10, max: 10 },
      ]);
    });

    it('leaves the list untouched when the count is unchanged', () => {
      expect(pyramid.withSets(3).plannedSets).toEqual(pyramid.plannedSets);
    });

    it('returns a new blueprint instance leaving the original unchanged', () => {
      expect(pyramid.withSets(5)).not.toBe(pyramid);
      expect(pyramid.plannedSets).toHaveLength(3);
    });

    it('clamps to a minimum of 1 set', () => {
      expect(fixed.withSets(0).plannedSets).toHaveLength(1);
      expect(fixed.withSets(-5).plannedSets).toHaveLength(1);
    });
  });
});
