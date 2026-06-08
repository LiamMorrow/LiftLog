import {
  ProgramBlueprintJSON,
  SessionBlueprintJSON,
} from '@/models/storage/versions/v1';
import { createMigrations } from './migrator';
import { addProgressiveOverloadToExercise } from '@/models/storage/versions/migrations/steps/add-progressive-overload';

export const sessionBlueprintMigrations =
  createMigrations<SessionBlueprintJSON>()
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
    .build();

export const programBlueprintMigrations =
  createMigrations<ProgramBlueprintJSON>()
    .add((value) => ({
      version: 2,
      lastEdited: value.lastEdited,
      name: value.name,
      sessions: value.sessions.map((session) =>
        sessionBlueprintMigrations.migrateUntil(session, 2),
      ),
    }))
    .build();
