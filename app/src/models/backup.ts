import { ProgramBlueprint } from '@/models/blueprint-models';
import { FeedIdentity, Friend, SessionUserEvent } from '@/models/feed-models';
import { Session } from '@/models/session-models';
import { ExerciseDescriptor } from '@/models/exercise-models';

export interface FeedBackupData {
  identity: FeedIdentity;
  feedItems: SessionUserEvent[];
  friends: Friend[];
}

export interface BackupData {
  workouts: Session[];
  programs: Record<string, ProgramBlueprint>;
  exercises?: Record<string, ExerciseDescriptor>;
  feed?: FeedBackupData;
}
