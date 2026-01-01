import { LiftLog } from '@/gen/proto';

import {
  fromWorkoutMessageDao,
  toWorkoutMessageDao,
  WorkoutMessage,
} from '@/models/workout-worker-messages';
import WorkoutWorkerModule from '@/modules/workout-worker/src/WorkoutWorkerModule';
import { RootState } from '@/store';
import { finishCurrentWorkout } from '@/store/current-session';
import { Dispatch } from '@reduxjs/toolkit';
import { TolgeeInstance, TranslationKey } from '@tolgee/react';

export class WorkoutWorker {
  private readonly listeners = new Map<
    WorkoutMessage['type'],
    ((e: WorkoutMessage) => void)[]
  >();

  constructor(
    private dispatch: Dispatch,
    private getState: () => RootState,
    private tolgee: TolgeeInstance,
  ) {
    WorkoutWorkerModule.addListener('on', (encodedEvent) => {
      const decoded = LiftLog.Ui.Models.WorkoutMessage.WorkoutMessage.decode(
        encodedEvent.bytes,
      );
      const event = fromWorkoutMessageDao(decoded);
      const listeners = this.listeners.get(event.type);
      listeners?.forEach((handler) => handler(event));
    });

    this.on('FinishWorkoutCommand', () => this.handleFinishWorkout());
  }

  broadcast(event: WorkoutMessage) {
    WorkoutWorkerModule.broadcast(
      LiftLog.Ui.Models.WorkoutMessage.WorkoutMessage.encode(
        toWorkoutMessageDao(
          event,
          this.getAppConfigurationMessage(),
          this.getTranslationMessage(),
        ),
      ).finish(),
    );
  }
  getAppConfigurationMessage(): LiftLog.Ui.Models.WorkoutMessage.AppConfiguration {
    return LiftLog.Ui.Models.WorkoutMessage.AppConfiguration.create({
      notificationsEnabled: this.getState().settings.restNotifications,
    } satisfies Required<LiftLog.Ui.Models.WorkoutMessage.IAppConfiguration>);
  }

  private handleFinishWorkout() {
    this.dispatch(finishCurrentWorkout('workoutSession'));
  }

  private on<T extends WorkoutMessage>(
    type: T['type'],
    eventHandler: (e: T) => void,
  ) {
    const listener = this.listeners.get(type) ?? [];

    listener.push(eventHandler as (e: WorkoutMessage) => void);

    this.listeners.set(type, listener);
  }

  private getTranslationMessage(): LiftLog.Ui.Models.WorkoutMessage.Translations {
    return LiftLog.Ui.Models.WorkoutMessage.Translations.create({
      workoutPersistentNotification_FinishWorkout_Action: this.tolgee.t(
        'workout_persistent_notification.finish_workout.action' satisfies TranslationKey,
      ),
      workoutPersistentNotification_InProgress_Message: this.tolgee.t(
        'workout_persistent_notification.in_progress.message' satisfies TranslationKey,
      ),
      workoutPersistentNotification_RestBreak_Message: this.tolgee.t(
        'workout_persistent_notification.rest_break.message' satisfies TranslationKey,
      ),
      workoutPersistentNotification_StartNow_Message: this.tolgee.t(
        'workout_persistent_notification.start_now.message' satisfies TranslationKey,
      ),
      workoutPersistentNotification_StartSoon_Message: this.tolgee.t(
        'workout_persistent_notification.start_soon.message' satisfies TranslationKey,
      ),
      workoutPersistentNotification_Finished_Message: this.tolgee.t(
        'workout_persistent_notification.finished.message' satisfies TranslationKey,
      ),
      workoutPersistentNotification_CurrentExercise_Message: this.tolgee.t(
        'workout_persistent_notification.current_exercise.message' satisfies TranslationKey,
      ),
      workoutPersistentNotification_MinRestOver_Message: this.tolgee.t(
        'workout_persistent_notification.min_rest_over.message' satisfies TranslationKey,
      ),
      workoutPersistentNotification_MaxRestOver_Message: this.tolgee.t(
        'workout_persistent_notification.max_rest_over.message' satisfies TranslationKey,
      ),
    } satisfies Required<LiftLog.Ui.Models.WorkoutMessage.ITranslations>);
  }
}
