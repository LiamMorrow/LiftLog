import { FeedState } from '@/store/feed';
import { LiftLog } from '@/gen/proto';
import { RemoteData } from '@/models/remote';
import {
  FeedIdentity,
  FollowerFeedUser,
  FollowRequestInboxMessage,
  fromFeedUserJSON,
  SessionUserEvent,
} from '@/models/feed-models';
import { ProtobufToJsonV1Migrator } from '@/models/storage/versions/v1/protobuf-migrator';

export function fromFeedStateDao(dao: LiftLog.Ui.Models.IFeedStateDaoV1) {
  return {
    feed:
      dao.feedItems
        ?.map(ProtobufToJsonV1Migrator.migrateSessionUserEvent)
        .map(SessionUserEvent.fromJSON) ?? [],
    followedUsers:
      (dao.followedUsers &&
        Object.fromEntries(
          dao.followedUsers
            .map(ProtobufToJsonV1Migrator.migrateFollowedUser)
            .map(fromFeedUserJSON)
            .map((x) => [x.id, x] as const),
        )) ??
      {},
    identity:
      (dao.identity &&
        RemoteData.success(
          FeedIdentity.fromJSON(
            ProtobufToJsonV1Migrator.migrateFeedIdentity(dao.identity),
          ),
        )) ??
      RemoteData.notAsked(),
    followRequests:
      dao.followRequests
        ?.map(ProtobufToJsonV1Migrator.migrateFollowRequest)
        .map(FollowRequestInboxMessage.fromJSON) ?? [],
    followers:
      (dao.followers &&
        Object.fromEntries(
          dao.followers
            .map(ProtobufToJsonV1Migrator.migrateFollowerUser)
            .map(FollowerFeedUser.fromJSON)
            .map((x) => [x.id, x] as const),
        )) ??
      {},
    revokedFollowSecrets: dao.revokedFollowSecrets ?? [],
  } satisfies Partial<FeedState>;
}
