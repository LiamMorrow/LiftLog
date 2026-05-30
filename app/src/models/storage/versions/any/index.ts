import {
  SessionJSON as V1SessionJSON,
  ProgramBlueprintJSON as V1ProgramBlueprintJSON,
  ExerciseDescriptorJSON as V1ExerciseDescriptorJSON,
  FeedIdentityJSON as V1FeedIdentityJSON,
  FollowRequestInboxMessageJSON as V1FollowRequestInboxMessageJSON,
  FollowerFeedUserJSON as V1FollowerFeedUserJSON,
  FollowedFeedUserJSON as V1FollowedFeedUserJSON,
  PendingFeedUserJSON as V1PendingFeedUserJSON,
  SessionUserEventJSON as V1SessionUserEventJSON,
} from '../v1';

// Add each json version here, we use this type to allow us to migrate over time
export type AnyVersionSessionJSON = V1SessionJSON;
export type AnyVersionProgramBlueprintJSON = V1ProgramBlueprintJSON;
export type AnyVersionExerciseDescriptorJSON = V1ExerciseDescriptorJSON;
export type AnyVersionFeedIdentityJSON = V1FeedIdentityJSON;
export type AnyVersionFollowRequestInboxMessageJSON =
  V1FollowRequestInboxMessageJSON;
export type AnyVersionFollowerFeedUserJSON = V1FollowerFeedUserJSON;
export type AnyVersionFollowedFeedUserJSON = V1FollowedFeedUserJSON;
export type AnyVersionPendingFeedUserJSON = V1PendingFeedUserJSON;
export type AnyVersionSessionUserEventJSON = V1SessionUserEventJSON;
