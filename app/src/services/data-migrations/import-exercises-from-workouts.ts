import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { dataMigrationsSchema, exercisesSchema, recordedExercisesSchema } from '@/db/schema';
import Enumerable from 'linq';
import { normalizeExerciseName } from '@/models/blueprint-models';
import { ExerciseDescriptorJSON } from '@/models/storage/versions/initial';
import { uuid } from '@/utils/uuid';
import { exerciseDescriptorMigrations } from '@/models/storage/versions/migrations';

export const importExercisesFromWorkoutsDataMigration = 'IMPORT_EXERCISES_FROM_WORKOUTS';

export async function importExercisesFromWorkouts(db: ExpoSQLiteDatabase) {
  db.transaction((tx) => {
    const recordedExercises = tx
      .select({ name: recordedExercisesSchema.name, movementKey: recordedExercisesSchema.movementKey })
      .from(recordedExercisesSchema)
      .all();
    const existingExerciseNames = new Set(
      tx
        .select()
        .from(exercisesSchema)
        .all()
        .map((row) => exerciseDescriptorMigrations.migrate(row.payload))
        .map((x) => normalizeExerciseName(x.name)),
    );
    const uniqueExercisesNotInList = Enumerable.from(recordedExercises)
      .where((x) => !existingExerciseNames.has(normalizeExerciseName(x.name)))
      .distinct((x) => x.movementKey);

    const newExercises = uniqueExercisesNotInList
      .select(
        (ex) =>
          ({
            name: ex.name,
            category: 'Unknown',
            equipment: null,
            force: null,
            instructions: '',
            level: '',
            mechanic: '',
            muscles: [],
          }) satisfies ExerciseDescriptorJSON,
      )
      .select(
        (payload) =>
          ({
            id: uuid(),
            payload: exerciseDescriptorMigrations.migrate(payload),
          }) satisfies typeof exercisesSchema.$inferInsert,
      )
      .toArray();

    if (newExercises.length) {
      tx.insert(exercisesSchema).values(newExercises).run();
    }

    tx.insert(dataMigrationsSchema).values({ id: importExercisesFromWorkoutsDataMigration }).run();
  });
}
