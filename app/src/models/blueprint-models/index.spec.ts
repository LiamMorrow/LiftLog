import { describe, expect, it } from 'vitest';
import BigNumber from 'bignumber.js';
import { Duration } from '@js-joda/core';
import {
  CardioExerciseBlueprint,
  CardioExerciseSetBlueprint,
  ProgressionRule,
  normalizeExerciseName,
  progressionEquals,
  RepsConfig,
  WeightedExerciseBlueprint,
  cardioTargetEquals,
} from '@/models/blueprint-models';
import { RecordedWeightedExercise } from '@/models/session-models';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function bn(n: number) {
  return new BigNumber(n);
}

describe('blueprint models', () => {
  // ---------------------------------------------------------------------------
  // ProgressionRule
  // ---------------------------------------------------------------------------

  describe('ProgressionRule', () => {
    it('round-trips through JSON', () => {
      const rule = ProgressionRule.of({
        axis: 'reps',
        step: bn(1),
        scope: { type: 'lowestSets', pick: 'middle' },
        ceiling: bn(12),
        onCeiling: 'reset',
      });

      expect(ProgressionRule.fromJSON(rule.toJSON()).equals(rule)).toBe(true);
    });

    it('leaves an absent ceiling absent rather than writing null', () => {
      const json = ProgressionRule.load(bn(2.5)).toJSON();

      expect(json).not.toHaveProperty('ceiling');
      expect(json).not.toHaveProperty('onCeiling');
      expect(ProgressionRule.fromJSON(json).ceiling).toBeUndefined();
    });

    it('compares every field', () => {
      const rule = ProgressionRule.load(bn(2.5));

      expect(rule.equals(ProgressionRule.load(bn(2.5)))).toBe(true);
      expect(rule.equals(rule.with({ step: bn(5) }))).toBe(false);
      expect(rule.equals(rule.with({ axis: 'reps' }))).toBe(false);
      expect(rule.equals(rule.with({ scope: { type: 'lowestSets', pick: 'all' } }))).toBe(false);
      expect(rule.equals(rule.with({ ceiling: bn(12) }))).toBe(false);
      expect(rule.equals(undefined)).toBe(false);
    });

    it('tells a set ceiling from an absent one in both directions', () => {
      const capped = ProgressionRule.load(bn(2.5)).with({ ceiling: bn(12) });
      const uncapped = ProgressionRule.load(bn(2.5));

      expect(capped.equals(uncapped)).toBe(false);
      expect(uncapped.equals(capped)).toBe(false);
    });

    it('clears a ceiling when the field is passed as undefined', () => {
      const capped = ProgressionRule.load(bn(2.5)).with({ ceiling: bn(12) });

      expect(capped.with({ ceiling: undefined }).ceiling).toBeUndefined();
    });

    it('compares lists by order', () => {
      const load = ProgressionRule.load(bn(2.5));
      const reps = ProgressionRule.of({ axis: 'reps', step: bn(1) });

      expect(progressionEquals([load, reps], [load, reps])).toBe(true);
      expect(progressionEquals([load, reps], [reps, load])).toBe(false);
      expect(progressionEquals([load], [])).toBe(false);
      expect(progressionEquals([], [])).toBe(true);
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
      const crunch = WeightedExerciseBlueprint.of({ name: 'Crunch', sets: 3, resistance: 'none' });
      expect(crunch.progressionKey()).toBe('Crunch_WeightedExerciseBlueprint_3');
      expect(crunch.with({ repsConfig: { type: 'fixed', reps: 25 } }).progressionKey()).toBe(crunch.progressionKey());
      expect(crunch.withSets(4).progressionKey()).not.toBe(crunch.progressionKey());
    });

    it('a loaded exercise whose reps a rule moves also keys without its rep scheme', () => {
      const doubleProgression = WeightedExerciseBlueprint.of({
        name: 'Chin Up',
        sets: 3,
        repsConfig: { type: 'fixed', reps: 8 },
        progression: [
          ProgressionRule.of({ axis: 'reps', step: bn(1), ceiling: bn(12), onCeiling: 'reset' }),
          ProgressionRule.load(bn(2.5)),
        ],
      });

      expect(doubleProgression.progressionKey()).toBe('Chin Up_WeightedExerciseBlueprint_3');
      // Raising the plan's starting rung must not strand a ladder that has already climbed past it.
      expect(doubleProgression.with({ repsConfig: { type: 'fixed', reps: 10 } }).progressionKey()).toBe(
        doubleProgression.progressionKey(),
      );
    });

    it('a loaded exercise with only a load rule still keys on its rep scheme', () => {
      const linear = WeightedExerciseBlueprint.of({
        name: 'Squat',
        sets: 3,
        repsConfig: { type: 'fixed', reps: 5 },
        progression: [ProgressionRule.load(bn(2.5))],
      });

      expect(linear.progressionKey()).toBe('Squat_WeightedExerciseBlueprint_3_5');
    });
  });

  describe('repsAreProgressed', () => {
    const squat = (init = {}) => WeightedExerciseBlueprint.of({ name: 'Squat', sets: 3, ...init });

    it.each([
      ['no load to advance on', { resistance: 'none' as const }, true],
      ['a rule that moves reps', { progression: [ProgressionRule.of({ axis: 'reps', step: bn(1) })] }, true],
      [
        'a ladder that reaches reps',
        {
          progression: [ProgressionRule.of({ axis: 'reps', step: bn(1) }), ProgressionRule.load(bn(2.5))],
        },
        true,
      ],
      ['only a load rule', { progression: [ProgressionRule.load(bn(2.5))] }, false],
      ['no rules at all', {}, false],
    ])('%s', (_label, init, expected) => {
      expect(squat(init).repsAreProgressed).toBe(expected);
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
