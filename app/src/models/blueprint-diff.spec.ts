import { Duration } from '@js-joda/core';
import BigNumber from 'bignumber.js';
import { describe, expect, it, vi } from 'vitest';

vi.mock('expo-localization', () => ({
  getLocales: () => [{ decimalSeparator: '.' }],
}));
import {
  CardioExerciseBlueprint,
  CardioExerciseSetBlueprint,
  ProgressionRule,
  Rest,
  SessionBlueprint,
  WeightedExerciseBlueprint,
} from './blueprint-models';
import {
  applySessionBlueprintDiff,
  diffSessionBlueprints,
  filterDiff,
  getChangeDescription,
  getChangeLabelKey,
} from './blueprint-diff';
import { UseTranslateResult } from '@tolgee/react';
import { makeWeightedBlueprint } from '@/models/session-models/__test__/helpers';

describe('diffSessionBlueprints', () => {
  const createWeightedExercise = (name: string, sets = 3, reps = 10): WeightedExerciseBlueprint =>
    makeWeightedBlueprint({
      name,
      sets,
      repsConfig: { type: 'fixed', reps },
      progression: [ProgressionRule.load(new BigNumber('2.5'))],
    });

  const createCardioSet = (
    durationMinutes = 30,
    trackDuration = true,
    trackDistance = false,
    trackResistance = false,
    trackIncline = false,
    trackWeight = false,
    trackSteps = false,
    restBetweenSets?: Rest,
  ): CardioExerciseSetBlueprint =>
    new CardioExerciseSetBlueprint(
      { type: 'time', value: Duration.ofMinutes(durationMinutes) },
      trackDuration,
      trackDistance,
      trackResistance,
      trackIncline,
      trackWeight,
      trackSteps,
      restBetweenSets,
    );

  const createCardioExercise = (
    name: string,
    sets: CardioExerciseSetBlueprint[] = [createCardioSet()],
  ): CardioExerciseBlueprint => new CardioExerciseBlueprint(name, sets, '', '');

  describe('session-level changes', () => {
    it('should detect session name change', () => {
      const original = new SessionBlueprint('Workout A', [], '');
      const modified = new SessionBlueprint('Workout B', [], '');

      const diff = diffSessionBlueprints(original, modified);

      expect(diff.hasChanges).toBe(true);
      expect(diff.sessionChanges).toHaveLength(1);
      expect(diff.sessionChanges[0]!).toMatchObject({
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
      expect(diff.sessionChanges[0]!).toMatchObject({
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
      const original = new SessionBlueprint('Workout', [createWeightedExercise('Squat')], '');
      const modified = new SessionBlueprint(
        'Workout',
        [createWeightedExercise('Squat'), createWeightedExercise('Bench Press')],
        '',
      );

      const diff = diffSessionBlueprints(original, modified);

      expect(diff.hasChanges).toBe(true);
      expect(diff.addedExercises).toHaveLength(1);
      expect(diff.addedExercises[0]!).toMatchObject({
        kind: 'exercise',
        type: 'added',
        newIndex: 1,
      });
      expect(diff.addedExercises[0]!.exercise.name).toBe('Bench Press');
    });

    it('should detect removed exercise', () => {
      const original = new SessionBlueprint(
        'Workout',
        [createWeightedExercise('Squat'), createWeightedExercise('Bench Press')],
        '',
      );
      const modified = new SessionBlueprint('Workout', [createWeightedExercise('Squat')], '');

      const diff = diffSessionBlueprints(original, modified);

      expect(diff.hasChanges).toBe(true);
      expect(diff.removedExercises).toHaveLength(1);
      expect(diff.removedExercises[0]!).toMatchObject({
        kind: 'exercise',
        type: 'removed',
        oldIndex: 1,
      });
      expect(diff.removedExercises[0]!.exercise.name).toBe('Bench Press');
    });
  });

  describe('exercise reordering', () => {
    it('should detect reordered exercises', () => {
      const original = new SessionBlueprint(
        'Workout',
        [createWeightedExercise('Squat'), createWeightedExercise('Bench Press'), createWeightedExercise('Deadlift')],
        '',
      );
      const modified = new SessionBlueprint(
        'Workout',
        [createWeightedExercise('Bench Press'), createWeightedExercise('Squat'), createWeightedExercise('Deadlift')],
        '',
      );

      const diff = diffSessionBlueprints(original, modified);

      expect(diff.hasChanges).toBe(true);
      expect(diff.reorderedExercises).toHaveLength(2);

      const squatReorder = diff.reorderedExercises.find((r) => r.exerciseName === 'Squat');
      expect(squatReorder).toMatchObject({
        type: 'reordered',
        oldIndex: 0,
        newIndex: 1,
      });

      const benchReorder = diff.reorderedExercises.find((r) => r.exerciseName === 'Bench Press');
      expect(benchReorder).toMatchObject({
        type: 'reordered',
        oldIndex: 1,
        newIndex: 0,
      });
    });
  });

  describe('exercise field changes', () => {
    it('should detect sets change', () => {
      const original = new SessionBlueprint('Workout', [createWeightedExercise('Squat', 3, 10)], '');
      const modified = new SessionBlueprint('Workout', [createWeightedExercise('Squat', 5, 10)], '');

      const diff = diffSessionBlueprints(original, modified);

      expect(diff.hasChanges).toBe(true);
      expect(diff.modifiedExercises).toHaveLength(1);
      expect(diff.modifiedExercises[0]!.exerciseName).toBe('Squat');
      expect(diff.modifiedExercises[0]!.changes).toHaveLength(1);
      expect(diff.modifiedExercises[0]!.changes[0]).toMatchObject({
        kind: 'exercisePlannedSets',
        oldValue: Array.from({ length: 3 }, () => ({ reps: { min: 10, max: 10 } })),
        newValue: Array.from({ length: 5 }, () => ({ reps: { min: 10, max: 10 } })),
      });
    });

    it('should detect reps change', () => {
      const original = new SessionBlueprint('Workout', [createWeightedExercise('Squat', 3, 10)], '');
      const modified = new SessionBlueprint('Workout', [createWeightedExercise('Squat', 3, 8)], '');

      const diff = diffSessionBlueprints(original, modified);

      expect(diff.modifiedExercises[0]!.changes[0]).toMatchObject({
        kind: 'exercisePlannedSets',
        oldValue: Array.from({ length: 3 }, () => ({ reps: { min: 10, max: 10 } })),
        newValue: Array.from({ length: 3 }, () => ({ reps: { min: 8, max: 8 } })),
      });
    });

    it('should group rest changes as single change', () => {
      const original = new SessionBlueprint(
        'Workout',
        [
          makeWeightedBlueprint({
            name: 'Squat',
            repsConfig: { type: 'fixed', reps: 10 },
            progression: [ProgressionRule.load(BigNumber(2.5))],
            restBetweenSets: Rest.short,
          }),
        ],
        '',
      );
      const modified = new SessionBlueprint(
        'Workout',
        [
          makeWeightedBlueprint({
            name: 'Squat',
            repsConfig: { type: 'fixed', reps: 10 },
            progression: [ProgressionRule.load(BigNumber(2.5))],
            restBetweenSets: Rest.long,
          }),
        ],
        '',
      );

      const diff = diffSessionBlueprints(original, modified);

      expect(diff.modifiedExercises).toHaveLength(1);
      expect(diff.modifiedExercises[0]!.changes).toHaveLength(1);
      expect(diff.modifiedExercises[0]!.changes[0]).toMatchObject({
        kind: 'exerciseRest',
        oldValue: Rest.short,
        newValue: Rest.long,
      });
    });

    it('should detect bodyweight change', () => {
      const base = makeWeightedBlueprint({
        name: 'Pull Up',
        repsConfig: { type: 'fixed', reps: 10 },
        progression: [],
      });
      const original = new SessionBlueprint('Workout', [base], '');
      const modified = new SessionBlueprint('Workout', [base.with({ resistance: 'bodyweight' })], '');

      const diff = diffSessionBlueprints(original, modified);

      expect(diff.modifiedExercises).toHaveLength(1);
      expect(diff.modifiedExercises[0]!.changes).toHaveLength(1);
      expect(diff.modifiedExercises[0]!.changes[0]).toMatchObject({
        kind: 'exerciseResistance',
        oldValue: 'external',
        newValue: 'bodyweight',
      });

      const applied = applySessionBlueprintDiff(original, diff);
      expect((applied.exercises[0] as WeightedExerciseBlueprint).resistance).toBe('bodyweight');
    });

    it('should detect multiple field changes on same exercise', () => {
      const original = new SessionBlueprint('Workout', [createWeightedExercise('Squat', 3, 10)], '');
      const modified = new SessionBlueprint('Workout', [createWeightedExercise('Squat', 5, 8)], '');

      const diff = diffSessionBlueprints(original, modified);

      // Set count and rep targets are one list, so changing both is a single change.
      expect(diff.modifiedExercises[0]!.changes).toHaveLength(1);
      expect(diff.modifiedExercises[0]!.changes[0]!.kind).toBe('exercisePlannedSets');
    });
  });

  describe('exercise type changes', () => {
    it('should detect weighted to cardio change', () => {
      const original = new SessionBlueprint('Workout', [createWeightedExercise('Exercise')], '');
      const modified = new SessionBlueprint('Workout', [createCardioExercise('Exercise')], '');

      const diff = diffSessionBlueprints(original, modified);

      expect(diff.modifiedExercises[0]!.changes[0]).toMatchObject({
        kind: 'exerciseType',
        type: 'modified',
      });
    });
  });

  describe('duplicate exercise handling', () => {
    it('should match duplicates by position within name group', () => {
      const original = new SessionBlueprint(
        'Workout',
        [createWeightedExercise('Squat', 3, 10), createWeightedExercise('Squat', 4, 8)],
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
      const firstSquatChanges = diff.modifiedExercises.find((m) => m.exerciseIndex === 0)?.changes;
      expect(firstSquatChanges?.find((c) => c.kind === 'exercisePlannedSets')).toMatchObject({
        oldValue: Array.from({ length: 3 }, () => ({ reps: { min: 10, max: 10 } })),
        newValue: Array.from({ length: 3 }, () => ({ reps: { min: 12, max: 12 } })),
      });
      // Second Squat: sets 4 -> 5
      const secondSquatChanges = diff.modifiedExercises.find((m) => m.exerciseIndex === 1)?.changes;
      expect(secondSquatChanges?.find((c) => c.kind === 'exercisePlannedSets')).toMatchObject({
        oldValue: Array.from({ length: 4 }, () => ({ reps: { min: 8, max: 8 } })),
        newValue: Array.from({ length: 5 }, () => ({ reps: { min: 8, max: 8 } })),
      });
    });
  });

  describe('cardio multi-set changes', () => {
    it('should detect added cardio set', () => {
      const original = new SessionBlueprint('Workout', [createCardioExercise('Running', [createCardioSet(30)])], '');
      const modified = new SessionBlueprint(
        'Workout',
        [createCardioExercise('Running', [createCardioSet(30), createCardioSet(20)])],
        '',
      );

      const diff = diffSessionBlueprints(original, modified);

      expect(diff.hasChanges).toBe(true);
      expect(diff.modifiedExercises).toHaveLength(1);
      const addedSetChange = diff.modifiedExercises[0]!.changes.find(
        (c) => c.kind === 'cardioSet' && c.type === 'added',
      );
      expect(addedSetChange).toMatchObject({
        kind: 'cardioSet',
        type: 'added',
        setIndex: 1,
      });
    });

    it('should detect removed cardio set', () => {
      const original = new SessionBlueprint(
        'Workout',
        [createCardioExercise('Running', [createCardioSet(30), createCardioSet(20)])],
        '',
      );
      const modified = new SessionBlueprint('Workout', [createCardioExercise('Running', [createCardioSet(30)])], '');

      const diff = diffSessionBlueprints(original, modified);

      const removedSetChange = diff.modifiedExercises[0]!.changes.find(
        (c) => c.kind === 'cardioSet' && c.type === 'removed',
      );
      expect(removedSetChange).toMatchObject({
        kind: 'cardioSet',
        type: 'removed',
        setIndex: 1,
      });
    });

    it('should detect target change in a cardio set', () => {
      const original = new SessionBlueprint('Workout', [createCardioExercise('Running', [createCardioSet(30)])], '');
      const modified = new SessionBlueprint('Workout', [createCardioExercise('Running', [createCardioSet(45)])], '');

      const diff = diffSessionBlueprints(original, modified);

      expect(diff.hasChanges).toBe(true);
      const targetChange = diff.modifiedExercises[0]!.changes.find((c) => c.kind === 'exerciseTarget');
      expect(targetChange).toMatchObject({
        kind: 'exerciseTarget',
        setIndex: 0,
      });
    });

    it('should detect tracking field change in a cardio set', () => {
      const original = new SessionBlueprint(
        'Workout',
        [createCardioExercise('Running', [createCardioSet(30, true, false, false, false)])],
        '',
      );
      const modified = new SessionBlueprint(
        'Workout',
        [createCardioExercise('Running', [createCardioSet(30, true, true, false, false)])],
        '',
      );

      const diff = diffSessionBlueprints(original, modified);

      expect(diff.hasChanges).toBe(true);
      const trackingChange = diff.modifiedExercises[0]!.changes.find((c) => c.kind === 'exerciseTracking');
      expect(trackingChange).toMatchObject({
        kind: 'exerciseTracking',
        field: 'trackDistance',
        setIndex: 0,
        oldValue: false,
        newValue: true,
      });
    });

    it('should detect changes in multiple cardio sets', () => {
      const original = new SessionBlueprint(
        'Workout',
        [createCardioExercise('Running', [createCardioSet(30), createCardioSet(20)])],
        '',
      );
      const modified = new SessionBlueprint(
        'Workout',
        [
          createCardioExercise('Running', [
            createCardioSet(45), // Changed from 30
            createCardioSet(25), // Changed from 20
          ]),
        ],
        '',
      );

      const diff = diffSessionBlueprints(original, modified);

      expect(diff.hasChanges).toBe(true);
      const targetChanges = diff.modifiedExercises[0]!.changes.filter((c) => c.kind === 'exerciseTarget');
      expect(targetChanges).toHaveLength(2);
      expect(targetChanges[0]).toMatchObject({ setIndex: 0 });
      expect(targetChanges[1]).toMatchObject({ setIndex: 1 });
    });

    it('should detect no changes for identical cardio exercises', () => {
      const sets = [createCardioSet(30), createCardioSet(20)];
      const original = new SessionBlueprint('Workout', [createCardioExercise('Running', sets)], '');
      const modified = new SessionBlueprint(
        'Workout',
        [createCardioExercise('Running', [createCardioSet(30), createCardioSet(20)])],
        '',
      );

      const diff = diffSessionBlueprints(original, modified);

      expect(diff.hasChanges).toBe(false);
    });
  });
});

describe('applySessionBlueprintDiff', () => {
  const createWeightedExercise = (name: string, sets = 3, reps = 10): WeightedExerciseBlueprint =>
    makeWeightedBlueprint({
      name,
      sets,
      repsConfig: { type: 'fixed', reps },
      progression: [ProgressionRule.load(BigNumber(2.5))],
    });

  it('should apply selected session name change', () => {
    const original = new SessionBlueprint('Workout A', [], '');
    const modified = new SessionBlueprint('Workout B', [], '');

    const diff = diffSessionBlueprints(original, modified);

    const result = applySessionBlueprintDiff(original, diff);

    expect(result.name).toBe('Workout B');
  });

  it('should apply selected exercise addition', () => {
    const original = new SessionBlueprint('Workout', [createWeightedExercise('Squat')], '');
    const modified = new SessionBlueprint(
      'Workout',
      [createWeightedExercise('Squat'), createWeightedExercise('Bench Press')],
      '',
    );

    const diff = diffSessionBlueprints(original, modified);

    const result = applySessionBlueprintDiff(original, diff);

    expect(result.exercises).toHaveLength(2);
    expect(result.exercises[1]!.name).toBe('Bench Press');
  });

  it('should apply selected exercise removal', () => {
    const original = new SessionBlueprint(
      'Workout',
      [createWeightedExercise('Squat'), createWeightedExercise('Bench Press')],
      '',
    );
    const modified = new SessionBlueprint('Workout', [createWeightedExercise('Squat')], '');

    const diff = diffSessionBlueprints(original, modified);

    const result = applySessionBlueprintDiff(original, diff);

    expect(result.exercises).toHaveLength(1);
    expect(result.exercises[0]!.name).toBe('Squat');
  });

  it('should apply selected field change', () => {
    const original = new SessionBlueprint('Workout', [createWeightedExercise('Squat', 3, 10)], '');
    const modified = new SessionBlueprint('Workout', [createWeightedExercise('Squat', 5, 8)], '');

    const diff = diffSessionBlueprints(original, modified);

    const result = applySessionBlueprintDiff(original, diff);

    const exercise = result.exercises[0]! as WeightedExerciseBlueprint;
    expect(exercise.plannedSets).toHaveLength(5);
  });

  it('should apply all selected changes correctly', () => {
    const original = new SessionBlueprint('Workout', [createWeightedExercise('Squat', 3, 10)], '');
    const modified = new SessionBlueprint('Workout', [createWeightedExercise('Squat', 5, 8)], '');

    const diff = diffSessionBlueprints(original, modified);

    const result = applySessionBlueprintDiff(original, diff);

    const exercise = result.exercises[0]! as WeightedExerciseBlueprint;
    expect(exercise.plannedSets).toEqual(Array.from({ length: 5 }, () => ({ reps: { min: 8, max: 8 } })));
  });

  const createCardioSet = (
    durationMinutes = 30,
    trackDuration = true,
    trackDistance = false,
  ): CardioExerciseSetBlueprint =>
    new CardioExerciseSetBlueprint(
      { type: 'time', value: Duration.ofMinutes(durationMinutes) },
      trackDuration,
      trackDistance,
      false,
      false,
      false,
      false,
      undefined,
    );

  const createCardioExercise = (
    name: string,
    sets: CardioExerciseSetBlueprint[] = [createCardioSet()],
  ): CardioExerciseBlueprint => new CardioExerciseBlueprint(name, sets, '', '');

  it('should apply cardio set addition', () => {
    const original = new SessionBlueprint('Workout', [createCardioExercise('Running', [createCardioSet(30)])], '');
    const modified = new SessionBlueprint(
      'Workout',
      [createCardioExercise('Running', [createCardioSet(30), createCardioSet(20)])],
      '',
    );

    const diff = diffSessionBlueprints(original, modified);
    const result = applySessionBlueprintDiff(original, diff);

    const exercise = result.exercises[0]! as CardioExerciseBlueprint;
    expect(exercise.sets).toHaveLength(2);
  });

  it('should apply cardio set target change', () => {
    const original = new SessionBlueprint('Workout', [createCardioExercise('Running', [createCardioSet(30)])], '');
    const modified = new SessionBlueprint('Workout', [createCardioExercise('Running', [createCardioSet(45)])], '');

    const diff = diffSessionBlueprints(original, modified);
    const result = applySessionBlueprintDiff(original, diff);

    const exercise = result.exercises[0]! as CardioExerciseBlueprint;
    expect(exercise.sets[0]!.target).toMatchObject({
      type: 'time',
      value: Duration.ofMinutes(45),
    });
  });

  it('should apply cardio set tracking change', () => {
    const original = new SessionBlueprint(
      'Workout',
      [createCardioExercise('Running', [createCardioSet(30, true, false)])],
      '',
    );
    const modified = new SessionBlueprint(
      'Workout',
      [createCardioExercise('Running', [createCardioSet(30, true, true)])],
      '',
    );

    const diff = diffSessionBlueprints(original, modified);
    const result = applySessionBlueprintDiff(original, diff);

    const exercise = result.exercises[0]! as CardioExerciseBlueprint;
    expect(exercise.sets[0]!.trackDistance).toBe(true);
  });
});

describe('getChangeDescription', () => {
  const createWeightedExercise = (name: string): WeightedExerciseBlueprint =>
    makeWeightedBlueprint({
      name,
      repsConfig: { type: 'fixed', reps: 10 },
      progression: [ProgressionRule.load(BigNumber(2.5))],
    });

  it('should return translation key for session name change', () => {
    const original = new SessionBlueprint('Workout A', [], '');
    const modified = new SessionBlueprint('Workout B', [], '');

    const diff = diffSessionBlueprints(original, modified);
    const t: UseTranslateResult['t'] = (key, params?) => ({ key, params }) as unknown as string;
    const translatable = getChangeDescription(t, diff.sessionChanges[0]!) as unknown as {
      key: string;
      params: unknown;
    };

    expect(translatable.key).toBe('plan.diff.generic_two_value_change.body');
    expect(translatable.params).toEqual({
      oldValue: 'Workout A',
      newValue: 'Workout B',
    });
  });

  it('should return translation key for added exercise', () => {
    const original = new SessionBlueprint('Workout', [], '');
    const modified = new SessionBlueprint('Workout', [createWeightedExercise('Squat')], '');

    const diff = diffSessionBlueprints(original, modified);
    const t: UseTranslateResult['t'] = (key, params?) => ({ key, params }) as unknown as string;
    const translatable = getChangeDescription(t, diff.addedExercises[0]!) as unknown as {
      key: string;
      params: unknown;
    };

    expect(translatable.key).toBe('plan.diff.exercise_added.body');
    expect(translatable.params).toEqual({ name: 'Squat' });
  });

  it('should return translation key for sets change', () => {
    const original = new SessionBlueprint('Workout', [createWeightedExercise('Squat')], '');
    const modified = new SessionBlueprint(
      'Workout',
      [
        makeWeightedBlueprint({
          name: 'Squat',
          sets: 5,
          repsConfig: { type: 'fixed', reps: 10 },
          progression: [ProgressionRule.load(BigNumber(2.5))],
        }),
      ],
      '',
    );

    const diff = diffSessionBlueprints(original, modified);
    const setsChange = diff.modifiedExercises[0]!.changes.find((c) => c.kind === 'exercisePlannedSets');

    const t: UseTranslateResult['t'] = (key, params?) => ({ key, params }) as unknown as string;
    const translatable = getChangeDescription(t, setsChange!) as unknown as {
      key: string;
      params: unknown;
    };

    expect(translatable.key).toBe('plan.diff.generic_two_value_change.body');
    expect(translatable.params).toEqual({
      oldValue: '10',
      newValue: '10',
    });
  });
});

// ─── filterDiff ───────────────────────────────────────────────────────────────

describe('filterDiff', () => {
  const weighted = (name: string, sets = 3, reps = 10, notes = ''): WeightedExerciseBlueprint =>
    makeWeightedBlueprint({
      name,
      sets,
      repsConfig: { type: 'fixed', reps },
      progression: [ProgressionRule.load(BigNumber(2.5))],
      notes,
    });

  it('keeps only the selected changes and recomputes hasChanges', () => {
    const original = new SessionBlueprint('Workout', [weighted('Squat', 3, 10)], 'old notes');
    const modified = new SessionBlueprint('Workout renamed', [weighted('Squat', 5, 8)], 'old notes');

    const diff = diffSessionBlueprints(original, modified);
    const setsChange = diff.modifiedExercises[0]!.changes.find((c) => c.kind === 'exercisePlannedSets')!;

    const filtered = filterDiff(diff, new Set([setsChange.id]));

    expect(filtered.hasChanges).toBe(true);
    expect(filtered.allChanges).toHaveLength(1);
    expect(filtered.sessionChanges).toHaveLength(0);
    expect(filtered.modifiedExercises[0]!.changes).toEqual([setsChange]);
    // Applying the filtered diff changes sets but not the session name
    const applied = applySessionBlueprintDiff(original, filtered);
    expect(applied.name).toBe('Workout');
    expect((applied.exercises[0] as WeightedExerciseBlueprint).plannedSets).toHaveLength(5);
  });

  it('drops modified exercises whose changes were all deselected', () => {
    const original = new SessionBlueprint('Workout', [weighted('Squat', 3, 10)], '');
    const modified = new SessionBlueprint('Workout', [weighted('Squat', 5, 10)], '');

    const diff = diffSessionBlueprints(original, modified);
    const filtered = filterDiff(diff, new Set<string>());

    expect(filtered.hasChanges).toBe(false);
    expect(filtered.modifiedExercises).toHaveLength(0);
  });
});

// ─── applySessionBlueprintDiff (remaining branches) ───────────────────────────

describe('applySessionBlueprintDiff additional branches', () => {
  const weighted = (name: string): WeightedExerciseBlueprint =>
    makeWeightedBlueprint({
      name,
      repsConfig: { type: 'fixed', reps: 10 },
      progression: [ProgressionRule.load(BigNumber(2.5))],
    });
  const cardioSet = (durationMinutes: number, trackDuration = true): CardioExerciseSetBlueprint =>
    new CardioExerciseSetBlueprint(
      { type: 'time', value: Duration.ofMinutes(durationMinutes) },
      trackDuration,
      false,
      false,
      false,
      false,
      false,
      undefined,
    );
  const cardio = (name: string, sets: CardioExerciseSetBlueprint[]): CardioExerciseBlueprint =>
    new CardioExerciseBlueprint(name, sets, '', '');

  it('applies a cardio set removal', () => {
    const original = new SessionBlueprint('W', [cardio('Run', [cardioSet(30), cardioSet(20)])], '');
    const modified = new SessionBlueprint('W', [cardio('Run', [cardioSet(30)])], '');

    const result = applySessionBlueprintDiff(original, diffSessionBlueprints(original, modified));

    expect((result.exercises[0] as CardioExerciseBlueprint).sets).toHaveLength(1);
  });

  it('applies an exercise type change', () => {
    const original = new SessionBlueprint('W', [weighted('Squat')], '');
    const modified = new SessionBlueprint('W', [cardio('Squat', [cardioSet(30)])], '');

    const result = applySessionBlueprintDiff(original, diffSessionBlueprints(original, modified));

    expect(result.exercises[0]).toBeInstanceOf(CardioExerciseBlueprint);
  });

  it('applies reordering of matched exercises', () => {
    const a = weighted('A');
    const b = weighted('B');
    const original = new SessionBlueprint('W', [a, b], '');
    const modified = new SessionBlueprint('W', [b, a], '');

    const result = applySessionBlueprintDiff(original, diffSessionBlueprints(original, modified));

    expect(result.exercises.map((e) => e.name)).toEqual(['B', 'A']);
  });

  it('round-trips a full weighted diff back to the modified blueprint', () => {
    const original = new SessionBlueprint('W', [weighted('Squat')], 'notes');
    const modified = new SessionBlueprint(
      'W2',
      [
        makeWeightedBlueprint({
          name: 'Squat',
          sets: 5,
          repsConfig: { type: 'fixed', reps: 8 },
          progression: [],
          restBetweenSets: Rest.long,
          supersetWithNext: true,
          notes: 'note',
          link: 'link',
        }),
      ],
      'notes2',
    );

    const result = applySessionBlueprintDiff(original, diffSessionBlueprints(original, modified));

    expect(result.equals(modified)).toBe(true);
  });
});

// ─── getChangeLabelKey / description exhaustiveness ───────────────────────────

describe('change label and description mapping', () => {
  const t: UseTranslateResult['t'] = (key, params?) => ({ key, params }) as unknown as string;
  const weighted = (
    name: string,
    progression: ProgressionRule[] = [ProgressionRule.load(BigNumber(2.5))],
    supersetWithNext = false,
    notes = '',
    link = '',
  ): WeightedExerciseBlueprint =>
    makeWeightedBlueprint({
      name,
      repsConfig: { type: 'fixed', reps: 10 },
      progression,
      supersetWithNext,
      notes,
      link,
    });

  it('produces a non-empty label key and description for every change kind', () => {
    const original = new SessionBlueprint('Workout', [weighted('Squat'), weighted('Bench')], 'notes');
    const modified = new SessionBlueprint(
      'Renamed',
      [
        weighted('Bench'), // reordered
        weighted(
          'Squat',
          [ProgressionRule.load(BigNumber(5), { type: 'lowestSets', pick: 'last' })],
          true,
          'new note',
          'new link',
        ),
        weighted('Deadlift'), // added
      ],
      'new notes',
    );

    const diff = diffSessionBlueprints(original, modified);
    expect(diff.allChanges.length).toBeGreaterThan(0);

    for (const change of diff.allChanges) {
      const label = getChangeLabelKey(change) as unknown as { key: string };
      expect(label.key).toBeTruthy();
      const description = getChangeDescription(t, change) as unknown as { key: string };
      expect(description.key).toBeTruthy();
    }
  });

  it('describes every progression arrangement, including a multi-rule ladder', () => {
    const cases: ProgressionRule[][] = [
      [],
      [ProgressionRule.load(BigNumber(2.5))],
      [ProgressionRule.load(BigNumber(5), { type: 'lowestSets', pick: 'all' })],
      [ProgressionRule.load(BigNumber(5), { type: 'lowestSets', pick: 'first' })],
      [ProgressionRule.load(BigNumber(5), { type: 'lowestSets', pick: 'middle' })],
      [ProgressionRule.load(BigNumber(5), { type: 'lowestSets', pick: 'last' })],
      [
        ProgressionRule.of({ axis: 'reps', step: BigNumber(1), ceiling: BigNumber(12), onCeiling: 'reset' }),
        ProgressionRule.load(BigNumber(2.5)),
      ],
    ];

    for (const progression of cases) {
      const original = new SessionBlueprint('W', [weighted('Squat', [ProgressionRule.load(BigNumber(1))])], '');
      const modified = new SessionBlueprint('W', [weighted('Squat', progression)], '');
      const diff = diffSessionBlueprints(original, modified);
      const change = diff.modifiedExercises[0]!.changes.find((c) => c.kind === 'progression')!;
      const description = getChangeDescription(t, change) as unknown as { key: string };
      expect(description.key).toBeTruthy();
    }
  });
});
