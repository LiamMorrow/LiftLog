import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { dataMigrationsSchema, exercisesSchema, sessionsSchema } from '@/db/schema';
import Enumerable from 'linq';
import { NormalizedName } from '@/models/blueprint-models';
import { fromRecordedExerciseJSON } from '@/models/session-models';
import { ExerciseDescriptorJSON } from '@/models/storage/versions/initial';
import { uuid } from '@/utils/uuid';
import { exerciseDescriptorMigrations, sessionMigrations } from '@/models/storage/versions/migrations';

export const importExercisesFromWorkoutsDataMigration = 'IMPORT_EXERCISES_FROM_WORKOUTS';

export async function importExercisesFromWorkouts(db: ExpoSQLiteDatabase) {
  await db.transaction(async (tx) => {
    const workouts = (await tx.select().from(sessionsSchema)).map((row) => sessionMigrations.migrate(row.payload));
    const existingExerciseNames = new Set(
      (await tx.select().from(exercisesSchema))
        .map((row) => exerciseDescriptorMigrations.migrate(row.payload))
        .map((x) => new NormalizedName(x.name).toString()),
    );
    const uniqueExercisesNotInList = Enumerable.from(workouts)
      .selectMany((x) => x.recordedExercises)
      .select(fromRecordedExerciseJSON)
      .where((x) => !existingExerciseNames.has(NormalizedName.fromExerciseBlueprint(x.blueprint).toString()))
      .distinct((x) => NormalizedName.fromExerciseBlueprint(x.blueprint).toString());

    const newExercises = uniqueExercisesNotInList
      .select(
        (ex) =>
          ({
            name: ex.blueprint.name,
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
      await tx.insert(exercisesSchema).values(newExercises);
    }

    await tx.insert(dataMigrationsSchema).values({ id: importExercisesFromWorkoutsDataMigration });
  });
}
