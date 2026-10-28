import { describe, expect, it } from 'vitest';
import { summarySetRuns } from '@/components/presentation/summary/summary-set-runs';
import { formatRepsTarget } from '@/models/blueprint-models';
import { PotentialSet, RecordedSet, RecordedWeightedExercise } from '@/models/session-models';
import { Weight } from '@/models/weight';
import { makeWeightedBlueprint, tick } from '@/models/session-models/__test__/helpers';

function exerciseOf(sets: { reps: number | undefined; weight: number }[]) {
  const blueprint = makeWeightedBlueprint();
  return new RecordedWeightedExercise(
    blueprint,
    sets.map((set, index) =>
      PotentialSet.of({
        set:
          set.reps === undefined ? undefined : RecordedSet.of({ repsCompleted: set.reps, completionDateTime: tick() }),
        weight: new Weight(set.weight, 'kilograms'),
        target: blueprint.repsTargetForSet(index),
      }),
    ),
    undefined,
  );
}

const kg = (value: number) => new Weight(value, 'kilograms');

describe('summarySetRuns', () => {
  it('keeps straight sets in one run', () => {
    const exercise = exerciseOf([
      { reps: 8, weight: 100 },
      { reps: 8, weight: 100 },
      { reps: 7, weight: 100 },
    ]);

    expect(summarySetRuns(exercise, { isFilled: true, groupByWeight: true })).toEqual([
      {
        weight: kg(100),
        sets: [
          { label: '8', isDone: true },
          { label: '8', isDone: true },
          { label: '7', isDone: true },
        ],
      },
    ]);
  });

  it('starts a new run when the weight changes', () => {
    const exercise = exerciseOf([
      { reps: 8, weight: 42.5 },
      { reps: 8, weight: 47.5 },
      { reps: 8, weight: 47.5 },
    ]);

    const runs = summarySetRuns(exercise, { isFilled: true, groupByWeight: true });

    expect(runs.map((run) => [run.weight, run.sets.length])).toEqual([
      [kg(42.5), 1],
      [kg(47.5), 2],
    ]);
  });

  it('keeps every set in one run when weight is not grouped', () => {
    const exercise = exerciseOf([
      { reps: 8, weight: 42.5 },
      { reps: 8, weight: 47.5 },
    ]);

    expect(summarySetRuns(exercise, { isFilled: true, groupByWeight: false })).toHaveLength(1);
  });

  it('leaves sets that were never done out of a finished session', () => {
    const exercise = exerciseOf([
      { reps: 8, weight: 100 },
      { reps: undefined, weight: 100 },
    ]);

    expect(summarySetRuns(exercise, { isFilled: true, groupByWeight: true })[0]!.sets).toEqual([
      { label: '8', isDone: true },
    ]);
  });

  it('shows the target for sets still to do in a planned session', () => {
    const exercise = exerciseOf([
      { reps: 8, weight: 100 },
      { reps: undefined, weight: 100 },
    ]);

    expect(summarySetRuns(exercise, { isFilled: false, groupByWeight: true })[0]!.sets).toEqual([
      { label: '8', isDone: true },
      { label: formatRepsTarget(exercise.repsTargetForSet(1)), isDone: false },
    ]);
  });
});
