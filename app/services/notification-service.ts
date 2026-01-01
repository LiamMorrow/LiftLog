import { RecordedWeightedExercise } from '@/models/session-models';
import { RootState } from '@/store';
import { Dispatch } from '@reduxjs/toolkit';
import {
  AndroidImportance,
  AndroidNotificationVisibility,
  setNotificationChannelAsync,
  setNotificationHandler,
} from 'expo-notifications';
import { Platform } from 'react-native';

setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

if (Platform.OS === 'android') {
  void setNotificationChannelAsync('workout_channel', {
    name: 'Workout',
    description:
      'A persistent notification showing your time throughout the workout',
    importance: AndroidImportance.HIGH,
    enableVibrate: true,
    showBadge: true,
    lockscreenVisibility: AndroidNotificationVisibility.PUBLIC,
    bypassDnd: false,
  });
  void setNotificationChannelAsync('rest_channel', {
    name: 'Rest Notifications',
    description: 'A notification alerting you that your rest is over',
    importance: AndroidImportance.DEFAULT,
    enableVibrate: true,
    showBadge: true,
    lockscreenVisibility: AndroidNotificationVisibility.PUBLIC,
    bypassDnd: false,
  });
}
/**
 * Notification service is used for displaying dumb notifications through expo notifications
 * Only relevant for iOS, android uses richer notifications via WorkoutWorker
 */
export class NotificationService {
  constructor(
    readonly getState: () => RootState,
    readonly dispatch: Dispatch,
  ) {}

  async scheduleNextSetNotification(exercise: RecordedWeightedExercise) {}

  async clearSetTimerNotification() {}
}
