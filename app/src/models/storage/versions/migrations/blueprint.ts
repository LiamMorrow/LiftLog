import {
  ProgramBlueprintJSON as InitialProgramBlueprintJSON,
  SessionBlueprintJSON as InitialSessionBlueprintJSON,
} from '@/models/storage/versions/initial';
import { ProgramBlueprintJSON, SessionBlueprintJSON } from '@/models/storage/versions/latest/blueprint';
import { createMigrations } from './migrator';
import { addProgressiveOverloadToExercise } from '@/models/storage/versions/migrations/steps/add-progressive-overload';
import { repsPerSetToRepsConfig } from '@/models/storage/versions/migrations/steps/reps-per-set-to-reps-config';

export const sessionBlueprintMigrations = createMigrations<InitialSessionBlueprintJSON>()
  .add((value) => ({
    version: 2 as const,
    exercises: value.exercises.map((x) =>
      x.type === 'WeightedExerciseBlueprint' ? addProgressiveOverloadToExercise(x) : x,
    ),
    name: value.name,
    notes: value.notes,
  }))
  .add((value) => ({
    version: 3 as const,
    exercises: value.exercises.map((x) => (x.type === 'WeightedExerciseBlueprint' ? repsPerSetToRepsConfig(x) : x)),
    name: value.name,
    notes: value.notes,
  }))
  .build<SessionBlueprintJSON>();

export const programBlueprintMigrations = createMigrations<InitialProgramBlueprintJSON>({ pseudoMigrateUntil: 3 })
  .dependsOn({
    sessions: sessionBlueprintMigrations,
  })
  .build<ProgramBlueprintJSON>();
