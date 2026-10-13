import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { FriendJSON } from '@/models/storage/versions/initial';
import {
  LegacyFollowedUser,
  LegacyFollower,
  LegacyPendingUser,
  mergeLegacyRelationships,
} from '@/models/storage/versions/migrations/steps/merge-legacy-relationships';
import type { JsMigration } from '@/services/js-migrations';

const feedIdentity = sqliteTable('feed_identity', {
  id: integer().primaryKey(),
  payload: text({ mode: 'json' }).$type<{ id: string }>().notNull(),
});

const feedFollowedUser = sqliteTable('feed_followed_user', {
  id: text().primaryKey(),
  payload: text({ mode: 'json' }).$type<LegacyFollowedUser>().notNull(),
});

const feedPendingUser = sqliteTable('feed_pending_user', {
  id: text().primaryKey(),
  payload: text({ mode: 'json' }).$type<LegacyPendingUser>().notNull(),
});

const feedFollowerUser = sqliteTable('feed_follower_user', {
  id: text().primaryKey(),
  payload: text({ mode: 'json' }).$type<LegacyFollower>().notNull(),
});

const feedFriend = sqliteTable('feed_friend', {
  id: text().primaryKey(),
  payload: text({ mode: 'json' }).$type<FriendJSON>().notNull(),
});

const feedRevokedFollowSecrets = sqliteTable('feed_revoked_follow_secrets', {
  secret: text().primaryKey(),
});

export const mergeFollowsIntoFriends: JsMigration = {
  id: 'MERGE_FOLLOWS_INTO_FRIENDS',
  after: '0013_feed_friend',
  run: (tx) => {
    const { friends, secretsToRevoke } = mergeLegacyRelationships({
      ownId: tx.select().from(feedIdentity).get()?.payload.id,
      followed: tx
        .select()
        .from(feedFollowedUser)
        .all()
        .map((x) => x.payload),
      pending: tx
        .select()
        .from(feedPendingUser)
        .all()
        .map((x) => x.payload),
      followers: tx
        .select()
        .from(feedFollowerUser)
        .all()
        .map((x) => x.payload),
    });

    if (friends.length) {
      tx.insert(feedFriend)
        .values(friends.map((payload) => ({ id: payload.id, payload })))
        .onConflictDoNothing()
        .run();
    }
    if (secretsToRevoke.length) {
      tx.insert(feedRevokedFollowSecrets)
        .values(secretsToRevoke.map((secret) => ({ secret })))
        .onConflictDoNothing()
        .run();
    }
  },
};
