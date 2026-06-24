import { createMigrations } from '@/models/storage/versions/migrations/migrator';
import { ExerciseDescriptorJSON as InitialExerciseDescriptorJSON } from '@/models/storage/versions/initial';
import { ExerciseDescriptorJSON } from '@/models/storage/versions/latest/exercise-descriptor';

export const exerciseDescriptorMigrations =
  createMigrations<InitialExerciseDescriptorJSON>().build<ExerciseDescriptorJSON>();
