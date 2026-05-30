import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import {
  exercisesSchema,
  feedFollowedUsersSchema,
  feedFollowerUsersSchema,
  feedFollowRequestsSchema,
  feedIdentitySchema,
  feedItemsSchema,
  programsSchema,
  sessionsSchema,
} from '@/db/schema';
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
      await tx
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
      await tx
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
      await tx
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
export async function updateFeedIdentityToLatestVersion(
  db: ExpoSQLiteDatabase,
) {
  await db.transaction(async (tx) => {
    const recordsRequiringMigration = await tx
      .select()
      .from(feedIdentitySchema)
      .where(lt(feedIdentitySchema.modelVersion, LatestVersion));

    for (const record of recordsRequiringMigration) {
      await tx
        .update(feedIdentitySchema)
        .set({
          modelVersion: LatestVersion,
          payload: MigratorVAnyToLatest.migrateFeedIdentity(
            record.modelVersion,
            record.payload,
          ),
        })
        .where(eq(feedIdentitySchema.id, record.id));
    }
  });
}

export async function updateFeedFollowedUsersToLatestVersion(
  db: ExpoSQLiteDatabase,
) {
  await db.transaction(async (tx) => {
    const recordsRequiringMigration = await tx
      .select()
      .from(feedFollowedUsersSchema)
      .where(lt(feedFollowedUsersSchema.modelVersion, LatestVersion));

    for (const record of recordsRequiringMigration) {
      await tx
        .update(feedFollowedUsersSchema)
        .set({
          modelVersion: LatestVersion,
          payload: MigratorVAnyToLatest.migrateFollowedFeedUser(
            record.modelVersion,
            record.payload,
          ),
        })
        .where(eq(feedFollowedUsersSchema.id, record.id));
    }
  });
}

export async function updateFeedItemsToLatestVersion(db: ExpoSQLiteDatabase) {
  await db.transaction(async (tx) => {
    const recordsRequiringMigration = await tx
      .select()
      .from(feedItemsSchema)
      .where(lt(feedItemsSchema.modelVersion, LatestVersion));

    for (const record of recordsRequiringMigration) {
      await tx
        .update(feedItemsSchema)
        .set({
          modelVersion: LatestVersion,
          payload: MigratorVAnyToLatest.migrateFeedSessionUserEvent(
            record.modelVersion,
            record.payload,
          ),
        })
        .where(eq(feedItemsSchema.id, record.id));
    }
  });
}

export async function updateFeedFollowerUsersToLatestVersion(
  db: ExpoSQLiteDatabase,
) {
  await db.transaction(async (tx) => {
    const recordsRequiringMigration = await tx
      .select()
      .from(feedFollowerUsersSchema)
      .where(lt(feedFollowerUsersSchema.modelVersion, LatestVersion));

    for (const record of recordsRequiringMigration) {
      await tx
        .update(feedFollowerUsersSchema)
        .set({
          modelVersion: LatestVersion,
          payload: MigratorVAnyToLatest.migrateFollowerFeedUser(
            record.modelVersion,
            record.payload,
          ),
        })
        .where(eq(feedFollowerUsersSchema.id, record.id));
    }
  });
}

export async function updateFeedFollowRequestsToLatestVersion(
  db: ExpoSQLiteDatabase,
) {
  await db.transaction(async (tx) => {
    const recordsRequiringMigration = await tx
      .select()
      .from(feedFollowRequestsSchema)
      .where(lt(feedFollowRequestsSchema.modelVersion, LatestVersion));

    for (const record of recordsRequiringMigration) {
      await tx
        .update(feedFollowRequestsSchema)
        .set({
          modelVersion: LatestVersion,
          payload: MigratorVAnyToLatest.migrateFeedFollowRequest(
            record.modelVersion,
            record.payload,
          ),
        })
        .where(eq(feedFollowRequestsSchema.id, record.id));
    }
  });
}
