import { describe, it, expect } from 'vitest';
import { addSetTargets } from './add-set-targets';
import type { BigNumberJSON, OffsetDateTimeJSON } from '@/models/storage/versions/libs';
import type { WeightJSON, WeightUnitJSON } from '@/models/storage/versions/libs/weight';

const at = '2024-01-15T10:00:00Z' as OffsetDateTimeJSON;
const weight = (value: string, unit: WeightUnitJSON = 'kilograms'): WeightJSON => ({
  unit,
  value: value as BigNumberJSON,
});

function exercise(
  plannedReps: number[],
  potentialSets: { set?: { repsCompleted: number; completionDateTime: OffsetDateTimeJSON }; weight: WeightJSON }[],
) {
  return {
    type: 'RecordedWeightedExercise' as const,
    blueprint: { plannedSets: plannedReps.map((reps) => ({ reps: { min: reps, max: reps } })) },
    potentialSets,
    notes: 'notes',
  };
}

describe('addSetTargets', () => {
  it('gives an unfilled set its target, leaving it unfilled', () => {
    const [result] = addSetTargets(exercise([8], [{ weight: weight('60') }])).potentialSets;

    expect(result).toEqual({
      target: { reps: { min: 8, max: 8 } },
      weight: weight('60'),
    });
  });

  it('leaves a filled set exactly as it was', () => {
    const set = { repsCompleted: 8, completionDateTime: at };
    const [result] = addSetTargets(exercise([8], [{ set, weight: weight('60') }])).potentialSets;

    expect(result).toEqual({ target: { reps: { min: 8, max: 8 } }, set, weight: weight('60') });
  });

  it('keeps a zero-rep set recorded rather than unfilled', () => {
    const [result] = addSetTargets(
      exercise([8], [{ set: { repsCompleted: 0, completionDateTime: at }, weight: weight('60') }]),
    ).potentialSets;

    expect(result?.set).toEqual({ repsCompleted: 0, completionDateTime: at });
  });

  it('takes the last target for sets past the end of the plan', () => {
    // A session can hold more sets than its blueprint plans.
    const result = addSetTargets(
      exercise([12, 10], [{ weight: weight('60') }, { weight: weight('60') }, { weight: weight('60') }]),
    ).potentialSets;

    expect(result.map((s) => s.target)).toEqual([
      { reps: { min: 12, max: 12 } },
      { reps: { min: 10, max: 10 } },
      { reps: { min: 10, max: 10 } },
    ]);
  });

  it('gives a zero target when the blueprint plans no sets at all', () => {
    const [result] = addSetTargets(exercise([], [{ weight: weight('60') }])).potentialSets;

    expect(result?.target).toEqual({ reps: { min: 0, max: 0 } });
  });

  it('produces nothing for an exercise with no recorded sets', () => {
    expect(() => addSetTargets(exercise([8, 8, 8], []))).not.toThrow();
    expect(addSetTargets(exercise([8, 8, 8], [])).potentialSets).toEqual([]);
  });

  it.each([
    ['zero', '0'],
    ['negative', '-20'],
    ['fractional', '2.5'],
  ])('preserves a %s load', (_label, value) => {
    const [result] = addSetTargets(exercise([8], [{ weight: weight(value) }])).potentialSets;

    expect(result?.weight).toEqual(weight(value));
  });

  it.each<WeightUnitJSON>(['kilograms', 'pounds', 'nil'])('preserves a %s unit', (unit) => {
    const [result] = addSetTargets(exercise([8], [{ weight: weight('60', unit) }])).potentialSets;

    expect(result?.weight.unit).toBe(unit);
  });

  it('keeps everything else on the exercise', () => {
    const result = addSetTargets(exercise([8], [{ weight: weight('60') }]));

    expect(result).toMatchObject({ type: 'RecordedWeightedExercise', notes: 'notes' });
  });
});
