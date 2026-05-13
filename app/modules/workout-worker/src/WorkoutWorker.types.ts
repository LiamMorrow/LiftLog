// The result of calling JSON.stringify on a WorkoutEvent object
export type SerializedWorkoutEventPayload = {
  jsonString: string;
};

export type WorkoutWorkerModuleEvents = {
  on: (event: SerializedWorkoutEventPayload) => void;
};
