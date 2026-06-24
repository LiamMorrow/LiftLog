import {
  ProgramBlueprintJSON as InitialProgramBlueprintJSON,
  SessionBlueprintJSON as InitialSessionBlueprintJSON,
} from '@/models/storage/versions/initial';
import {
  ProgramBlueprintJSON,
  SessionBlueprintJSON,
} from '@/models/storage/versions/latest/blueprint';
import { createMigrations } from './migrator';
import { addProgressiveOverloadToExercise } from '@/models/storage/versions/migrations/steps/add-progressive-overload';

export const sessionBlueprintMigrations =
  createMigrations<InitialSessionBlueprintJSON>()
    .add((value) => ({
      version: 2 as const,
      exercises: value.exercises.map((x) =>
        x.type === 'WeightedExerciseBlueprint'
          ? addProgressiveOverloadToExercise(x)
          : x,
      ),
      name: value.name,
      notes: value.notes,
    }))
    .build<SessionBlueprintJSON>();

export const programBlueprintMigrations =
  createMigrations<InitialProgramBlueprintJSON>()
    .add((value) => ({
      version: 2,
      lastEdited: value.lastEdited,
      name: value.name,
      sessions: value.sessions.map((session) =>
        sessionBlueprintMigrations.migrateUntil(session, 2),
      ),
    }))
    .build<ProgramBlueprintJSON>();
