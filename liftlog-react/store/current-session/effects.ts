import { Session } from '@/models/session-models';
import {
  clearSetTimerNotification,
  notifySetTimer,
  persistCurrentSession,
  setCurrentSession,
} from '@/store/current-session';
import { addEffect } from '@/store/listenerMiddleware';
import { fetchUpcomingSessions } from '@/store/program';

export function applyCurrentSessionEffects() {
  addEffect(
    persistCurrentSession,
    async (a, { dispatch, extra: { progressRepository }, getState }) => {
      dispatch(clearSetTimerNotification());
      const session = getState().currentSession[a.payload];
      if (session) {
        await progressRepository.saveCompletedSession(
          Session.fromPOJO(session),
        );
      }
      dispatch(setCurrentSession({ target: a.payload, session: undefined }));
      dispatch(fetchUpcomingSessions());
    },
  );

  addEffect(
    clearSetTimerNotification,
    async (_, { extra: { notificationService } }) => {
      await notificationService.clearSetTimerNotification();
    },
  );

  addEffect(
    notifySetTimer,
    async (_, { extra: { notificationService }, getState }) => {
      await notificationService.clearSetTimerNotification();
      const {
        settings: { restNotifications },
        currentSession: { workoutSession: sessionPOJO },
      } = getState();
      if (!restNotifications) {
        return;
      }
      const session = Session.fromPOJO(sessionPOJO);
      if (session?.nextExercise && session.lastExercise) {
        await notificationService.scheduleNextSetNotification(
          session.lastExercise,
        );
      }
    },
  );
}
