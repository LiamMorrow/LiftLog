import { FeedState } from '@/store/feed';
import { LiftLog } from '@/gen/proto';
import { fromUuidDao } from '@/models/storage/conversions.from-dao';
import { RemoteData } from '@/models/remote';
import {
  FeedIdentity,
  FeedItem,
  FeedUser,
  FollowRequest,
} from '@/models/feed-models';
import { toUuidDao } from '@/models/storage/conversions.to-dao';

export function toFeedStateDao(
  state: FeedState,
): LiftLog.Ui.Models.FeedStateDaoV1 {
  return new LiftLog.Ui.Models.FeedStateDaoV1({
    feedItems: state.feed.map((x) => FeedItem.fromPOJO(x).toDao()),
    followedUsers: Object.values(state.followedUsers).map((x) =>
      FeedUser.fromPOJO(x).toDao(),
    ),
    followers: Object.values(state.followers).map((x) =>
      FeedUser.fromPOJO(x).toDao(),
    ),
    followRequests: state.followRequests.map((x) =>
      FollowRequest.fromPOJO(x).toDao(),
    ),
    identity: state.identity
      .map(FeedIdentity.fromPOJO)
      .map((x) => x.toDao())
      .unwrapOr(null),
    unpublishedSessionIds: state.unpublishedSessionIds.map(toUuidDao),
    revokedFollowSecrets: state.revokedFollowSecrets,
  });
}

export function fromFeedStateDao(dao: LiftLog.Ui.Models.IFeedStateDaoV1) {
  return {
    feed: dao.feedItems?.map(FeedItem.fromDao).map((x) => x.toPOJO()) ?? [],
    followedUsers:
      (dao.followedUsers &&
        Object.fromEntries(
          dao.followedUsers
            .map(FeedUser.fromDao)
            .map((x) => [x.id, x.toPOJO()] as const),
        )) ??
      {},
    identity:
      (dao.identity &&
        RemoteData.success(FeedIdentity.fromDao(dao.identity).toPOJO())) ??
      RemoteData.notAsked(),
    followRequests:
      dao.followRequests?.map((x) => FollowRequest.fromDao(x).toPOJO()) ?? [],
    followers:
      (dao.followers &&
        Object.fromEntries(
          dao.followers
            .map(FeedUser.fromDao)
            .map((x) => [x.id, x.toPOJO()] as const),
        )) ??
      {},
    unpublishedSessionIds: dao.unpublishedSessionIds?.map(fromUuidDao) ?? [],
    revokedFollowSecrets: dao.revokedFollowSecrets ?? [],
  } satisfies Partial<FeedState>;
}
