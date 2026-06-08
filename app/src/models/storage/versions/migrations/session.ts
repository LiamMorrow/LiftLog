import { createMigrations } from '@/models/storage/versions/migrations/migrator';
import { addProgressiveOverloadToExercise } from '@/models/storage/versions/migrations/steps/add-progressive-overload';
import { SessionJSON } from '@/models/storage/versions/v1';
import { omit } from '@/utils/omit';

export const sessionMigrations = createMigrations<SessionJSON>()
  .build();
