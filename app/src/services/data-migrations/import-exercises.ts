import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { KeyValueStore } from '../key-value-store';
import { dataMigrationsSchema, exercisesSchema } from '@/db/schema';
import { ExerciseDescriptor } from '@/models/exercise-models';
import { exerciseDescriptorMigrations } from '@/models/storage/versions/migrations';

export const importExercisesDataMigration = 'IMPORT_EXERCISES';

const storageKey = 'ExerciseList';
export async function importExercises(db: ExpoSQLiteDatabase, keyValueStore: KeyValueStore) {
  const savedExercises = JSON.parse((await keyValueStore.getItem(storageKey)) ?? '{}') as Record<
    string,
    ExerciseDescriptor
  >;
  const converted: (typeof exercisesSchema.$inferInsert)[] = Object.entries(savedExercises).map(
    ([id, pojo]) =>
      ({
        id,
        payload: exerciseDescriptorMigrations.migrate(pojo),
      }) satisfies typeof exercisesSchema.$inferInsert,
  );

  await db.transaction(async (tx) => {
    if (converted.length) {
      await tx.insert(exercisesSchema).values(converted);
    }
    await tx.insert(dataMigrationsSchema).values({ id: importExercisesDataMigration });
  });
}
