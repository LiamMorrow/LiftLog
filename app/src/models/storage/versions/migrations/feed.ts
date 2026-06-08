import { programBlueprintMigrations } from '@/models/storage/versions/migrations/blueprint';
import { createMigrations } from '@/models/storage/versions/migrations/migrator';
import { sessionMigrations } from '@/models/storage/versions/migrations/session';
import {
  AcceptedFollowResponseJSON,
  FeedIdentityJSON,
  FollowedFeedUserJSON,
  FollowerFeedUserJSON,
  FollowRequestInboxMessageJSON,
  FollowResponseInboxMessageJSON,
  FollowResponseJSON,
  PendingFeedUserJSON,
  RejectedFollowResponseJSON,
  RemovedSessionUserEventJSON,
  SessionUserEventJSON,
  SharedProgramBlueprintJSON,
  SharedSessionJSON,
  UnfollowNotificationInboxMessageJSON,
  UnfollowNotificationJSON,
} from '@/models/storage/versions/v1';
import { match } from 'ts-pattern';

export const feedIdentityMigrations =
  createMigrations<FeedIdentityJSON>().build();

export const followRequestInboxMessageMigrations =
  createMigrations<FollowRequestInboxMessageJSON>().build();
export const followResponseInboxMessageMigrations =
  createMigrations<FollowResponseInboxMessageJSON>().build();
export const unfollowNotificationInboxMessageMigrations =
  createMigrations<UnfollowNotificationInboxMessageJSON>().build();

export const followerFeedUserMigrations =
  createMigrations<FollowerFeedUserJSON>().build();

export const pendingFeedUserMigrations =
  createMigrations<PendingFeedUserJSON>().build();

export const sessionUserEventMigrations =
  createMigrations<SessionUserEventJSON>()
    .build();

export const removedSessionUserEventMigrations =
  createMigrations<RemovedSessionUserEventJSON>().build();

export const userEventMigrations = {
  $anyType: undefined! as
    | typeof sessionUserEventMigrations.$anyType
    | typeof removedSessionUserEventMigrations.$anyType,
  $finalType: undefined! as
    | typeof sessionUserEventMigrations.$finalType
    | typeof removedSessionUserEventMigrations.$finalType,
  migrate: (
    value:
      | typeof sessionUserEventMigrations.$anyType
      | typeof removedSessionUserEventMigrations.$anyType,
  ) => {
    return match(value)
      .with({ type: 'SessionUserEvent' }, (x) =>
        sessionUserEventMigrations.migrate(x),
      )
      .with({ type: 'RemovedSessionUserEvent' }, (x) =>
        removedSessionUserEventMigrations.migrate(x),
      )
      .exhaustive();
  },
};

export const sharedProgramBlueprintMigrations =
  createMigrations<SharedProgramBlueprintJSON>()
    .build();

export const sharedSessionMigrations = createMigrations<SharedSessionJSON>()
  .build();

export const followedFeedUserMigrations =
  createMigrations<FollowedFeedUserJSON>()
    .build();

export const unfollowNotificationMigrations =
  createMigrations<UnfollowNotificationJSON>().build();

export const acceptedFollowResponseMigrations =
  createMigrations<AcceptedFollowResponseJSON>().build();
export const rejectedFollowResponseMigrations =
  createMigrations<RejectedFollowResponseJSON>().build();

export const followResponseMigrations =
  createMigrations<FollowResponseJSON>().build();

export const inboxMessageMigrations = {
  $anyType: undefined! as
    | typeof followRequestInboxMessageMigrations.$anyType
    | typeof unfollowNotificationInboxMessageMigrations.$anyType
    | typeof followResponseInboxMessageMigrations.$anyType,
  $finalType: undefined! as
    | typeof followRequestInboxMessageMigrations.$finalType
    | typeof unfollowNotificationInboxMessageMigrations.$finalType
    | typeof followResponseInboxMessageMigrations.$finalType,
  migrate: (
    value:
      | typeof followRequestInboxMessageMigrations.$anyType
      | typeof unfollowNotificationInboxMessageMigrations.$anyType
      | typeof followResponseInboxMessageMigrations.$anyType,
  ) => {
    return match(value)
      .with({ type: 'FollowRequest' }, (x) =>
        followRequestInboxMessageMigrations.migrate(x),
      )
      .with({ type: 'FollowResponse' }, (x) =>
        followResponseInboxMessageMigrations.migrate(x),
      )
      .with({ type: 'UnfollowNotification' }, (x) =>
        unfollowNotificationInboxMessageMigrations.migrate(x),
      )
      .exhaustive();
  },
};

export const sharedItemMigrations = {
  $finalType: undefined! as
    | typeof sharedSessionMigrations.$finalType
    | typeof sharedProgramBlueprintMigrations.$finalType,
  migrate: (
    value:
      | typeof sharedSessionMigrations.$anyType
      | typeof sharedProgramBlueprintMigrations.$anyType,
  ) => {
    return match(value)
      .with({ type: 'SharedProgramBlueprint' }, (x) =>
        sharedProgramBlueprintMigrations.migrate(x),
      )
      .with({ type: 'SharedSession' }, (x) =>
        sharedSessionMigrations.migrate(x),
      )
      .exhaustive();
  },
};
