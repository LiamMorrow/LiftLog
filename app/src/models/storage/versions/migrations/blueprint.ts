import {
  ProgramBlueprintJSON,
  SessionBlueprintJSON,
} from '@/models/storage/versions/v1';
import { createMigrations } from './migrator';
import { addProgressiveOverloadToExercise } from '@/models/storage/versions/migrations/steps/add-progressive-overload';

export const sessionBlueprintMigrations =
  createMigrations<SessionBlueprintJSON>()
    .build();

export const programBlueprintMigrations =
  createMigrations<ProgramBlueprintJSON>()
    .build();
