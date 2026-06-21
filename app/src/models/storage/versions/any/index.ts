// Add each json version here, we use this type to allow us to migrate over time

import {
  sessionBlueprintMigrations,
  sessionMigrations,
  programBlueprintMigrations,
  exerciseDescriptorMigrations,
  feedIdentityMigrations,
  followRequestInboxMessageMigrations,
  followerFeedUserMigrations,
  followedFeedUserMigrations,
  pendingFeedUserMigrations,
  sessionUserEventMigrations,
  inboxMessageMigrations,
  userEventMigrations,
  sharedItemMigrations,
} from '@/models/storage/versions/migrations';

export type AnyVersionSessionJSON = typeof sessionMigrations.$anyType;
export type AnyVersionSessionBlueprintJSON =
  typeof sessionBlueprintMigrations.$anyType;

export type AnyVersionProgramBlueprintJSON =
  typeof programBlueprintMigrations.$anyType;
export type AnyVersionExerciseDescriptorJSON =
  typeof exerciseDescriptorMigrations.$anyType;
export type AnyVersionFeedIdentityJSON = typeof feedIdentityMigrations.$anyType;
export type AnyVersionFollowRequestInboxMessageJSON =
  typeof followRequestInboxMessageMigrations.$anyType;
export type AnyVersionFollowerFeedUserJSON =
  typeof followerFeedUserMigrations.$anyType;
export type AnyVersionFollowedFeedUserJSON =
  typeof followedFeedUserMigrations.$anyType;
export type AnyVersionPendingFeedUserJSON =
  typeof pendingFeedUserMigrations.$anyType;
export type AnyVersionSessionUserEventJSON =
  typeof sessionUserEventMigrations.$anyType;
export type AnyVersionUserEventJSON = typeof userEventMigrations.$anyType;

export type AnyVersionInboxMessageJSON = typeof inboxMessageMigrations.$anyType;

export type AnyVersionSharedItemJSON = typeof sharedItemMigrations.$anyType;
