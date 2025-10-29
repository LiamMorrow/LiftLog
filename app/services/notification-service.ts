import { RecordedWeightedExercise } from '@/models/session-models';
import { RootState } from '@/store';
import { Dispatch } from '@reduxjs/toolkit';
export class NotificationService {
  constructor(
    readonly getState: () => RootState,
    readonly dispatch: Dispatch,
  ) {}

  async scheduleNextSetNotification(exercise: RecordedWeightedExercise) {}

  async clearSetTimerNotification() {}

  /**
   * Android > 31 requires a new permission that we need to prompt the user with
   * for scheduled notifications to work exactly. This function checks if we need to request it
   */
  async canScheduleExactNotifications() {
    return true;
  }

  async requestScheduleExactNotificationPermission(force = false) {
    return true;
  }
}
