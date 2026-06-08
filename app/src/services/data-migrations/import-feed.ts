import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { KeyValueStore } from '../key-value-store';
import {
  dataMigrationsSchema,
  feedFollowedUsersSchema,
  feedFollowerUsersSchema,
  feedFollowRequestsSchema,
  feedIdentitySchema,
  feedItemsSchema,
  feedPendingUsersSchema,
  feedRevokedFollowSecretsSchema,
} from '@/db/schema';
import { LiftLog } from '@/gen/proto';
import { ProtobufToJsonV1Migrator } from '@/models/storage/versions/v1/protobuf-migrator';
import { SessionUserEvent } from '@/models/feed-models';
import {
  followRequestInboxMessageMigrations,
  feedIdentityMigrations,
  sessionUserEventMigrations,
  followedFeedUserMigrations,
  followerFeedUserMigrations,
  pendingFeedUserMigrations,
} from '@/models/storage/versions/migrations';

export const importFeedDataMigration = 'IMPORT_FEED';

const storageKey = 'FeedState';
export async function importFeed(
  db: ExpoSQLiteDatabase,
  keyValueStore: KeyValueStore,
) {
  const feedStateBytes = await keyValueStore.getItemBytes(storageKey);
  if (!feedStateBytes) {
    return;
  }
  const decoded = LiftLog.Ui.Models.FeedStateDaoV1.decode(feedStateBytes);
  const convertedIdentity = getIdentity(decoded);
  const convertedFollowers = getFollowers(decoded);
  const convertedPending = getPendingUsers(decoded);
  const convertedFollowedUsers = getFollowedUsers(decoded);
  const convertedFeedItems = getFeedItems(decoded);
  const convertedFollowRequests = getFollowRequests(decoded);

  await db.transaction(async (tx) => {
    if (convertedIdentity) {
      await tx.insert(feedIdentitySchema).values(convertedIdentity);
    }
    if (convertedFollowers.length) {
      await tx.insert(feedFollowerUsersSchema).values(convertedFollowers);
    }
    if (convertedPending.length) {
      await tx.insert(feedPendingUsersSchema).values(convertedPending);
    }
    if (convertedFollowedUsers.length) {
      await tx.insert(feedFollowedUsersSchema).values(convertedFollowedUsers);
    }
    if (convertedFeedItems.length) {
      await tx.insert(feedItemsSchema).values(convertedFeedItems);
    }
    if (convertedFollowRequests.length) {
      await tx.insert(feedFollowRequestsSchema).values(convertedFollowRequests);
    }
    if (decoded.revokedFollowSecrets.length) {
      await tx
        .insert(feedRevokedFollowSecretsSchema)
        .values(decoded.revokedFollowSecrets.map((x) => ({ secret: x })));
    }
    await tx
      .insert(dataMigrationsSchema)
      .values({ id: importFeedDataMigration });
  });
}

function getIdentity(decoded: LiftLog.Ui.Models.FeedStateDaoV1) {
  return (
    decoded.identity && {
      id: 0,
      payload: feedIdentityMigrations.migrate(
        ProtobufToJsonV1Migrator.migrateFeedIdentity(decoded.identity),
      ),
    }
  );
}

function getFollowers(
  decoded: LiftLog.Ui.Models.FeedStateDaoV1,
): (typeof feedFollowerUsersSchema.$inferInsert)[] {
  return decoded.followers.map((x) => ({
    id: ProtobufToJsonV1Migrator.migrateUuid(x.id),
    payload: followerFeedUserMigrations.migrate(
      ProtobufToJsonV1Migrator.migrateFollowerUser(x),
    ),
  }));
}

function getFollowedUsers(decoded: LiftLog.Ui.Models.FeedStateDaoV1) {
  return decoded.followedUsers
    .map((x) => ProtobufToJsonV1Migrator.migrateFollowedUser(x))
    .map((x) =>
      x.type === 'FollowedFeedUser'
        ? {
            id: x.id,
            payload: followedFeedUserMigrations.migrate(x),
          }
        : undefined,
    )
    .filter((x): x is NonNullable<typeof x> => !!x);
}
function getPendingUsers(decoded: LiftLog.Ui.Models.FeedStateDaoV1) {
  return decoded.followedUsers
    .map((x) => ProtobufToJsonV1Migrator.migrateFollowedUser(x))
    .map((x) =>
      x.type === 'PendingFeedUser'
        ? {
            id: x.id,
            payload: pendingFeedUserMigrations.migrate(x),
          }
        : undefined,
    )
    .filter((x): x is NonNullable<typeof x> => !!x);
}

function getFollowRequests(decoded: LiftLog.Ui.Models.FeedStateDaoV1) {
  return decoded.followRequests.map((x) => ({
    id: ProtobufToJsonV1Migrator.migrateUuid(x.fromUserId),
    payload: followRequestInboxMessageMigrations.migrate(
      ProtobufToJsonV1Migrator.migrateFollowRequest(x),
    ),
  }));
}

function getFeedItems(decoded: LiftLog.Ui.Models.FeedStateDaoV1) {
  return decoded.feedItems.map((x) => {
    const payload = sessionUserEventMigrations.migrate(
      ProtobufToJsonV1Migrator.migrateSessionUserEvent(x),
    );

    return {
      id: SessionUserEvent.fromJSON(payload).id,
      payload,
    };
  });
}
