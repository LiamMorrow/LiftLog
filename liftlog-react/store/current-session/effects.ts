import { Session } from '@/models/session-models';
import {
  clearSetTimerNotification,
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
}
