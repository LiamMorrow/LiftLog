import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { KeyValueStore } from '../key-value-store';
import { dataMigrationsSchema, exercisesSchema } from '@/db/schema';
import { MigratorVAnyToLatest } from '@/models/storage/versions/migrator';
import { LatestVersion } from '@/models/storage/versions/latest';
import { ExerciseDescriptor } from '@/models/exercise-models';

export const importExercisesDataMigration = 'IMPORT_EXERCISES';

const storageKey = 'ExerciseList';
export async function importExercises(
  db: ExpoSQLiteDatabase,
  keyValueStore: KeyValueStore,
) {
  const savedExercises = JSON.parse(
    (await keyValueStore.getItem(storageKey)) ?? '{}',
  ) as Record<string, ExerciseDescriptor>;
  const converted: (typeof exercisesSchema.$inferInsert)[] = Object.entries(
    savedExercises,
  ).map(
    ([id, pojo]) =>
      ({
        id,
        payload: MigratorVAnyToLatest.migrateExerciseDescriptor(1, pojo),
        modelVersion: LatestVersion,
      }) satisfies typeof exercisesSchema.$inferInsert,
  );

  await db.transaction(async (tx) => {
    if (converted.length) await tx.insert(exercisesSchema).values(converted);
    await tx
      .insert(dataMigrationsSchema)
      .values({ id: importExercisesDataMigration });
  });
}
