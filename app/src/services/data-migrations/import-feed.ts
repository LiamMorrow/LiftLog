import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { KeyValueStore } from '../key-value-store';
import {
  dataMigrationsSchema,
  feedFollowRequestsSchema,
  feedFriendsSchema,
  feedIdentitySchema,
  feedItemsSchema,
  feedRevokedFollowSecretsSchema,
} from '@/db/schema';
import { mergeLegacyRelationships } from '@/models/storage/versions/migrations/steps/merge-legacy-relationships';
import { LiftLog } from '@/gen/proto';
import { ProtobufToJsonV1Migrator } from '@/models/storage/versions/initial/protobuf-migrator';
import { SessionUserEvent } from '@/models/feed-models';
import {
  followRequestInboxMessageMigrations,
  feedIdentityMigrations,
  sessionUserEventMigrations,
} from '@/models/storage/versions/migrations';

export const importFeedDataMigration = 'IMPORT_FEED';

const storageKey = 'FeedState';
export async function importFeed(db: ExpoSQLiteDatabase, keyValueStore: KeyValueStore) {
  const feedStateBytes = await keyValueStore.getItemBytes(storageKey);
  if (!feedStateBytes) {
    return;
  }
  const decoded = LiftLog.Ui.Models.FeedStateDaoV1.decode(feedStateBytes);
  const convertedIdentity = getIdentity(decoded);
  const { friends, secretsToRevoke } = mergeLegacyRelationships({
    ownId: convertedIdentity?.payload.id,
    followed: decoded.followedUsers.map((x) => ProtobufToJsonV1Migrator.migrateFollowedUser(x)),
    pending: [],
    followers: decoded.followers.map((x) => ProtobufToJsonV1Migrator.migrateFollowerUser(x)),
  });
  const convertedFeedItems = getFeedItems(decoded);
  const convertedFollowRequests = getFollowRequests(decoded);
  const revokedSecrets = [...new Set([...decoded.revokedFollowSecrets, ...secretsToRevoke])];

  db.transaction((tx) => {
    if (convertedIdentity) {
      tx.insert(feedIdentitySchema).values(convertedIdentity).run();
    }
    if (friends.length) {
      tx.insert(feedFriendsSchema)
        .values(friends.map((payload) => ({ id: payload.id, payload })))
        .run();
    }
    if (convertedFeedItems.length) {
      tx.insert(feedItemsSchema).values(convertedFeedItems).run();
    }
    if (convertedFollowRequests.length) {
      tx.insert(feedFollowRequestsSchema).values(convertedFollowRequests).run();
    }
    if (revokedSecrets.length) {
      tx.insert(feedRevokedFollowSecretsSchema)
        .values(revokedSecrets.map((x) => ({ secret: x })))
        .run();
    }
    tx.insert(dataMigrationsSchema).values({ id: importFeedDataMigration }).run();
  });
}

function getIdentity(decoded: LiftLog.Ui.Models.FeedStateDaoV1) {
  return (
    decoded.identity && {
      id: 0,
      payload: feedIdentityMigrations.migrate(ProtobufToJsonV1Migrator.migrateFeedIdentity(decoded.identity)),
    }
  );
}

function getFollowRequests(decoded: LiftLog.Ui.Models.FeedStateDaoV1) {
  return decoded.followRequests.map((x) => ({
    id: ProtobufToJsonV1Migrator.migrateUuid(x.fromUserId),
    payload: followRequestInboxMessageMigrations.migrate(ProtobufToJsonV1Migrator.migrateFollowRequest(x)),
  }));
}

function getFeedItems(decoded: LiftLog.Ui.Models.FeedStateDaoV1) {
  return decoded.feedItems.map((x) => {
    const payload = sessionUserEventMigrations.migrate(ProtobufToJsonV1Migrator.migrateSessionUserEvent(x));

    return {
      id: SessionUserEvent.fromJSON(payload).id,
      payload,
    };
  });
}
