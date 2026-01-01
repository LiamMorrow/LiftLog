import {
  SerializedWorkoutEventPayload,
  WorkoutWorkerModuleEvents,
} from './WorkoutWorker.types';
import { registerWebModule, NativeModule } from 'expo';

class WorkoutWorkerModule extends NativeModule<WorkoutWorkerModuleEvents> {
  broadcast(bytes: SerializedWorkoutEventPayload['bytes']) {
    this.emit('on', {
      bytes,
    });
  }
}

export default registerWebModule(WorkoutWorkerModule, 'WorkoutWorkerModule');
