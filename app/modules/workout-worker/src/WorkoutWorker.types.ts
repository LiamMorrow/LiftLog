// The result of calling encode on a WorkoutEvent protobuf object
export type SerializedWorkoutEventPayload = {
  bytes: Uint8Array;
};

export type WorkoutWorkerModuleEvents = {
  on: (event: SerializedWorkoutEventPayload) => void;
};
