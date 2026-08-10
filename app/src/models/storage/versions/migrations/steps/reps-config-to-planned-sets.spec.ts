import { describe, it, expect } from 'vitest';
import { repsConfigToPlannedSets } from './reps-config-to-planned-sets';

interface RepsTarget {
  min: number;
  max: number;
}

type RepsConfig =
  | { type: 'fixed'; reps: number }
  | { type: 'range'; min: number; max: number }
  | { type: 'perSet'; targets: RepsTarget[] };

function weighted(sets: number, repsConfig: RepsConfig, usesBodyweight = false) {
  return {
    type: 'WeightedExerciseBlueprint' as const,
    name: 'Squat',
    sets,
    repsConfig,
    usesBodyweight,
    supersetWithNext: false,
    notes: '',
    link: '',
  };
}

const target = (min: number, max = min) => ({ reps: { min, max } });

describe('repsConfigToPlannedSets', () => {
  it.each([
    ['a fixed target across three sets', weighted(3, { type: 'fixed', reps: 5 }), [target(5), target(5), target(5)]],
    ['a single set', weighted(1, { type: 'fixed', reps: 5 }), [target(5)]],
    [
      'a range shared by every set',
      weighted(4, { type: 'range', min: 8, max: 12 }),
      [target(8, 12), target(8, 12), target(8, 12), target(8, 12)],
    ],
    [
      'a pyramid, verbatim',
      weighted(3, {
        type: 'perSet',
        targets: [
          { min: 10, max: 10 },
          { min: 8, max: 8 },
          { min: 6, max: 6 },
        ],
      }),
      [target(10), target(8), target(6)],
    ],
    [
      'a pyramid shorter than the set count, padded from its last target',
      weighted(4, {
        type: 'perSet',
        targets: [
          { min: 10, max: 10 },
          { min: 8, max: 8 },
        ],
      }),
      [target(10), target(8), target(8), target(8)],
    ],
    [
      'a pyramid longer than the set count, truncated',
      weighted(2, {
        type: 'perSet',
        targets: [
          { min: 10, max: 10 },
          { min: 8, max: 8 },
          { min: 6, max: 6 },
        ],
      }),
      [target(10), target(8)],
    ],
    [
      'a pyramid with no targets at all',
      weighted(3, { type: 'perSet', targets: [] }),
      [target(0), target(0), target(0)],
    ],
    ['no sets', weighted(0, { type: 'fixed', reps: 5 }), []],
  ])('migrates %s', (_label, exercise, plannedSets) => {
    expect(repsConfigToPlannedSets(exercise).plannedSets).toEqual(plannedSets);
  });

  it.each([
    ['bodyweight', true, 'bodyweight'],
    ['external', false, 'external'],
  ])('maps a %s exercise onto its load basis', (_label, usesBodyweight, loadBasis) => {
    expect(repsConfigToPlannedSets(weighted(3, { type: 'fixed', reps: 5 }, usesBodyweight)).loadBasis).toBe(loadBasis);
  });

  it('drops the fields it replaces and keeps the rest', () => {
    const result = repsConfigToPlannedSets(weighted(3, { type: 'fixed', reps: 5 }));

    expect('sets' in result).toBe(false);
    expect('repsConfig' in result).toBe(false);
    expect('usesBodyweight' in result).toBe(false);
    expect(result).toMatchObject({ type: 'WeightedExerciseBlueprint', name: 'Squat', supersetWithNext: false });
  });
});
