import { Duration } from '@js-joda/core';
import BigNumber from 'bignumber.js';
import { describe, expect, it } from 'vitest';
import {
  CardioExerciseBlueprint,
  Rest,
  SessionBlueprint,
  WeightedExerciseBlueprint,
} from './blueprint-models';
import {
  applySessionBlueprintDiff,
  diffSessionBlueprints,
  getChangeDescription,
} from './blueprint-diff';

describe('diffSessionBlueprints', () => {
  const createWeightedExercise = (
    name: string,
    sets = 3,
    reps = 10,
  ): WeightedExerciseBlueprint =>
    new WeightedExerciseBlueprint(
      name,
      sets,
      reps,
      BigNumber(2.5),
      Rest.medium,
      false,
      '',
      '',
    );

  const createCardioExercise = (name: string): CardioExerciseBlueprint =>
    new CardioExerciseBlueprint(
      name,
      { type: 'time', value: Duration.ofMinutes(30) },
      true,
      false,
      false,
      false,
      '',
      '',
    );

  describe('session-level changes', () => {
    it('should detect session name change', () => {
      const original = new SessionBlueprint('Workout A', [], '');
      const modified = new SessionBlueprint('Workout B', [], '');

      const diff = diffSessionBlueprints(original, modified);

      expect(diff.hasChanges).toBe(true);
      expect(diff.sessionChanges).toHaveLength(1);
      expect(diff.sessionChanges[0]).toMatchObject({
        kind: 'sessionName',
        type: 'modified',
        oldValue: 'Workout A',
        newValue: 'Workout B',
      });
    });

    it('should detect session notes change', () => {
      const original = new SessionBlueprint('Workout', [], 'Old notes');
      const modified = new SessionBlueprint('Workout', [], 'New notes');

      const diff = diffSessionBlueprints(original, modified);

      expect(diff.hasChanges).toBe(true);
      expect(diff.sessionChanges).toHaveLength(1);
      expect(diff.sessionChanges[0]).toMatchObject({
        kind: 'sessionNotes',
        oldValue: 'Old notes',
        newValue: 'New notes',
      });
    });

    it('should detect no changes for identical sessions', () => {
      const exercises = [createWeightedExercise('Squat')];
      const original = new SessionBlueprint('Workout', exercises, 'Notes');
      const modified = new SessionBlueprint('Workout', exercises, 'Notes');

      const diff = diffSessionBlueprints(original, modified);

      expect(diff.hasChanges).toBe(false);
      expect(diff.allChanges).toHaveLength(0);
    });
  });

  describe('exercise additions and removals', () => {
    it('should detect added exercise', () => {
      const original = new SessionBlueprint(
        'Workout',
        [createWeightedExercise('Squat')],
        '',
      );
      const modified = new SessionBlueprint(
        'Workout',
        [
          createWeightedExercise('Squat'),
          createWeightedExercise('Bench Press'),
        ],
        '',
      );

      const diff = diffSessionBlueprints(original, modified);

      expect(diff.hasChanges).toBe(true);
      expect(diff.addedExercises).toHaveLength(1);
      expect(diff.addedExercises[0]).toMatchObject({
        kind: 'exercise',
        type: 'added',
        newIndex: 1,
      });
      expect(diff.addedExercises[0].exercise.name).toBe('Bench Press');
    });

    it('should detect removed exercise', () => {
      const original = new SessionBlueprint(
        'Workout',
        [
          createWeightedExercise('Squat'),
          createWeightedExercise('Bench Press'),
        ],
        '',
      );
      const modified = new SessionBlueprint(
        'Workout',
        [createWeightedExercise('Squat')],
        '',
      );

      const diff = diffSessionBlueprints(original, modified);

      expect(diff.hasChanges).toBe(true);
      expect(diff.removedExercises).toHaveLength(1);
      expect(diff.removedExercises[0]).toMatchObject({
        kind: 'exercise',
        type: 'removed',
        oldIndex: 1,
      });
      expect(diff.removedExercises[0].exercise.name).toBe('Bench Press');
    });
  });

  describe('exercise reordering', () => {
    it('should detect reordered exercises', () => {
      const original = new SessionBlueprint(
        'Workout',
        [
          createWeightedExercise('Squat'),
          createWeightedExercise('Bench Press'),
          createWeightedExercise('Deadlift'),
        ],
        '',
      );
      const modified = new SessionBlueprint(
        'Workout',
        [
          createWeightedExercise('Bench Press'),
          createWeightedExercise('Squat'),
          createWeightedExercise('Deadlift'),
        ],
        '',
      );

      const diff = diffSessionBlueprints(original, modified);

      expect(diff.hasChanges).toBe(true);
      expect(diff.reorderedExercises).toHaveLength(2);

      const squatReorder = diff.reorderedExercises.find(
        (r) => r.exerciseName === 'Squat',
      );
      expect(squatReorder).toMatchObject({
        type: 'reordered',
        oldIndex: 0,
        newIndex: 1,
      });

      const benchReorder = diff.reorderedExercises.find(
        (r) => r.exerciseName === 'Bench Press',
      );
      expect(benchReorder).toMatchObject({
        type: 'reordered',
        oldIndex: 1,
        newIndex: 0,
      });
    });
  });

  describe('exercise field changes', () => {
    it('should detect sets change', () => {
      const original = new SessionBlueprint(
        'Workout',
        [createWeightedExercise('Squat', 3, 10)],
        '',
      );
      const modified = new SessionBlueprint(
        'Workout',
        [createWeightedExercise('Squat', 5, 10)],
        '',
      );

      const diff = diffSessionBlueprints(original, modified);

      expect(diff.hasChanges).toBe(true);
      expect(diff.modifiedExercises).toHaveLength(1);
      expect(diff.modifiedExercises[0].exerciseName).toBe('Squat');
      expect(diff.modifiedExercises[0].changes).toHaveLength(1);
      expect(diff.modifiedExercises[0].changes[0]).toMatchObject({
        kind: 'exerciseSets',
        oldValue: 3,
        newValue: 5,
      });
    });

    it('should detect reps change', () => {
      const original = new SessionBlueprint(
        'Workout',
        [createWeightedExercise('Squat', 3, 10)],
        '',
      );
      const modified = new SessionBlueprint(
        'Workout',
        [createWeightedExercise('Squat', 3, 8)],
        '',
      );

      const diff = diffSessionBlueprints(original, modified);

      expect(diff.modifiedExercises[0].changes[0]).toMatchObject({
        kind: 'exerciseReps',
        oldValue: 10,
        newValue: 8,
      });
    });

    it('should group rest changes as single change', () => {
      const original = new SessionBlueprint(
        'Workout',
        [
          new WeightedExerciseBlueprint(
            'Squat',
            3,
            10,
            BigNumber(2.5),
            Rest.short,
            false,
            '',
            '',
          ),
        ],
        '',
      );
      const modified = new SessionBlueprint(
        'Workout',
        [
          new WeightedExerciseBlueprint(
            'Squat',
            3,
            10,
            BigNumber(2.5),
            Rest.long,
            false,
            '',
            '',
          ),
        ],
        '',
      );

      const diff = diffSessionBlueprints(original, modified);

      expect(diff.modifiedExercises).toHaveLength(1);
      expect(diff.modifiedExercises[0].changes).toHaveLength(1);
      expect(diff.modifiedExercises[0].changes[0]).toMatchObject({
        kind: 'exerciseRest',
        oldValue: Rest.short,
        newValue: Rest.long,
      });
    });

    it('should detect multiple field changes on same exercise', () => {
      const original = new SessionBlueprint(
        'Workout',
        [createWeightedExercise('Squat', 3, 10)],
        '',
      );
      const modified = new SessionBlueprint(
        'Workout',
        [createWeightedExercise('Squat', 5, 8)],
        '',
      );

      const diff = diffSessionBlueprints(original, modified);

      expect(diff.modifiedExercises[0].changes).toHaveLength(2);
      const kinds = diff.modifiedExercises[0].changes.map((c) => c.kind);
      expect(kinds).toContain('exerciseSets');
      expect(kinds).toContain('exerciseReps');
    });
  });

  describe('exercise type changes', () => {
    it('should detect weighted to cardio change', () => {
      const original = new SessionBlueprint(
        'Workout',
        [createWeightedExercise('Exercise')],
        '',
      );
      const modified = new SessionBlueprint(
        'Workout',
        [createCardioExercise('Exercise')],
        '',
      );

      const diff = diffSessionBlueprints(original, modified);

      expect(diff.modifiedExercises[0].changes[0]).toMatchObject({
        kind: 'exerciseType',
        type: 'modified',
      });
    });
  });

  describe('duplicate exercise handling', () => {
    it('should match duplicates by position within name group', () => {
      const original = new SessionBlueprint(
        'Workout',
        [
          createWeightedExercise('Squat', 3, 10),
          createWeightedExercise('Squat', 4, 8),
        ],
        '',
      );
      const modified = new SessionBlueprint(
        'Workout',
        [
          createWeightedExercise('Squat', 3, 12), // First Squat modified
          createWeightedExercise('Squat', 5, 8), // Second Squat modified
        ],
        '',
      );

      const diff = diffSessionBlueprints(original, modified);

      expect(diff.modifiedExercises).toHaveLength(2);
      // First Squat: reps 10 -> 12
      const firstSquatChanges = diff.modifiedExercises.find(
        (m) => m.exerciseIndex === 0,
      )?.changes;
      expect(
        firstSquatChanges?.find((c) => c.kind === 'exerciseReps'),
      ).toMatchObject({
        oldValue: 10,
        newValue: 12,
      });
      // Second Squat: sets 4 -> 5
      const secondSquatChanges = diff.modifiedExercises.find(
        (m) => m.exerciseIndex === 1,
      )?.changes;
      expect(
        secondSquatChanges?.find((c) => c.kind === 'exerciseSets'),
      ).toMatchObject({
        oldValue: 4,
        newValue: 5,
      });
    });
  });
});

