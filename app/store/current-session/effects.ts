import { LiftLog } from '@/gen/proto';
import {
  EmptySession,
  RecordedWeightedExercise,
  Session,
} from '@/models/session-models';
import { fromCurrentSessionDao } from '@/models/storage/conversions.from-dao';
import { toCurrentSessionDao } from '@/models/storage/conversions.to-dao';
import {
  broadcastWorkoutEvent,
  clearSetTimerNotification,
  currentWorkoutSessionUpdated,
  finishCurrentWorkout,
  initializeCurrentSessionStateSlice,
  notifySetTimer,
  persistCurrentSession,
  selectCurrentSession,
  setCurrentPlanDiff,
  setCurrentSession,
  setCurrentSessionFromBlueprint,
  setIsHydrated,
} from '@/store/current-session';
import { addEffect } from '@/store/store';
import { fetchUpcomingSessions, selectActiveProgram } from '@/store/program';
import { addStoredSession } from '@/store/stored-sessions';
import { selectPreferredWeightUnit } from '@/store/settings';
import { diffSessionBlueprints } from '@/models/blueprint-diff';
import { addUnpublishedSessionId } from '@/store/feed';
import { setStatsIsDirty } from '@/store/stats';
import {
  getCardioTimerInfo,
  getTimerInfo,
} from '@/store/current-session/helpers';

const storageKey = 'CurrentSessionStateV1';
export function applyCurrentSessionEffects() {
  addEffect(
    initializeCurrentSessionStateSlice,
    async (_, { dispatch, getState, extra: { keyValueStore, logger } }) => {
      if (!getState().settings.isHydrated) {
        throw new Error('Settings must be hydrated before stored sessions');
      }
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
                session: currentSessionState.workoutSession.withNoNilWeights(
                  selectPreferredWeightUnit(getState()),
                ),
              }),
            );
          }
          if (currentSessionState.historySession) {
            dispatch(
              setCurrentSession({
                target: 'historySession',
                session: currentSessionState.historySession.withNoNilWeights(
                  selectPreferredWeightUnit(getState()),
                ),
              }),
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
      {
        originalState,
        stateAfterReduce,
        dispatch,
        extra: { keyValueStore, logger },
      },
    ) => {
      const shouldPersistChanges =
        stateAfterReduce.currentSession.isHydrated &&
        stateAfterReduce.currentSession !== originalState.currentSession;

      const currentWorkoutSessionChanged =
        originalState.currentSession.workoutSession !==
          stateAfterReduce.currentSession.workoutSession ||
        originalState.currentSession.workoutSessionLastSetTime !==
          stateAfterReduce.currentSession.workoutSessionLastSetTime;
      if (currentWorkoutSessionChanged) {
        dispatch(
          currentWorkoutSessionUpdated({
            before: Session.fromPOJO(
              originalState.currentSession.workoutSession,
            ),
            after: Session.fromPOJO(
              stateAfterReduce.currentSession.workoutSession,
            ),
          }),
        );
      }

      if (shouldPersistChanges) {
        try {
          const currentSessionStateDao = toCurrentSessionDao({
            historySession: Session.fromPOJO(
              stateAfterReduce.currentSession.historySession,
            ),
            workoutSession: Session.fromPOJO(
              stateAfterReduce.currentSession.workoutSession,
            ),
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

  addEffect(finishCurrentWorkout, (a, { dispatch, getState }) => {
    const session = selectCurrentSession(getState(), a.payload);
    if (session) dispatch(addUnpublishedSessionId(session.id));

    dispatch(persistCurrentSession(a.payload));
    dispatch(setStatsIsDirty(true));
  });

  addEffect(persistCurrentSession, async (a, { dispatch, getState }) => {
    dispatch(clearSetTimerNotification());
    const session = selectCurrentSession(getState(), a.payload);
    const program = selectActiveProgram(getState());
    if (session) {
      dispatch(addStoredSession(session));
      const sessionInPlan = program.sessions.some((x) =>
        x.equals(session.blueprint),
      );
      if (!sessionInPlan) {
        const sessionWithSameNameInPlan = program.sessions.find(
          (x) => x.name === session.blueprint.name,
        );
        dispatch(
          setCurrentPlanDiff(
            sessionWithSameNameInPlan
              ? {
                  type: 'diff',
                  diff: diffSessionBlueprints(
                    sessionWithSameNameInPlan,
                    session.blueprint,
                  ),
                  sessionIndex: program.sessions.indexOf(
                    sessionWithSameNameInPlan,
                  ),
                }
              : {
                  type: 'add',
                  diff: diffSessionBlueprints(
                    EmptySession.blueprint,
                    session.blueprint,
                  ),
                },
          ),
        );
      }
    }
    dispatch(setCurrentSession({ target: a.payload, session: undefined }));
    dispatch(fetchUpcomingSessions());
  });

  addEffect(
    currentWorkoutSessionUpdated,
    (action, { dispatch, stateAfterReduce }) => {
      const previousValue = action.payload.before;
      const currentValue = action.payload.after;
      if (!previousValue && currentValue) {
        dispatch(broadcastWorkoutEvent({ type: 'WorkoutStartedEvent' }));
      }
      if (currentValue) {
        dispatch(
          broadcastWorkoutEvent({
            type: 'WorkoutUpdatedEvent',
            workout: currentValue,
            restTimerInfo: getTimerInfo(
              currentValue,
              stateAfterReduce.currentSession.workoutSessionLastSetTime,
            ),
            cardioTimerInfo: getCardioTimerInfo(currentValue),
          }),
        );
      }
      if (previousValue && !currentValue) {
        dispatch(broadcastWorkoutEvent({ type: 'WorkoutEndedEvent' }));
      }
    },
  );

  addEffect(
    broadcastWorkoutEvent,
    (action, { extra: { workoutWorkerService } }) => {
      workoutWorkerService.broadcast(action.payload);
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
      const lastExercise = session?.lastExercise;
      if (
        session?.nextExercise &&
        lastExercise &&
        lastExercise.latestTime &&
        lastExercise instanceof RecordedWeightedExercise
      ) {
        await notificationService.scheduleNextSetNotification(lastExercise);
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
