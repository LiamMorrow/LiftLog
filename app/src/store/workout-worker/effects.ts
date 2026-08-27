import { setRestTimersEnabled } from '@/store/settings';
import {
  deleteStoredSession,
  putStoredSession,
  selectActiveSession,
  setActiveSessionId,
  setStoredSessions,
  updateStoredSession,
} from '@/store/stored-sessions';
import { AddEffectFn } from '@/store/store';
import {
  activeSessionUpdated,
  broadcastWorkoutEvent,
  clearSetTimerNotification,
  notifySetTimer,
} from '@/store/workout-worker';
import { workoutUpdatedEvent } from '@/store/workout-worker/helpers';
import { OffsetDateTime } from '@js-joda/core';

/** Anything that can change which session is active, or what is in it. */
const sessionMutations = [
  setActiveSessionId,
  putStoredSession,
  updateStoredSession,
  deleteStoredSession,
  setStoredSessions,
];

export function applyWorkoutWorkerEffects(addEffect: AddEffectFn) {
  addEffect(sessionMutations, (_, { stateBeforeReduce, stateAfterReduce, dispatch }) => {
    const before = selectActiveSession(stateBeforeReduce);
    const after = selectActiveSession(stateAfterReduce);
    if (before !== after) {
      dispatch(activeSessionUpdated({ before, after }));
    }
  });

  addEffect(activeSessionUpdated, (action, { dispatch, getState }) => {
    const previousValue = action.payload.before;
    const currentValue = action.payload.after;
    const { restTimersEnabled } = getState().settings;
    if (!previousValue && currentValue) {
      dispatch(broadcastWorkoutEvent({ type: 'WorkoutStartedEvent' }));
    }
    const previousEndTime = previousValue?.restTimerEndTime;
    const currentEndTime = currentValue?.restTimerEndTime;
    const restTimerEndTimeChanged = previousEndTime
      ? !previousEndTime.isEqual(currentEndTime ?? OffsetDateTime.MAX)
      : currentEndTime !== undefined;
    if (restTimerEndTimeChanged) {
      dispatch(notifySetTimer());
    }
    if (currentValue) {
      dispatch(broadcastWorkoutEvent(workoutUpdatedEvent(currentValue, restTimersEnabled)));
    }
    if (previousValue && !currentValue) {
      dispatch(clearSetTimerNotification());
      dispatch(broadcastWorkoutEvent({ type: 'WorkoutEndedEvent' }));
    }
  });

  addEffect(setRestTimersEnabled, (action, { dispatch, getState }) => {
    dispatch(notifySetTimer());
    const activeSession = selectActiveSession(getState());
    if (activeSession) {
      dispatch(broadcastWorkoutEvent(workoutUpdatedEvent(activeSession, action.payload)));
    }
  });

  addEffect(broadcastWorkoutEvent, (action, { extra: { workoutWorkerService } }) => {
    workoutWorkerService.broadcast(action.payload);
  });

  addEffect(clearSetTimerNotification, async (_, { extra: { notificationService } }) => {
    await notificationService.clearSetTimerNotification();
  });

  addEffect(notifySetTimer, async (_, { extra: { notificationService }, getState }) => {
    await notificationService.clearSetTimerNotification();
    const state = getState();
    const { restNotifications, restTimersEnabled } = state.settings;
    if (!restNotifications || !restTimersEnabled) {
      return;
    }
    const restTimerEndTime = selectActiveSession(state)?.restTimerEndTime;
    if (restTimerEndTime && restTimerEndTime.isAfter(OffsetDateTime.now())) {
      await notificationService.scheduleNextSetNotification(restTimerEndTime);
    }
  });
}
