import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { exercisesSchema, programsSchema, sessionsSchema } from '@/db/schema';
import { LatestVersion } from '@/models/storage/versions/latest';
import { eq, lt } from 'drizzle-orm';
import { MigratorVAnyToLatest } from '@/models/storage/versions/migrator';

export async function updateSessionsToLatestVersion(db: ExpoSQLiteDatabase) {
  await db.transaction(async (tx) => {
    const sessionsRequiringMigration = await tx
      .select()
      .from(sessionsSchema)
      .where(lt(sessionsSchema.modelVersion, LatestVersion));
    for (const session of sessionsRequiringMigration) {
      await db
        .update(sessionsSchema)
        .set({
          modelVersion: LatestVersion,
          payload: MigratorVAnyToLatest.migrateSession(
            session.modelVersion,
            session.payload,
          ),
        })
        .where(eq(sessionsSchema.id, session.id));
    }
  });
}

export async function updateProgramsToLatestVersion(db: ExpoSQLiteDatabase) {
  await db.transaction(async (tx) => {
    const programsRequiringMigration = await tx
      .select()
      .from(programsSchema)
      .where(lt(programsSchema.modelVersion, LatestVersion));
    for (const program of programsRequiringMigration) {
      await db
        .update(programsSchema)
        .set({
          modelVersion: LatestVersion,
          payload: MigratorVAnyToLatest.migrateProgram(
            program.modelVersion,
            program.payload,
          ),
        })
        .where(eq(programsSchema.id, program.id));
    }
  });
}

export async function updateExercisesToLatestVersion(db: ExpoSQLiteDatabase) {
  await db.transaction(async (tx) => {
    const programsRequiringMigration = await tx
      .select()
      .from(exercisesSchema)
      .where(lt(exercisesSchema.modelVersion, LatestVersion));
    for (const program of programsRequiringMigration) {
      await db
        .update(exercisesSchema)
        .set({
          modelVersion: LatestVersion,
          payload: MigratorVAnyToLatest.migrateExerciseDescriptor(
            program.modelVersion,
            program.payload,
          ),
        })
        .where(eq(exercisesSchema.id, program.id));
    }
  });
}
