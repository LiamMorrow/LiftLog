import { RecordedExercise } from '@/models/session-models';
import { RootState } from '@/store';
import { setLatestSetTimerNotificationId } from '@/store/current-session';
import { uuid } from '@/utils/uuid';
import { Duration } from '@js-joda/core';
import { Dispatch } from '@reduxjs/toolkit';
import { startActivityAsync } from 'expo-intent-launcher';
import {
  AndroidImportance,
  AndroidNotificationVisibility,
  cancelScheduledNotificationAsync,
  requestPermissionsAsync,
  SchedulableTriggerInputTypes,
  scheduleNotificationAsync,
  setNotificationChannelAsync,
  setNotificationHandler,
  dismissNotificationAsync,
} from 'expo-notifications';
import { Platform } from 'react-native';
import { canScheduleExactAlarms } from 'react-native-permissions';
import { match, P } from 'ts-pattern';

setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const nextSetNotificationChannelId = 'Set Timers';
const nextSetNotificationIdentifier = '1000';
if (Platform.OS === 'android') {
  void setNotificationChannelAsync(nextSetNotificationChannelId, {
    name: 'Sets',
    description:
      'Notifications which remind you when your next set should be started',
    importance: AndroidImportance.HIGH,
    enableVibrate: true,
    showBadge: true,
    lockscreenVisibility: AndroidNotificationVisibility.PUBLIC,
    bypassDnd: false,
  });
}
export class NotificationService {
  constructor(
    readonly getState: () => RootState,
    readonly dispatch: Dispatch,
  ) {}

  async scheduleNextSetNotification(exercise: RecordedExercise) {
    await this.clearSetTimerNotification();

    const id = uuid();
    this.dispatch(setLatestSetTimerNotificationId(id));
    await requestPermissionsAsync();

    const repsPerSet = exercise.blueprint.repsPerSet;
    const { minRest, failureRest } = exercise.blueprint.restBetweenSets;

    const rest = match(exercise.lastRecordedSet)
      .with(
        { set: { repsCompleted: P.when((x) => x >= repsPerSet) } },
        () => minRest,
      )
      .with(
        { set: { repsCompleted: P.when((x) => x < repsPerSet) } },
        () => failureRest,
      )
      .otherwise(() => Duration.ZERO);

    if (rest.equals(Duration.ZERO)) {
      return;
    }
    await scheduleNotificationAsync({
      content: {
        title: 'Rest Over',
        body: 'Start your next set!',
        sound: true,
      },
      trigger: {
        type: SchedulableTriggerInputTypes.DATE,
        channelId: nextSetNotificationChannelId,
        date: new Date(Date.now() + rest.toMillis()),
      },
      identifier: nextSetNotificationIdentifier,
    });
  }

  async clearSetTimerNotification() {
    await cancelScheduledNotificationAsync(nextSetNotificationIdentifier);
    await dismissNotificationAsync(nextSetNotificationIdentifier);
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
    if (await this.canScheduleExactNotifications()) {
      return true;
    }

    await startActivityAsync('android.settings.REQUEST_SCHEDULE_EXACT_ALARM', {
      data: 'package:com.limajuice.liftlog',
    });

    return await canScheduleExactAlarms();
  }
}
