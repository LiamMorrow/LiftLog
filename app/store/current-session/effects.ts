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
  completeSetFromNotification,
  cycleExerciseReps,
  initializeCurrentSessionStateSlice,
  notifySetTimer,
  persistCurrentSession,
  selectCurrentSession,
  setCurrentPlanDiff,
  setCurrentSession,
  setCurrentSessionFromBlueprint,
  setIsHydrated,
  setLatestSetTimerNotificationId,
} from '@/store/current-session';
import { addEffect } from '@/store/store';
import { fetchUpcomingSessions, selectActiveProgram } from '@/store/program';
import { addStoredSession } from '@/store/stored-sessions';
import { Duration, LocalDateTime, ZoneId } from '@js-joda/core';
import { selectPreferredWeightUnit } from '@/store/settings';
import { diffSessionBlueprints } from '@/models/blueprint-diff';
import { match, P } from 'ts-pattern';

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
      const stateChanged =
        stateAfterReduce.currentSession.isHydrated &&
        stateAfterReduce.currentSession !== originalState.currentSession;
      if (stateChanged) {
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
    if (a.payload === 'workoutSession') {
      dispatch(broadcastWorkoutEvent({ type: 'WorkoutEnded' }));
    }
    dispatch(fetchUpcomingSessions());
  });

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
    async (_, { dispatch, extra: { notificationService }, getState }) => {
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
        const repsPerSet = lastExercise.blueprint.repsPerSet;
        const { minRest, maxRest, failureRest } =
          lastExercise.blueprint.restBetweenSets;

        const rest = match(lastExercise.lastRecordedSet)
          .with(
            { set: { repsCompleted: P.when((x) => x >= repsPerSet) } },
            () => ({ partialRest: minRest, fullRest: maxRest }),
          )
          .with(
            { set: { repsCompleted: P.when((x) => x < repsPerSet) } },
            () => ({ partialRest: failureRest, fullRest: failureRest }),
          )
          .otherwise(() => ({
            partialRest: Duration.ZERO,
            fullRest: Duration.ZERO,
          }));

        if (rest.partialRest.equals(Duration.ZERO)) {
          return;
        }
        const startedAt = lastExercise.latestTime
          .atZone(ZoneId.systemDefault())
          .toInstant();
        const partiallyEndAt = lastExercise.latestTime
          .plus(rest.partialRest)
          .atZone(ZoneId.systemDefault())
          .toInstant();
        const endAt = lastExercise.latestTime
          .plus(rest.fullRest)
          .atZone(ZoneId.systemDefault())
          .toInstant();
        dispatch(
          broadcastWorkoutEvent({
            type: 'TimerStarted',
            startedAt,
            partiallyEndAt,
            endAt,
          }),
        );

        await notificationService.scheduleNextSetNotification(lastExercise);
      }
    },
  );

  addEffect(
    completeSetFromNotification,
    async (_, { dispatch, getState, extra: { notificationService } }) => {
      await notificationService.clearSetTimerNotification();
      const state = getState();
      const session = Session.fromPOJO(state.currentSession.workoutSession);
      if (
        session?.nextExercise &&
        session.nextExercise instanceof RecordedWeightedExercise
      ) {
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
