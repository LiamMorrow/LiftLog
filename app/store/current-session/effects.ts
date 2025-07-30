import { LiftLog } from '@/gen/proto';
import { Session } from '@/models/session-models';
import { fromCurrentSessionDao } from '@/models/storage/conversions.from-dao';
import { toCurrentSessionDao } from '@/models/storage/conversions.to-dao';
import {
  clearSetTimerNotification,
  completeSetFromNotification,
  cycleExerciseReps,
  initializeCurrentSessionStateSlice,
  notifySetTimer,
  persistCurrentSession,
  setCurrentSession,
  setCurrentSessionFromBlueprint,
  setIsHydrated,
  setLatestSetTimerNotificationId,
} from '@/store/current-session';
import { addEffect } from '@/store/store';
import { fetchUpcomingSessions } from '@/store/program';
import { addStoredSession } from '@/store/stored-sessions';
import { LocalDateTime } from '@js-joda/core';

const storageKey = 'CurrentSessionStateV1';
export function applyCurrentSessionEffects() {
  addEffect(
    initializeCurrentSessionStateSlice,
    async (
      _,
      { cancelActiveListeners, dispatch, extra: { keyValueStore, logger } },
    ) => {
      cancelActiveListeners();
      try {
        const sw = performance.now();
        const currentSessionVersion =
          (await keyValueStore.getItem(`${storageKey}-Version`)) ?? '2';

        let currentSessionStateDao:
          | LiftLog.Ui.Models.CurrentSessionStateDao.CurrentSessionStateDaoV2
          | undefined;
        switch (currentSessionVersion) {
          case '2':
            const bytes =
              (await keyValueStore.getItemBytes(storageKey)) ??
              Uint8Array.from([]);
            currentSessionStateDao =
              LiftLog.Ui.Models.CurrentSessionStateDao.CurrentSessionStateDaoV2.decode(
                bytes,
              );
            break;
          default:
            currentSessionStateDao = undefined;
        }
        const deserializationTime = performance.now() - sw;
        logger.info(
          `Deserialized current session state in ${deserializationTime.toFixed(2)}ms`,
        );
        if (currentSessionStateDao) {
          const currentSessionState = fromCurrentSessionDao(
            currentSessionStateDao,
          );
          if (currentSessionState.workoutSession) {
            dispatch(
              setCurrentSession({
                target: 'workoutSession',
                session: currentSessionState.workoutSession,
              }),
            );
          }
          if (currentSessionState.historySession) {
            dispatch(
              setCurrentSession({
                target: 'historySession',
                session: currentSessionState.historySession,
              }),
            );
          }
          if (currentSessionState.latestSetTimerNotificationId) {
            dispatch(
              setLatestSetTimerNotificationId(
                currentSessionState.latestSetTimerNotificationId,
              ),
            );
          }
        }

        dispatch(setIsHydrated(true));
      } catch (e) {
        logger.error('Failed to initialize current session state', e);
        throw e;
      }
    },
  );

  addEffect(
    undefined,
    async (
      _,
      { originalState, stateAfterReduce, extra: { keyValueStore, logger } },
    ) => {
      const shouldPersist =
        stateAfterReduce.currentSession.isHydrated &&
        stateAfterReduce.currentSession !== originalState.currentSession;
      if (shouldPersist) {
        try {
          const currentSessionStateDao = toCurrentSessionDao({
            historySession: Session.fromPOJO(
              stateAfterReduce.currentSession.historySession,
            ),
            workoutSession: Session.fromPOJO(
              stateAfterReduce.currentSession.workoutSession,
            ),
            latestSetTimerNotificationId:
              stateAfterReduce.currentSession.latestSetTimerNotificationId,
          });
          const bytes =
            LiftLog.Ui.Models.CurrentSessionStateDao.CurrentSessionStateDaoV2.encode(
              currentSessionStateDao,
            ).finish();
          await keyValueStore.setItem(`${storageKey}-Version`, '2');
          await keyValueStore.setItem(storageKey, bytes);
        } catch (e) {
          logger.error('Failed to persist current session state', e);
        }
      }
    },
  );

  addEffect(persistCurrentSession, async (a, { dispatch, getState }) => {
    dispatch(clearSetTimerNotification());
    const session = getState().currentSession[a.payload];
    if (session) {
      dispatch(addStoredSession(Session.fromPOJO(session)));
    }
    dispatch(setCurrentSession({ target: a.payload, session: undefined }));
    dispatch(fetchUpcomingSessions());
  });

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
    setCurrentSessionFromBlueprint,
    async (action, { dispatch, extra: { sessionService } }) => {
      const session = sessionService.hydrateSessionFromBlueprint(
        action.payload.blueprint,
      );
      dispatch(setCurrentSession({ session, target: action.payload.target }));
    },
  );
}
