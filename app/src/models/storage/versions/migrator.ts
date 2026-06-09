import {
  ExerciseDescriptorJSON,
  FeedIdentityJSON,
  FollowedFeedUserJSON,
  FollowerFeedUserJSON,
  FollowRequestInboxMessageJSON,
  PendingFeedUserJSON,
  ProgramBlueprintJSON,
  SessionJSON,
  SessionUserEventJSON,
} from './latest';
import {
  AnyVersionExerciseDescriptorJSON,
  AnyVersionFeedIdentityJSON,
  AnyVersionFollowedFeedUserJSON,
  AnyVersionFollowerFeedUserJSON,
  AnyVersionFollowRequestInboxMessageJSON,
  AnyVersionPendingFeedUserJSON,
  AnyVersionProgramBlueprintJSON,
  AnyVersionSessionJSON,
  AnyVersionSessionUserEventJSON,
} from './any';

export class MigratorVAnyToLatest {
  static migrateProgram(
    value: AnyVersionProgramBlueprintJSON,
  ): ProgramBlueprintJSON {
    return value;
  }

  static migrateSession(value: AnyVersionSessionJSON): SessionJSON {
    return value;
  }

  static migrateExerciseDescriptor(
    value: AnyVersionExerciseDescriptorJSON,
  ): ExerciseDescriptorJSON {
    return value;
  }

  static migrateFeedIdentity(
    value: AnyVersionFeedIdentityJSON,
  ): FeedIdentityJSON {
    return value;
  }
  static migrateFeedFollowRequest(
    value: AnyVersionFollowRequestInboxMessageJSON,
  ): FollowRequestInboxMessageJSON {
    return value;
  }
  static migrateFollowerFeedUser(
    value: AnyVersionFollowerFeedUserJSON,
  ): FollowerFeedUserJSON {
    return value;
  }
  static migrateFollowedFeedUser(
    value: AnyVersionFollowedFeedUserJSON | AnyVersionPendingFeedUserJSON,
  ): FollowedFeedUserJSON | PendingFeedUserJSON {
    return value;
  }

  static migrateFeedSessionUserEvent(
    value: AnyVersionSessionUserEventJSON,
  ): SessionUserEventJSON {
    return value;
  }
}
