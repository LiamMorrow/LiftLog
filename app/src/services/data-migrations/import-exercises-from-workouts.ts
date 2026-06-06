import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import {
  dataMigrationsSchema,
  exercisesSchema,
  sessionsSchema,
} from '@/db/schema';
import { MigratorVAnyToLatest } from '@/models/storage/versions/migrator';
import Enumerable from 'linq';
import { NormalizedName } from '@/models/blueprint-models';
import { fromRecordedExerciseJSON } from '@/models/session-models';
import {
  ExerciseDescriptorJSON,
  LatestVersion,
} from '@/models/storage/versions/latest';
import { uuid } from '@/utils/uuid';

export const importExercisesFromWorkoutsDataMigration =
  'IMPORT_EXERCISES_FROM_WORKOUTS';

export async function importExercisesFromWorkouts(db: ExpoSQLiteDatabase) {
  await db.transaction(async (tx) => {
    const workouts = (await tx.select().from(sessionsSchema)).map((row) =>
      MigratorVAnyToLatest.migrateSession(row.payload),
    );
    const existingExerciseNames = new Set(
      (await tx.select().from(exercisesSchema))
        .map((row) =>
          MigratorVAnyToLatest.migrateExerciseDescriptor(row.payload),
        )
        .map((x) => new NormalizedName(x.name).toString()),
    );
    const uniqueExercisesNotInList = Enumerable.from(workouts)
      .selectMany((x) => x.recordedExercises)
      .select(fromRecordedExerciseJSON)
      .where(
        (x) =>
          !existingExerciseNames.has(
            NormalizedName.fromExerciseBlueprint(x.blueprint).toString(),
          ),
      )
      .distinct((x) =>
        NormalizedName.fromExerciseBlueprint(x.blueprint).toString(),
      );

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
            modelVersion: LatestVersion,
            payload,
          }) satisfies typeof exercisesSchema.$inferInsert,
      )
      .toArray();

    if (newExercises.length) {
      await tx.insert(exercisesSchema).values(newExercises);
    }

    await tx
      .insert(dataMigrationsSchema)
      .values({ id: importExercisesFromWorkoutsDataMigration });
  });
}
