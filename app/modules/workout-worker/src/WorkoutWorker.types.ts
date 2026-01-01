import { WorkoutMessage } from '@/models/workout-worker-messages';

// The result of calling encode on a WorkoutEvent protobuf object
export type SerializedWorkoutEventPayload = {
  type: WorkoutMessage['type'];
  bytes: Uint8Array;
};

export type WorkoutWorkerModuleEvents = {
  on: (event: SerializedWorkoutEventPayload) => void;
};
