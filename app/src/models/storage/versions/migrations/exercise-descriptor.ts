import { createMigrations } from '@/models/storage/versions/migrations/migrator';
import { ExerciseDescriptorJSON } from '@/models/storage/versions/v1';

export const exerciseDescriptorMigrations =
  createMigrations<ExerciseDescriptorJSON>().build();
