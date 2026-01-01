import { RecordedWeightedExercise } from '@/models/session-models';
import { RootState } from '@/store';
import { Duration } from '@js-joda/core';
import { Dispatch } from '@reduxjs/toolkit';
import {
  cancelScheduledNotificationAsync,
  requestPermissionsAsync,
  SchedulableTriggerInputTypes,
  scheduleNotificationAsync,
  setNotificationHandler,
  dismissNotificationAsync,
} from 'expo-notifications';
import { match, P } from 'ts-pattern';

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

  async scheduleNextSetNotification(exercise: RecordedWeightedExercise) {
    await this.clearSetTimerNotification();

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
        date: new Date(Date.now() + rest.toMillis()),
      },
      identifier: nextSetNotificationIdentifier,
    });
  }

  async clearSetTimerNotification() {
    await cancelScheduledNotificationAsync(nextSetNotificationIdentifier);
    await dismissNotificationAsync(nextSetNotificationIdentifier);
  }
}
