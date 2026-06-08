import {
  acceptedFollowResponseMigrations,
  exerciseDescriptorMigrations,
  feedIdentityMigrations,
  followedFeedUserMigrations,
  followerFeedUserMigrations,
  followRequestInboxMessageMigrations,
  followResponseInboxMessageMigrations,
  followResponseMigrations,
  inboxMessageMigrations,
  pendingFeedUserMigrations,
  programBlueprintMigrations,
  rejectedFollowResponseMigrations,
  removedSessionUserEventMigrations,
  sessionBlueprintMigrations,
  sessionMigrations,
  sessionUserEventMigrations,
  sharedItemMigrations,
  sharedProgramBlueprintMigrations,
  sharedSessionMigrations,
  unfollowNotificationInboxMessageMigrations,
  unfollowNotificationMigrations,
  userEventMigrations,
} from '@/models/storage/versions/migrations';
import { ExtractType } from '@/utils/extract-type';

export * from '../libs';

export type ProgramBlueprintJSON = typeof programBlueprintMigrations.$finalType;
export type SessionBlueprintJSON = typeof sessionBlueprintMigrations.$finalType;
export type SessionJSON = typeof sessionMigrations.$finalType;
export type ExerciseDescriptorJSON =
  typeof exerciseDescriptorMigrations.$finalType;
export type FeedIdentityJSON = typeof feedIdentityMigrations.$finalType;
export type FollowRequestInboxMessageJSON =
  typeof followRequestInboxMessageMigrations.$finalType;
export type FollowedFeedUserJSON = typeof followedFeedUserMigrations.$finalType;
export type FollowerFeedUserJSON = typeof followerFeedUserMigrations.$finalType;
export type PendingFeedUserJSON = typeof pendingFeedUserMigrations.$finalType;
export type SessionUserEventJSON = typeof sessionUserEventMigrations.$finalType;
export type ExerciseBlueprintJSON = SessionBlueprintJSON['exercises'][number];

export type WeightedExerciseBlueprintJSON = ExtractType<
  ExerciseBlueprintJSON,
  'WeightedExerciseBlueprint'
>;

export type RestJSON = WeightedExerciseBlueprintJSON['restBetweenSets'];
export type ProgressiveOverloadJSON =
  WeightedExerciseBlueprintJSON['progressiveOverload'];
export type NoProgressiveOverloadJSON = ExtractType<
  ProgressiveOverloadJSON,
  'NoProgressiveOverload'
>;
export type IncreaseAllEvenlyProgressiveOverloadJSON = ExtractType<
  ProgressiveOverloadJSON,
  'IncreaseAllEvenlyProgressiveOverload'
>;
export type IncreaseLowestSetProgressiveOverloadJSON = ExtractType<
  ProgressiveOverloadJSON,
  'IncreaseLowestSetProgressiveOverload'
>;

export type CardioExerciseBlueprintJSON = ExtractType<
  ExerciseBlueprintJSON,
  'CardioExerciseBlueprint'
>;

export type CardioExerciseSetBlueprintJSON =
  CardioExerciseBlueprintJSON['sets'][number];
export type CardioTargetJSON = CardioExerciseSetBlueprintJSON['target'];
export type DistanceJSON = ExtractType<
  CardioExerciseSetBlueprintJSON['target'],
  'distance'
>['value'];
export type RecordedExerciseJSON = SessionJSON['recordedExercises'][number];

export type RecordedCardioExerciseJSON = ExtractType<
  RecordedExerciseJSON,
  'RecordedCardioExercise'
>;

export type RecordedCardioExerciseSetJSON =
  RecordedCardioExerciseJSON['sets'][number];

export type RecordedWeightedExerciseJSON = ExtractType<
  RecordedExerciseJSON,
  'RecordedWeightedExercise'
>;
export type PotentialSetJSON =
  RecordedWeightedExerciseJSON['potentialSets'][number];
export type RecordedSetJSON = NonNullable<PotentialSetJSON['set']>;

export type SharedSessionJSON = typeof sharedSessionMigrations.$finalType;
export type SharedProgramBlueprintJSON =
  typeof sharedProgramBlueprintMigrations.$finalType;
export type SharedItemJSON = typeof sharedItemMigrations.$finalType;

export type FeedUserJSON =
  | PendingFeedUserJSON
  | FollowedFeedUserJSON
  | FollowerFeedUserJSON;

export type InboxMessageJSON = typeof inboxMessageMigrations.$finalType;
export type FollowRequestJSON =
  (typeof followRequestInboxMessageMigrations.$finalType)['payloadJson']['_TMarker'];

export type RemovedSessionUserEventJSON =
  typeof removedSessionUserEventMigrations.$finalType;

export type UserEventJSON = typeof userEventMigrations.$finalType;

export type AcceptedFollowResponseJSON =
  typeof acceptedFollowResponseMigrations.$finalType;
export type RejectedFollowResponseJSON =
  typeof rejectedFollowResponseMigrations.$finalType;
export type FollowResponseJSON = typeof followResponseMigrations.$finalType;

export type UnfollowNotificationJSON =
  typeof unfollowNotificationMigrations.$finalType;

export type FollowResponseInboxMessageJSON =
  typeof followResponseInboxMessageMigrations.$finalType;

export type UnfollowNotificationInboxMessageJSON =
  typeof unfollowNotificationInboxMessageMigrations.$finalType;
