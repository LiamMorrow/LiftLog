import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { ExerciseDescriptor } from '@/models/exercise-models';
import { CardioExerciseBlueprint, SessionBlueprint, WeightedExerciseBlueprint } from '@/models/blueprint-models';
import {
  analyseMuscleVolume,
  indexDescriptorsByName,
  plannedExerciseSets,
  secondaryMuscleWeight,
} from '@/utils/muscle-volume';

function descriptor(name: string, muscles: string[], secondaryMuscles?: string[]): ExerciseDescriptor {
  return {
    name,
    force: null,
    level: 'beginner',
    mechanic: null,
    equipment: null,
    muscles,
    secondaryMuscles,
    instructions: '',
    category: '',
  };
}

const allMuscles = ['chest', 'triceps', 'shoulders', 'calves'];
const index = indexDescriptorsByName({
  'Bench Press': descriptor('Bench Press', ['chest', 'triceps', 'shoulders'], ['triceps', 'shoulders']),
  'user-uuid': descriptor('Dips', ['triceps', 'chest'], ['chest']),
  'no-muscles': descriptor('Mystery', []),
});

function setsOf(analysis: ReturnType<typeof analyseMuscleVolume>) {
  return Object.fromEntries(analysis.muscles.map((m) => [m.muscle, m.sets]));
}

describe('analyseMuscleVolume', () => {
  it('counts primary sets fully and secondary sets at half', () => {
    const analysis = analyseMuscleVolume(
      [
        { name: 'Bench Press', sets: 3 },
        { name: 'Dips', sets: 4 },
      ],
      index,
      allMuscles,
    );

    expect(setsOf(analysis)).toEqual({ chest: 5, triceps: 5.5, shoulders: 1.5, calves: 0 });
    expect(analysis.muscles.map((m) => m.muscle)).toEqual(['triceps', 'chest', 'shoulders', 'calves']);
  });

  it('matches by normalised name or by built-in id, and merges repeats of the same exercise', () => {
    const analysis = analyseMuscleVolume(
      [
        { name: ' bench press ', sets: 3 },
        { name: 'Bench Press', sets: 2 },
      ],
      index,
      allMuscles,
    );

    const chest = analysis.muscles.find((m) => m.muscle === 'chest')!;
    expect(chest.contributions).toEqual([{ exerciseName: ' bench press ', sets: 5, secondary: false }]);
  });

  it('matches across plurals and punctuation, preferring a descriptor that has muscles', () => {
    const looseIndex = indexDescriptorsByName({
      'Smith Machine Calf Raise': descriptor('Smith Machine Calf Raise', ['calves']),
      'Smith Machine Close-Grip Bench Press': descriptor('Smith Machine Close-Grip Bench Press', ['triceps']),
      'user-uuid': descriptor('Bench Press', []),
      'Bench Press': descriptor('Bench Press', ['chest']),
    });

    const analysis = analyseMuscleVolume(
      [
        { name: 'Smith machine calf raises', sets: 1 },
        { name: 'Smith Machine Close Grip Bench Press', sets: 1 },
        { name: 'Bench Presses', sets: 1 },
      ],
      looseIndex,
      allMuscles,
    );

    expect(analysis.unmatchedExercises).toEqual([]);
    expect(setsOf(analysis)).toMatchObject({ calves: 1, triceps: 1, chest: 1 });
  });

  it('reports exercises with no descriptor or no muscles, once each', () => {
    const analysis = analyseMuscleVolume(
      [
        { name: 'Mystery', sets: 3 },
        { name: 'Unknown Lift', sets: 3 },
        { name: 'unknown lift', sets: 3 },
      ],
      index,
      allMuscles,
    );

    expect(analysis.unmatchedExercises).toEqual([
      { name: 'Mystery', exerciseId: 'no-muscles' },
      { name: 'Unknown Lift', exerciseId: undefined },
    ]);
    expect(analysis.muscles.every((m) => m.sets === 0)).toBe(true);
  });

  it('never lowers a muscle when a set is added', () => {
    const names = fc.constantFrom('Bench Press', 'Dips', 'Mystery', 'Other');
    fc.assert(
      fc.property(
        fc.array(fc.record({ name: names, sets: fc.integer({ min: 0, max: 10 }) })),
        names,
        (exercises, extra) => {
          const before = setsOf(analyseMuscleVolume(exercises, index, allMuscles));
          const after = setsOf(analyseMuscleVolume([...exercises, { name: extra, sets: 1 }], index, allMuscles));
          return allMuscles.every((muscle) => after[muscle]! >= before[muscle]!);
        },
      ),
    );
  });

  it('weights a secondary muscle at a fixed fraction of a primary one', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 20 }), (sets) => {
        const volume = setsOf(analyseMuscleVolume([{ name: 'Bench Press', sets }], index, allMuscles));
        return volume.triceps === volume.chest! * secondaryMuscleWeight;
      }),
    );
  });
});

describe('plannedExerciseSets', () => {
  it('counts planned sets of weighted exercises and skips cardio', () => {
    const sessions = [
      new SessionBlueprint(
        'Push',
        [
          WeightedExerciseBlueprint.of({ name: 'Bench Press', sets: 4 }),
          CardioExerciseBlueprint.empty().with({ name: 'Run' }),
        ],
        '',
      ),
    ];

    expect(plannedExerciseSets(sessions)).toEqual([{ name: 'Bench Press', sets: 4 }]);
  });
});
