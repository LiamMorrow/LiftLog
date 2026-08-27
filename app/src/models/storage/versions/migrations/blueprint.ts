import {
  ProgramBlueprintJSON as InitialProgramBlueprintJSON,
  SessionBlueprintJSON as InitialSessionBlueprintJSON,
} from '@/models/storage/versions/initial';
import { ProgramBlueprintJSON, SessionBlueprintJSON } from '@/models/storage/versions/latest/blueprint';
import { createMigrations } from './migrator';
import { addProgressiveOverloadToExercise } from '@/models/storage/versions/migrations/steps/add-progressive-overload';
import { repsPerSetToRepsConfig } from '@/models/storage/versions/migrations/steps/reps-per-set-to-reps-config';
import { addUsesBodyweight } from '@/models/storage/versions/migrations/steps/add-uses-bodyweight';
import { repsConfigToPlannedSets } from '@/models/storage/versions/migrations/steps/reps-config-to-planned-sets';
import { progressiveOverloadToRules } from '@/models/storage/versions/migrations/steps/progressive-overload-to-rules';

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
  .add((value) => ({
    version: 4 as const,
    exercises: value.exercises.map((x) => (x.type === 'WeightedExerciseBlueprint' ? addUsesBodyweight(x) : x)),
    name: value.name,
    notes: value.notes,
  }))
  .add((value) => ({
    version: 5 as const,
    exercises: value.exercises.map((x) => (x.type === 'WeightedExerciseBlueprint' ? repsConfigToPlannedSets(x) : x)),
    name: value.name,
    notes: value.notes,
  }))
  .add((value) => ({
    version: 6 as const,
    exercises: value.exercises.map((x) => (x.type === 'WeightedExerciseBlueprint' ? progressiveOverloadToRules(x) : x)),
    name: value.name,
    notes: value.notes,
  }))
  .build<SessionBlueprintJSON>();

export const programBlueprintMigrations = createMigrations<InitialProgramBlueprintJSON>({ pseudoMigrateUntil: 3 })
  .dependsOn({
    sessions: sessionBlueprintMigrations,
  })
  .build<ProgramBlueprintJSON>();
