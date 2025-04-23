import { Session } from '@/models/session-models';
import {
  clearSetTimerNotification,
  completeSetFromNotification,
  computeRecentlyCompletedRecordedExercises,
  cycleExerciseReps,
  deleteSession,
  notifySetTimer,
  persistCurrentSession,
  setCurrentSession,
  setCurrentSessionFromBlueprint,
  setRecentlyCompletedExercises,
} from '@/store/current-session';
import { addEffect } from '@/store/listenerMiddleware';
import { fetchUpcomingSessions } from '@/store/program';
import { LocalDateTime } from '@js-joda/core';

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

  addEffect(
    completeSetFromNotification,
    async (_, { dispatch, getState, extra: { notificationService } }) => {
      await notificationService.clearSetTimerNotification();
      const state = getState();
      const session = Session.fromPOJO(state.currentSession.workoutSession);
      if (session?.nextExercise) {
        const exerciseIndex = session.recordedExercises.indexOf(
          session.nextExercise,
        );
        const setIndex = session.nextExercise.potentialSets.findIndex(
          (x) => !x.set,
        );
        if (setIndex !== -1) {
          dispatch(
            cycleExerciseReps({
              target: 'workoutSession',
              payload: {
                exerciseIndex,
                setIndex,
                time: LocalDateTime.now(),
              },
            }),
          );
          dispatch(notifySetTimer());
        }
      }
    },
  );

  addEffect(
    deleteSession,
    async (action, { extra: { progressRepository } }) => {
      await progressRepository.deleteSession(action.payload);
    },
  );

  addEffect(
    setCurrentSessionFromBlueprint,
    async (action, { dispatch, extra: { sessionService } }) => {
      const session = await sessionService.hydrateSessionFromBlueprint(
        action.payload.blueprint,
      );
      dispatch(setCurrentSession({ session, target: action.payload.target }));
    },
  );

  addEffect(
    computeRecentlyCompletedRecordedExercises,
    async (
      { payload: { max } },
      { dispatch, extra: { progressRepository } },
    ) => {
      const ex =
        await progressRepository.getLatestOrderedRecordedExercises(max);
      dispatch(setRecentlyCompletedExercises(ex));
    },
  );
}
