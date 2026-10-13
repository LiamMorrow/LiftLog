import { programBlueprintMigrations } from '@/models/storage/versions/migrations/blueprint';
import { createMigrations } from '@/models/storage/versions/migrations/migrator';
import { sessionMigrations } from '@/models/storage/versions/migrations/session';
import {
  AcceptedFollowResponseJSON,
  FeedIdentityJSON,
  FollowRequestInboxMessageJSON,
  FollowResponseInboxMessageJSON,
  FollowResponseJSON,
  FriendJSON,
  FriendKeysInboxMessageJSON,
  FriendRejectInboxMessageJSON,
  FriendRequestInboxMessageJSON,
  ReactionInboxMessageJSON,
  ReactionJSON,
  ReceivedReactionJSON,
  RejectedFollowResponseJSON,
  RemovedSessionUserEventJSON,
  SentReactionJSON,
  SessionUserEventJSON,
  SharedProgramBlueprintJSON,
  SharedSessionJSON,
  UnfollowNotificationInboxMessageJSON,
  UnfollowNotificationJSON,
  UnfriendInboxMessageJSON,
} from '@/models/storage/versions/initial';
import type * as Latest from '@/models/storage/versions/latest/feed';
import type { AesKeyJSON, InstantJSON } from '@/models/storage/versions/libs';
import { match } from 'ts-pattern';

export const feedIdentityMigrations = createMigrations<FeedIdentityJSON>()
  .add((value) => ({
    version: 2 as const,
    id: value.id,
    lookup: value.lookup,
    aesKey: value.aesKey,
    previousAesKeys: [] as { key: AesKeyJSON; supersededAt: InstantJSON }[],
    rsaKeyPair: value.rsaKeyPair,
    password: value.password,
    name: value.name,
    publishBodyweight: value.publishBodyweight,
    publishPlan: value.publishPlan,
    publishWorkouts: value.publishWorkouts,
  }))
  .build<Latest.FeedIdentityJSON>();

export const followRequestInboxMessageMigrations =
  createMigrations<FollowRequestInboxMessageJSON>().build<Latest.FollowRequestInboxMessageJSON>();
export const followResponseInboxMessageMigrations =
  createMigrations<FollowResponseInboxMessageJSON>().build<Latest.FollowResponseInboxMessageJSON>();
export const unfollowNotificationInboxMessageMigrations =
  createMigrations<UnfollowNotificationInboxMessageJSON>().build<Latest.UnfollowNotificationInboxMessageJSON>();
export const reactionInboxMessageMigrations =
  createMigrations<ReactionInboxMessageJSON>().build<Latest.ReactionInboxMessageJSON>();
export const friendRequestInboxMessageMigrations =
  createMigrations<FriendRequestInboxMessageJSON>().build<Latest.FriendRequestInboxMessageJSON>();
export const friendKeysInboxMessageMigrations =
  createMigrations<FriendKeysInboxMessageJSON>().build<Latest.FriendKeysInboxMessageJSON>();
export const friendRejectInboxMessageMigrations =
  createMigrations<FriendRejectInboxMessageJSON>().build<Latest.FriendRejectInboxMessageJSON>();
export const unfriendInboxMessageMigrations =
  createMigrations<UnfriendInboxMessageJSON>().build<Latest.UnfriendInboxMessageJSON>();

export const reactionMigrations = createMigrations<ReactionJSON>().build<Latest.ReactionJSON>();
export const receivedReactionMigrations = createMigrations<ReceivedReactionJSON>().build<Latest.ReceivedReactionJSON>();
export const sentReactionMigrations = createMigrations<SentReactionJSON>().build<Latest.SentReactionJSON>();

export const sessionUserEventMigrations = createMigrations<SessionUserEventJSON>({ pseudoMigrateUntil: 3 })
  .dependsOn({
    session: sessionMigrations,
  })
  .build<Latest.SessionUserEventJSON>();

export const removedSessionUserEventMigrations =
  createMigrations<RemovedSessionUserEventJSON>().build<Latest.RemovedSessionUserEventJSON>();