describe('applySessionBlueprintDiff', () => {
  const createWeightedExercise = (
    name: string,
    sets = 3,
    reps = 10,
  ): WeightedExerciseBlueprint =>
    new WeightedExerciseBlueprint(
      name,
      sets,
      reps,
      BigNumber(2.5),
      Rest.medium,
      false,
      '',
      '',
    );

  it('should apply selected session name change', () => {
    const original = new SessionBlueprint('Workout A', [], '');
    const modified = new SessionBlueprint('Workout B', [], '');

    const diff = diffSessionBlueprints(original, modified);

    const result = applySessionBlueprintDiff(original, diff);

    expect(result.name).toBe('Workout B');
  });

  it('should apply selected exercise addition', () => {
    const original = new SessionBlueprint(
      'Workout',
      [createWeightedExercise('Squat')],
      '',
    );
    const modified = new SessionBlueprint(
      'Workout',
      [createWeightedExercise('Squat'), createWeightedExercise('Bench Press')],
      '',
    );

    const diff = diffSessionBlueprints(original, modified);

    const result = applySessionBlueprintDiff(original, diff);

    expect(result.exercises).toHaveLength(2);
    expect(result.exercises[1].name).toBe('Bench Press');
  });

  it('should apply selected exercise removal', () => {
    const original = new SessionBlueprint(
      'Workout',
      [createWeightedExercise('Squat'), createWeightedExercise('Bench Press')],
      '',
    );
    const modified = new SessionBlueprint(
      'Workout',
      [createWeightedExercise('Squat')],
      '',
    );

    const diff = diffSessionBlueprints(original, modified);

    const result = applySessionBlueprintDiff(original, diff);

    expect(result.exercises).toHaveLength(1);
    expect(result.exercises[0].name).toBe('Squat');
  });

  it('should apply selected field change', () => {
    const original = new SessionBlueprint(
      'Workout',
      [createWeightedExercise('Squat', 3, 10)],
      '',
    );
    const modified = new SessionBlueprint(
      'Workout',
      [createWeightedExercise('Squat', 5, 8)],
      '',
    );

    const diff = diffSessionBlueprints(original, modified);

    const result = applySessionBlueprintDiff(original, diff);

    const exercise = result.exercises[0] as WeightedExerciseBlueprint;
    expect(exercise.sets).toBe(5);
  });

  it('should apply all selected changes correctly', () => {
    const original = new SessionBlueprint(
      'Workout',
      [createWeightedExercise('Squat', 3, 10)],
      '',
    );
    const modified = new SessionBlueprint(
      'Workout',
      [createWeightedExercise('Squat', 5, 8)],
      '',
    );

    const diff = diffSessionBlueprints(original, modified);

    const result = applySessionBlueprintDiff(original, diff);

    const exercise = result.exercises[0] as WeightedExerciseBlueprint;
    expect(exercise.sets).toBe(5);
    expect(exercise.repsPerSet).toBe(8);
  });
});

