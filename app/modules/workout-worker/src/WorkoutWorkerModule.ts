import { NativeModule, requireNativeModule } from 'expo';
import {
  SerializedWorkoutEventPayload,
  WorkoutWorkerModuleEvents,
} from './WorkoutWorker.types';

declare class WorkoutWorkerModule extends NativeModule<WorkoutWorkerModuleEvents> {
  broadcast(
    type: SerializedWorkoutEventPayload['type'],
    bytes: SerializedWorkoutEventPayload['bytes'],
  ): void;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<WorkoutWorkerModule>('WorkoutWorker');
