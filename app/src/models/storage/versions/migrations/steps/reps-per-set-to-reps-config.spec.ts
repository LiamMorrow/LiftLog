import { describe, it, expect } from 'vitest';
import { repsPerSetToRepsConfig } from './reps-per-set-to-reps-config';
import { programBlueprintMigrations } from '@/models/storage/versions/migrations';
import type { ProgramBlueprintJSON as InitialProgramBlueprintJSON } from '@/models/storage/versions/initial';
import type { BigNumberJSON, DurationJSON, LocalDateJSON } from '@/models/storage/versions/libs';

describe('repsPerSetToRepsConfig', () => {
  it('wraps a scalar repsPerSet in a fixed repsConfig and drops the old field', () => {
    const result = repsPerSetToRepsConfig({ name: 'Squat', sets: 3, repsPerSet: 8 });
    expect(result.repsConfig).toEqual({ type: 'fixed', reps: 8 });
    expect('repsPerSet' in result).toBe(false);
  });
});

describe('programBlueprintMigrations to v3', () => {
  it('migrates a legacy repsPerSet blueprint to a fixed repsConfig', () => {
    const legacy: InitialProgramBlueprintJSON = {
      name: 'Legacy',
      lastEdited: '2024-01-01' as LocalDateJSON,
      sessions: [
        {
          name: 'Day 1',
          notes: '',
          exercises: [
            {
              type: 'WeightedExerciseBlueprint',
              name: 'Squat',
              sets: 3,
              repsPerSet: 5,
              weightIncreaseOnSuccess: '2.5' as BigNumberJSON,
              restBetweenSets: {
                minRest: 'PT1M' as DurationJSON,
                maxRest: 'PT3M' as DurationJSON,
                failureRest: 'PT5M' as DurationJSON,
              },
              supersetWithNext: false,
              notes: '',
              link: '',
            },
          ],
        },
      ],
    };

    const migrated = programBlueprintMigrations.migrate(legacy);

    expect(migrated.version).toBe(3);
    const exercise = migrated.sessions[0]!.exercises[0]!;
    expect(exercise.type).toBe('WeightedExerciseBlueprint');
    if (exercise.type === 'WeightedExerciseBlueprint') {
      expect(exercise.repsConfig).toEqual({ type: 'fixed', reps: 5 });
      expect('repsPerSet' in exercise).toBe(false);
    }
  });
});