export const userEventMigrations = {
  $anyType: undefined! as
    | typeof sessionUserEventMigrations.$anyType
    | typeof removedSessionUserEventMigrations.$anyType,
  $finalType: undefined! as
    | typeof sessionUserEventMigrations.$finalType
    | typeof removedSessionUserEventMigrations.$finalType,
  migrate: (value: typeof sessionUserEventMigrations.$anyType | typeof removedSessionUserEventMigrations.$anyType) => {
    return match(value)
      .with({ type: 'SessionUserEvent' }, (x) => sessionUserEventMigrations.migrate(x))
      .with({ type: 'RemovedSessionUserEvent' }, (x) => removedSessionUserEventMigrations.migrate(x))
      .exhaustive();
  },
};

export const sharedProgramBlueprintMigrations = createMigrations<SharedProgramBlueprintJSON>({ pseudoMigrateUntil: 3 })
  .dependsOn({
    programBlueprint: programBlueprintMigrations,
  })
  .build<Latest.SharedProgramBlueprintJSON>();

export const sharedSessionMigrations = createMigrations<SharedSessionJSON>({ pseudoMigrateUntil: 3 })
  .dependsOn({
    session: sessionMigrations,
  })
  .build<Latest.SharedSessionJSON>();

export const friendMigrations = createMigrations<FriendJSON>()
  .dependsOn({
    currentPlan: programBlueprintMigrations,
  })
  .build<Latest.FriendJSON>();

export const unfollowNotificationMigrations =
  createMigrations<UnfollowNotificationJSON>().build<Latest.UnfollowNotificationJSON>();

export const acceptedFollowResponseMigrations =
  createMigrations<AcceptedFollowResponseJSON>().build<Latest.AcceptedFollowResponseJSON>();
export const rejectedFollowResponseMigrations =
  createMigrations<RejectedFollowResponseJSON>().build<Latest.RejectedFollowResponseJSON>();

export const followResponseMigrations = createMigrations<FollowResponseJSON>().build<Latest.FollowResponseJSON>();

const inboxMessageChains = [
  followRequestInboxMessageMigrations,
  followResponseInboxMessageMigrations,
  unfollowNotificationInboxMessageMigrations,
  reactionInboxMessageMigrations,
  friendRequestInboxMessageMigrations,
  friendKeysInboxMessageMigrations,
  friendRejectInboxMessageMigrations,
  unfriendInboxMessageMigrations,
];
type InboxMessageChain = (typeof inboxMessageChains)[number];

export const inboxMessageMigrations = {
  $anyType: undefined! as InboxMessageChain['$anyType'],
  $finalType: undefined! as InboxMessageChain['$finalType'],
  migrate: (value: InboxMessageChain['$anyType']): InboxMessageChain['$finalType'] =>
    match(value)
      .with({ type: 'FollowRequest' }, (x) => followRequestInboxMessageMigrations.migrate(x))
      .with({ type: 'FollowResponse' }, (x) => followResponseInboxMessageMigrations.migrate(x))
      .with({ type: 'UnfollowNotification' }, (x) => unfollowNotificationInboxMessageMigrations.migrate(x))
      .with({ type: 'Reaction' }, (x) => reactionInboxMessageMigrations.migrate(x))
      .with({ type: 'FriendRequest' }, (x) => friendRequestInboxMessageMigrations.migrate(x))
      .with({ type: 'FriendKeys' }, (x) => friendKeysInboxMessageMigrations.migrate(x))
      .with({ type: 'FriendReject' }, (x) => friendRejectInboxMessageMigrations.migrate(x))
      .with({ type: 'Unfriend' }, (x) => unfriendInboxMessageMigrations.migrate(x))
      .exhaustive(),
};

export const sharedItemMigrations = {
  $anyType: undefined! as typeof sharedSessionMigrations.$anyType | typeof sharedProgramBlueprintMigrations.$anyType,
  $finalType: undefined! as
    | typeof sharedSessionMigrations.$finalType
    | typeof sharedProgramBlueprintMigrations.$finalType,
  migrate: (value: typeof sharedSessionMigrations.$anyType | typeof sharedProgramBlueprintMigrations.$anyType) => {
    return match(value)
      .with({ type: 'SharedProgramBlueprint' }, (x) => sharedProgramBlueprintMigrations.migrate(x))
      .with({ type: 'SharedSession' }, (x) => sharedSessionMigrations.migrate(x))
      .exhaustive();
  },
};
