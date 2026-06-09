import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { KeyValueStore } from '../key-value-store';
import {
  dataMigrationsSchema,
  feedFollowedUsersSchema,
  feedFollowerUsersSchema,
  feedFollowRequestsSchema,
  feedIdentitySchema,
  feedItemsSchema,
  feedRevokedFollowSecretsSchema,
} from '@/db/schema';
import { MigratorVAnyToLatest } from '@/models/storage/versions/migrator';
import { LatestVersion } from '@/models/storage/versions/latest';
import { LiftLog } from '@/gen/proto';
import { ProtobufToJsonV1Migrator } from '@/models/storage/versions/v1/protobuf-migrator';
import { SessionUserEvent } from '@/models/feed-models';

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
      payload: MigratorVAnyToLatest.migrateFeedIdentity(
        ProtobufToJsonV1Migrator.migrateFeedIdentity(decoded.identity),
      ),
      modelVersion: LatestVersion,
    }
  );
}

function getFollowers(
  decoded: LiftLog.Ui.Models.FeedStateDaoV1,
): (typeof feedFollowerUsersSchema.$inferInsert)[] {
  return decoded.followers.map((x) => ({
    id: ProtobufToJsonV1Migrator.migrateUuid(x.id),
    payload: MigratorVAnyToLatest.migrateFollowerFeedUser(
      ProtobufToJsonV1Migrator.migrateFollowerUser(x),
    ),
    modelVersion: LatestVersion,
  }));
}

function getFollowedUsers(decoded: LiftLog.Ui.Models.FeedStateDaoV1) {
  return decoded.followedUsers.map((x) => ({
    id: ProtobufToJsonV1Migrator.migrateUuid(x.id),
    payload: MigratorVAnyToLatest.migrateFollowedFeedUser(
      ProtobufToJsonV1Migrator.migrateFollowedUser(x),
    ),
    modelVersion: LatestVersion,
  }));
}

function getFollowRequests(decoded: LiftLog.Ui.Models.FeedStateDaoV1) {
  return decoded.followRequests.map((x) => ({
    id: ProtobufToJsonV1Migrator.migrateUuid(x.fromUserId),
    payload: MigratorVAnyToLatest.migrateFeedFollowRequest(
      ProtobufToJsonV1Migrator.migrateFollowRequest(x),
    ),
    modelVersion: LatestVersion,
  }));
}

function getFeedItems(decoded: LiftLog.Ui.Models.FeedStateDaoV1) {
  return decoded.feedItems.map((x) => {
    const payload = MigratorVAnyToLatest.migrateFeedSessionUserEvent(
      ProtobufToJsonV1Migrator.migrateSessionUserEvent(x),
    );

    return {
      id: SessionUserEvent.fromJSON(payload).id,
      payload,
      modelVersion: LatestVersion,
    };
  });
}
