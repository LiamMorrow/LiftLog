import {
  AnyVersionExerciseDescriptorJSON,
  AnyVersionFeedIdentityJSON,
  AnyVersionFollowedFeedUserJSON,
  AnyVersionFollowerFeedUserJSON,
  AnyVersionFollowRequestInboxMessageJSON,
  AnyVersionPendingFeedUserJSON,
  AnyVersionProgramBlueprintJSON,
  AnyVersionReceivedReactionJSON,
  AnyVersionSentReactionJSON,
  AnyVersionSessionJSON,
  AnyVersionSessionUserEventJSON,
} from '@/models/storage/versions/any';
import { sql } from 'drizzle-orm';
import { check, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const sessionsSchema = sqliteTable('session', {
  id: text().primaryKey(),
  payload: text('payload', { mode: 'json' }).$type<AnyVersionSessionJSON>().notNull(),
});

export const exercisesSchema = sqliteTable('exercise', {
  id: text().primaryKey(),
  payload: text('payload', { mode: 'json' }).$type<AnyVersionExerciseDescriptorJSON>().notNull(),
});

export const programsSchema = sqliteTable(
  'program',
  {
    id: text().primaryKey(),
    active: integer({ mode: 'boolean' }).notNull(),
    payload: text('payload', { mode: 'json' }).$type<AnyVersionProgramBlueprintJSON>().notNull(),
  },
  (table) => [
    uniqueIndex('single_active_program')
      .on(table.active)
      .where(sql`${table.active} = 1`),
  ],
);

export const feedIdentitySchema = sqliteTable(
  'feed_identity',
  {
    id: integer().primaryKey(),
    payload: text('payload', { mode: 'json' }).$type<AnyVersionFeedIdentityJSON>().notNull(),
  },
  () => [check('single_feed_identity', sql`id = 0`)],
);

export const feedFollowedUsersSchema = sqliteTable('feed_followed_user', {
  id: text().primaryKey(),
  payload: text('payload', { mode: 'json' }).$type<AnyVersionFollowedFeedUserJSON>().notNull(),
});
export const feedPendingUsersSchema = sqliteTable('feed_pending_user', {
  id: text().primaryKey(),
  payload: text('payload', { mode: 'json' }).$type<AnyVersionPendingFeedUserJSON>().notNull(),
});
export const feedItemsSchema = sqliteTable('feed_items', {
  id: text().primaryKey(),
  payload: text('payload', { mode: 'json' }).$type<AnyVersionSessionUserEventJSON>().notNull(),
});

export const feedFollowerUsersSchema = sqliteTable('feed_follower_user', {
  id: text().primaryKey(),
  payload: text('payload', { mode: 'json' }).$type<AnyVersionFollowerFeedUserJSON>().notNull(),
});

export const feedFollowRequestsSchema = sqliteTable('feed_follow_request', {
  id: text().primaryKey(),
  payload: text('payload', { mode: 'json' }).$type<AnyVersionFollowRequestInboxMessageJSON>().notNull(),
});

// id is the reactionId, so a redelivered cheer upserts over itself instead of inflating the count.
export const feedReactionsSchema = sqliteTable('feed_reaction', {
  id: text().primaryKey(),
  payload: text('payload', { mode: 'json' }).$type<AnyVersionReceivedReactionJSON>().notNull(),
});

export const feedSentReactionsSchema = sqliteTable('feed_sent_reaction', {
  id: text().primaryKey(),
  payload: text('payload', { mode: 'json' }).$type<AnyVersionSentReactionJSON>().notNull(),
});

export const feedRevokedFollowSecretsSchema = sqliteTable('feed_revoked_follow_secrets', {
  secret: text().primaryKey(),
});
export const feedUnpublishedSessionsSchema = sqliteTable('feed_unpublished_sessions', {
  sessionId: text().primaryKey(),
});

// Just a table we can use to keep track of which data migrations have been run
export const dataMigrationsSchema = sqliteTable('data_migration', {
  id: text().primaryKey(),
});
