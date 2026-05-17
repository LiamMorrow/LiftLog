import { RootState } from '@/store';
import { convert, OffsetDateTime } from '@js-joda/core';
import { Dispatch } from '@reduxjs/toolkit';
import {
  cancelScheduledNotificationAsync,
  requestPermissionsAsync,
  SchedulableTriggerInputTypes,
  scheduleNotificationAsync,
  setNotificationHandler,
  dismissNotificationAsync,
} from 'expo-notifications';

setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const nextSetNotificationIdentifier = '1000';
export class NotificationService {
  constructor(
    readonly getState: () => RootState,
    readonly dispatch: Dispatch,
  ) {}

  async scheduleNextSetNotification(time: OffsetDateTime) {
    await this.clearSetTimerNotification();

    await requestPermissionsAsync();

    await scheduleNotificationAsync({
      content: {
        title: 'Rest Over',
        body: 'Start your next set!',
        sound: true,
      },
      trigger: {
        type: SchedulableTriggerInputTypes.DATE,
        date: convert(time.toInstant()).toDate(),
      },
      identifier: nextSetNotificationIdentifier,
    });
  }

  async clearSetTimerNotification() {
    await cancelScheduledNotificationAsync(nextSetNotificationIdentifier);
    await dismissNotificationAsync(nextSetNotificationIdentifier);
  }
}
