import { RecordedExercise } from '@/models/session-models';
import { startActivityAsync } from 'expo-intent-launcher';

import {
  AndroidImportance,
  cancelScheduledNotificationAsync,
  requestPermissionsAsync,
  SchedulableTriggerInputTypes,
  scheduleNotificationAsync,
  setNotificationChannelAsync,
  setNotificationHandler,
} from 'expo-notifications';
import { Platform } from 'react-native';
import { canScheduleExactAlarms } from 'react-native-permissions';

setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

setNotificationChannelAsync('1', {
  name: 'Sets',
  importance: AndroidImportance.DEFAULT,
});
export class NotificationService {
  async scheduleNextSetNotification(lastExercise: RecordedExercise) {
    const response = await requestPermissionsAsync();
    console.log(response);
    const notificationId = await scheduleNotificationAsync({
      content: {
        title: "Time's up!",
        body: 'Change sides!',
      },
      trigger: {
        type: SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 4,
      },
    });
    await cancelScheduledNotificationAsync(notificationId);
  }
  async clearSetTimerNotification() {
    // TODO
  }

  /**
   * Android > 31 requires a new permission that we need to prompt the user with
   * for scheduled notifications to work exactly. This function checks if we need to request it
   */
  async canScheduleExactNotifications() {
    if (Platform.OS !== 'android') {
      return true;
    }
    if (Platform.Version >= 31) {
      return await canScheduleExactAlarms();
    }
    return true;
  }

  async requestScheduleExactNotificationPermission() {
    if (Platform.OS !== 'android') {
      return true;
    }
    if (Platform.Version < 31) {
      return true;
    }

    await startActivityAsync('android.settings.REQUEST_SCHEDULE_EXACT_ALARM', {
      data: 'package:com.limajuice.liftlogreact',
    });

    return await canScheduleExactAlarms();
  }
}
