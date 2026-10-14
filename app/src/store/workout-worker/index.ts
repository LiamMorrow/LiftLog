import { Session } from '@/models/session-models';
import { WorkoutMessage } from '@/models/workout-worker-messages';
import { createAction } from '@reduxjs/toolkit';

export const clearSetTimerNotification = createAction('clearSetTimerNotification');

export const notifySetTimer = createAction('notifySetTimer');

export const broadcastWorkoutEvent = createAction<WorkoutMessage['payload']>('broadcastWorkoutEvent');

export const activeSessionUpdated = createAction<{
  before: Session | undefined;
  after: Session | undefined;
}>('activeSessionUpdated');
