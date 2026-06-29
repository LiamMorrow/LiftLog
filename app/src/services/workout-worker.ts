import { AppConfiguration, Translations, WorkoutMessage } from '@/models/workout-worker-messages';
import WorkoutWorkerModule from '~/modules/workout-worker/src/WorkoutWorkerModule';
import { RootState } from '@/store';
import { finishCurrentWorkout } from '@/store/current-session';
import { Dispatch } from '@reduxjs/toolkit';
import { TolgeeInstance, TranslationKey } from '@tolgee/react';

export class WorkoutWorker {
  private readonly listeners = new Map<WorkoutMessage['payload']['type'], ((e: WorkoutMessage['payload']) => void)[]>();

  constructor(
    private dispatch: Dispatch,
    private getState: () => RootState,
    private tolgee: TolgeeInstance,
  ) {
    WorkoutWorkerModule.addListener('on', (encodedEvent) => {
      const decoded = JSON.parse(encodedEvent.jsonString) as WorkoutMessage;
      const listeners = this.listeners.get(decoded.payload.type);
      listeners?.forEach((handler) => handler(decoded.payload));
    });

    this.on('FinishWorkoutCommand', () => this.handleFinishWorkout());
  }

  broadcast(event: WorkoutMessage['payload']) {
    WorkoutWorkerModule.broadcast(
      JSON.stringify({
        payload: event,
        appConfiguration: this.getAppConfigurationMessage(),
        translations: this.getTranslationMessage(),
      } satisfies WorkoutMessage),
    );
  }

  private getAppConfigurationMessage(): AppConfiguration {
    return {
      notificationsEnabled: this.getState().settings.restNotifications,
    };
  }

  private handleFinishWorkout() {
    this.dispatch(finishCurrentWorkout('workoutSession'));
  }

  private on<T extends WorkoutMessage['payload']>(type: T['type'], eventHandler: (e: T) => void) {
    const listener = this.listeners.get(type) ?? [];

    listener.push(eventHandler as (e: WorkoutMessage['payload']) => void);

    this.listeners.set(type, listener);
  }

  private getTranslationMessage(): Translations {
    return {
      workoutPersistentNotificationFinishWorkoutAction: this.tolgee.t(
        'workout_persistent_notification.finish_workout.action' satisfies TranslationKey,
      ),
      workoutPersistentNotificationInProgressMessage: this.tolgee.t(
        'workout_persistent_notification.in_progress.message' satisfies TranslationKey,
      ),
      workoutPersistentNotificationRestBreakMessage: this.tolgee.t(
        'workout_persistent_notification.rest_break.message' satisfies TranslationKey,
      ),
      workoutPersistentNotificationStartNowMessage: this.tolgee.t(
        'workout_persistent_notification.start_now.message' satisfies TranslationKey,
      ),
      workoutPersistentNotificationStartSoonMessage: this.tolgee.t(
        'workout_persistent_notification.start_soon.message' satisfies TranslationKey,
      ),
      workoutPersistentNotificationFinishedMessage: this.tolgee.t(
        'workout_persistent_notification.finished.message' satisfies TranslationKey,
      ),
      workoutPersistentNotificationCurrentExerciseMessage: this.tolgee.t(
        'workout_persistent_notification.current_exercise.message' satisfies TranslationKey,
      ),
      workoutPersistentNotificationMinRestOverMessage: this.tolgee.t(
        'workout_persistent_notification.min_rest_over.message' satisfies TranslationKey,
      ),
      workoutPersistentNotificationMaxRestOverMessage: this.tolgee.t(
        'workout_persistent_notification.max_rest_over.message' satisfies TranslationKey,
      ),
    };
  }
}
