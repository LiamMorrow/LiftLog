import {
  SerializedWorkoutEventPayload,
  WorkoutWorkerModuleEvents,
} from './WorkoutWorker.types';
import { registerWebModule, NativeModule } from 'expo';

class WorkoutWorkerModule extends NativeModule<WorkoutWorkerModuleEvents> {
  broadcast(
    type: SerializedWorkoutEventPayload['type'],
    bytes: SerializedWorkoutEventPayload['bytes'],
  ) {
    this.emit('on', {
      type,
      bytes,
    });
  }
}

export default registerWebModule(WorkoutWorkerModule, 'WorkoutWorkerModule');
