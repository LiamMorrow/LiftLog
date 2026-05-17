import { LiftLog } from '@/gen/proto';
import { EmptySession, Session } from '@/models/session-models';
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
import { AddEffectFn } from '@/store/store';
import { fetchUpcomingSessions, selectActiveProgram } from '@/store/program';
import {
  addStoredSession,
  selectLatestExercises,
} from '@/store/stored-sessions';
import { selectPreferredWeightUnit } from '@/store/settings';
import { diffSessionBlueprints } from '@/models/blueprint-diff';
import { addUnpublishedSessionId } from '@/store/feed';
import { setStatsIsDirty } from '@/store/stats';
import {
  getCardioTimerInfo,
  getCurrentExerciseDetails,
  getTimerInfo,
} from '@/store/current-session/helpers';
import { ProtobufToJsonV1Migrator } from '@/models/storage/versions/v1/protobuf-migrator';
import { toDurationJSON } from '@/models/storage/versions/latest';
import { Duration, OffsetDateTime } from '@js-joda/core';

const storageKey = 'CurrentSessionStateV1';
export function applyCurrentSessionEffects(addEffect: AddEffectFn) {
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
    setCurrentSession,
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
        stateAfterReduce.currentSession.workoutSession;
      if (currentWorkoutSessionChanged) {
        dispatch(
          currentWorkoutSessionUpdated({
            before: originalState.currentSession.workoutSession,
            after: stateAfterReduce.currentSession.workoutSession,
          }),
        );
      }

      if (shouldPersistChanges) {
        try {
          const currentSessionStateDao = toCurrentSessionDao({
            historySession: stateAfterReduce.currentSession.historySession,
            workoutSession: stateAfterReduce.currentSession.workoutSession,
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
    if (session) {
      dispatch(addUnpublishedSessionId(session.id));
    }

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

  addEffect(currentWorkoutSessionUpdated, (action, { dispatch }) => {
    const previousValue = action.payload.before;
    const currentValue = action.payload.after;
    if (!previousValue && currentValue) {
      dispatch(broadcastWorkoutEvent({ type: 'WorkoutStartedEvent' }));
    }
    if (
      currentValue?.restTimerEndTime &&
      !currentValue.restTimerEndTime?.isEqual(
        previousValue?.restTimerEndTime ?? OffsetDateTime.MAX,
      )
    ) {
      dispatch(notifySetTimer());
    }
    if (currentValue) {
      dispatch(
        broadcastWorkoutEvent({
          type: 'WorkoutUpdatedEvent',
          workout: currentValue.toJSON(),
          restTimerInfo: getTimerInfo(currentValue),
          cardioTimerInfo: getCardioTimerInfo(currentValue),
          currentExerciseDetails: getCurrentExerciseDetails(currentValue),
          totalWeightLifted: currentValue.totalWeightLifted.toJSON(),
          workoutDuration: toDurationJSON(
            currentValue.duration ?? Duration.ZERO,
          ),
        }),
      );
    }
    if (previousValue && !currentValue) {
      dispatch(broadcastWorkoutEvent({ type: 'WorkoutEndedEvent' }));
    }
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
    async (_, { extra: { notificationService }, getState }) => {
      await notificationService.clearSetTimerNotification();
      const {
        settings: { restNotifications },
        currentSession: { workoutSession },
      } = getState();
      if (!restNotifications) {
        return;
      }
      const restTimerEndTime = workoutSession?.restTimerEndTime;
      if (restTimerEndTime && restTimerEndTime.isAfter(OffsetDateTime.now())) {
        await notificationService.scheduleNextSetNotification(restTimerEndTime);
      }
    },
  );

  addEffect(
    setCurrentSessionFromBlueprint,
    async (
      action,
      { stateAfterReduce, dispatch, extra: { sessionService } },
    ) => {
      const session = sessionService.hydrateSessionFromBlueprint(
        action.payload.blueprint,
        selectLatestExercises(stateAfterReduce),
      );
      dispatch(setCurrentSession({ session, target: action.payload.target }));
    },
  );
}

function toCurrentSessionDao(model: {
  workoutSession: Session | undefined;
  historySession: Session | undefined;
}): LiftLog.Ui.Models.CurrentSessionStateDao.CurrentSessionStateDaoV2 {
  return new LiftLog.Ui.Models.CurrentSessionStateDao.CurrentSessionStateDaoV2({
    historySession:
      (model.historySession && model.historySession.toDao()) ?? null,
    workoutSession:
      (model.workoutSession && model.workoutSession.toDao()) ?? null,
  });
}

export function fromCurrentSessionDao(
  dao: LiftLog.Ui.Models.CurrentSessionStateDao.ICurrentSessionStateDaoV2,
) {
  return {
    workoutSession:
      dao.workoutSession &&
      Session.fromJSON(
        ProtobufToJsonV1Migrator.migrateSession(dao.workoutSession),
      ),
    historySession:
      dao.historySession &&
      Session.fromJSON(
        ProtobufToJsonV1Migrator.migrateSession(dao.historySession),
      ),
  };
}