describe('getChangeDescription', () => {
  const createWeightedExercise = (name: string): WeightedExerciseBlueprint =>
    new WeightedExerciseBlueprint(
      name,
      3,
      10,
      BigNumber(2.5),
      Rest.medium,
      false,
      '',
      '',
    );

  it('should return translation key for session name change', () => {
    const original = new SessionBlueprint('Workout A', [], '');
    const modified = new SessionBlueprint('Workout B', [], '');

    const diff = diffSessionBlueprints(original, modified);
    const translatable = getChangeDescription(diff.sessionChanges[0]);

    expect(translatable.key).toBe('plan.diff.generic_two_value_change.body');
    expect(translatable.params).toEqual({
      oldValue: 'Workout A',
      newValue: 'Workout B',
    });
  });

  it('should return translation key for added exercise', () => {
    const original = new SessionBlueprint('Workout', [], '');
    const modified = new SessionBlueprint(
      'Workout',
      [createWeightedExercise('Squat')],
      '',
    );

    const diff = diffSessionBlueprints(original, modified);
    const translatable = getChangeDescription(diff.addedExercises[0]);

    expect(translatable.key).toBe('plan.diff.exercise_added.body');
    expect(translatable.params).toEqual({ name: 'Squat' });
  });

  it('should return translation key for sets change', () => {
    const original = new SessionBlueprint(
      'Workout',
      [createWeightedExercise('Squat')],
      '',
    );
    const modified = new SessionBlueprint(
      'Workout',
      [
        new WeightedExerciseBlueprint(
          'Squat',
          5,
          10,
          BigNumber(2.5),
          Rest.medium,
          false,
          '',
          '',
        ),
      ],
      '',
    );

    const diff = diffSessionBlueprints(original, modified);
    const setsChange = diff.modifiedExercises[0].changes.find(
      (c) => c.kind === 'exerciseSets',
    );
    const translatable = getChangeDescription(setsChange!);

    expect(translatable.key).toBe('plan.diff.generic_two_value_change.body');
    expect(translatable.params).toEqual({
      oldValue: 3,
      newValue: 5,
    });
  });
});
