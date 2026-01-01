import { LiftLog } from '@/gen/proto';
import {
  fromWorkoutEventDao,
  toWorkoutEventDao,
  WorkoutEvent,
} from '@/models/workout-worker-models';
import WorkoutWorkerModule from '@/modules/workout-worker/src/WorkoutWorkerModule';

export class WorkoutWorker {
  listeners = new Map<string, ((e: WorkoutEvent) => void)[]>();
  constructor() {
    WorkoutWorkerModule.addListener('on', (encodedEvent) => {
      const listener = this.listeners.get(encodedEvent.type) ?? [];
      if (!listener.length) {
        return;
      }

      const decoded = LiftLog.Ui.Models.WorkoutEvent.WorkoutEvent.decode(
        encodedEvent.bytes,
      );
      const event = fromWorkoutEventDao(decoded);
      listener.forEach((handler) => handler(event));
    });
  }

  broadcast(event: WorkoutEvent) {
    WorkoutWorkerModule.broadcast(
      event.type,
      LiftLog.Ui.Models.WorkoutEvent.WorkoutEvent.encode(
        toWorkoutEventDao(event),
      ).finish(),
    );
  }

  on<T extends WorkoutEvent>(type: T['type'], eventHandler: (e: T) => void) {
    const listener = this.listeners.get(type) ?? [];

    listener.push(eventHandler as (e: WorkoutEvent) => void);

    this.listeners.set(type, listener);
  }
}
