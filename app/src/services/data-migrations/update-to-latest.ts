import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import {
  exercisesSchema,
  feedFollowedUsersSchema,
  feedFollowerUsersSchema,
  feedFollowRequestsSchema,
  feedIdentitySchema,
  feedItemsSchema,
  feedPendingUsersSchema,
  programsSchema,
  sessionsSchema,
} from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { sessionMigrations } from '@/models/storage/versions/migrations/session';
import {
  exerciseDescriptorMigrations,
  followRequestInboxMessageMigrations,
  feedIdentityMigrations,
  sessionUserEventMigrations,
  followedFeedUserMigrations,
  followerFeedUserMigrations,
  programBlueprintMigrations,
  pendingFeedUserMigrations,
} from '@/models/storage/versions/migrations';

export async function updateSessionsToLatestVersion(db: ExpoSQLiteDatabase) {
  await db.transaction(async (tx) => {
    const sessionsRequiringMigration = await tx
      .select()
      .from(sessionsSchema)
      .where(
        sql`COALESCE(json_extract(${sessionsSchema.payload}, '$.version'), 1) < ${sessionMigrations.latestVersion}`,
      );
    for (const session of sessionsRequiringMigration) {
      await tx
        .update(sessionsSchema)
        .set({
          payload: sessionMigrations.migrate(session.payload),
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
      .where(
        sql`COALESCE(json_extract(${programsSchema.payload}, '$.version'), 1) < ${programBlueprintMigrations.latestVersion}`,
      );
    for (const program of programsRequiringMigration) {
      await tx
        .update(programsSchema)
        .set({
          payload: programBlueprintMigrations.migrate(program.payload),
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
      .where(
        sql`COALESCE(json_extract(${exercisesSchema.payload}, '$.version'), 1) < ${exerciseDescriptorMigrations.latestVersion}`,
      );
    for (const program of programsRequiringMigration) {
      await tx
        .update(exercisesSchema)
        .set({
          payload: exerciseDescriptorMigrations.migrate(program.payload),
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
      .where(
        sql`COALESCE(json_extract(${feedIdentitySchema.payload}, '$.version'), 1) < ${feedIdentityMigrations.latestVersion}`,
      );

    for (const record of recordsRequiringMigration) {
      await tx
        .update(feedIdentitySchema)
        .set({
          payload: feedIdentityMigrations.migrate(record.payload),
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
      .where(
        sql`COALESCE(json_extract(${feedFollowedUsersSchema.payload}, '$.version'), 1) < ${followedFeedUserMigrations.latestVersion}`,
      );

    for (const record of recordsRequiringMigration) {
      await tx
        .update(feedFollowedUsersSchema)
        .set({
          payload: followedFeedUserMigrations.migrate(record.payload),
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
      .where(
        sql`COALESCE(json_extract(${feedItemsSchema.payload}, '$.version'), 1) < ${sessionUserEventMigrations.latestVersion}`,
      );

    for (const record of recordsRequiringMigration) {
      await tx
        .update(feedItemsSchema)
        .set({
          payload: sessionUserEventMigrations.migrate(record.payload),
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
      .where(
        sql`COALESCE(json_extract(${feedFollowerUsersSchema.payload}, '$.version'), 1) < ${followerFeedUserMigrations.latestVersion}`,
      );

    for (const record of recordsRequiringMigration) {
      await tx
        .update(feedFollowerUsersSchema)
        .set({
          payload: followerFeedUserMigrations.migrate(record.payload),
        })
        .where(eq(feedFollowerUsersSchema.id, record.id));
    }
  });
}

export async function updateFeedPendingUsersToLatestVersion(
  db: ExpoSQLiteDatabase,
) {
  await db.transaction(async (tx) => {
    const recordsRequiringMigration = await tx
      .select()
      .from(feedPendingUsersSchema)
      .where(
        sql`COALESCE(json_extract(${feedPendingUsersSchema.payload}, '$.version'), 1) < ${pendingFeedUserMigrations.latestVersion}`,
      );

    for (const record of recordsRequiringMigration) {
      await tx
        .update(feedPendingUsersSchema)
        .set({
          payload: pendingFeedUserMigrations.migrate(record.payload),
        })
        .where(eq(feedPendingUsersSchema.id, record.id));
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
      .where(
        sql`COALESCE(json_extract(${feedFollowRequestsSchema.payload}, '$.version'), 1) < ${followRequestInboxMessageMigrations.latestVersion}`,
      );

    for (const record of recordsRequiringMigration) {
      await tx
        .update(feedFollowRequestsSchema)
        .set({
          payload: followRequestInboxMessageMigrations.migrate(record.payload),
        })
        .where(eq(feedFollowRequestsSchema.id, record.id));
    }
  });
}
