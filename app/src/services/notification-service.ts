import { RootState } from '@/store';
import { OffsetDateTime } from '@js-joda/core';
import { Dispatch } from '@reduxjs/toolkit';
import {
  AndroidImportance,
  AndroidNotificationVisibility,
  deleteNotificationChannelAsync,
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
    description: 'A persistent notification showing your time throughout the workout',
    importance: AndroidImportance.HIGH,
    enableVibrate: true,
    showBadge: true,
    lockscreenVisibility: AndroidNotificationVisibility.PUBLIC,
    bypassDnd: false,
  });
  // The rest alert's sound is played by the workout worker as media, so it follows the media
  // stream like any other audio app. This channel must stay silent to avoid a second alert; it
  // keeps vibration, which is the only cue when the media stream is muted.
  void setNotificationChannelAsync('rest_channel_silent', {
    name: 'Rest Notifications',
    description: 'A notification alerting you that your rest is over',
    importance: AndroidImportance.DEFAULT,
    sound: null,
    enableVibrate: true,
    showBadge: true,
    lockscreenVisibility: AndroidNotificationVisibility.PUBLIC,
    bypassDnd: false,
  });
  // Channel settings are immutable, so the pre-silent channel is replaced rather than edited.
  void deleteNotificationChannelAsync('rest_channel');
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

  async scheduleNextSetNotification(_time: OffsetDateTime) {}

  async clearSetTimerNotification() {}
}
