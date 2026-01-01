import { WorkoutEvent } from '@/models/workout-worker-models';

// The result of calling encode on a WorkoutEvent protobuf object
export type SerializedWorkoutEventPayload = {
  type: WorkoutEvent['type'];
  bytes: Uint8Array;
};

export type WorkoutWorkerModuleEvents = {
  on: (event: SerializedWorkoutEventPayload) => void;
};
