import { LiftLog } from '@/gen/proto';
import {
  EmptySession,
  RecordedWeightedExercise,
  Session,
} from '@/models/session-models';
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
  setWorkoutSessionRestTimerStoppedAt,
  stopRestTimer,
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
  getRestTimerExercise,
  getTimerInfo,
} from '@/store/current-session/helpers';
import { ProtobufToJsonV1Migrator } from '@/models/storage/versions/v1/protobuf-migrator';
import { OffsetDateTime } from '@js-joda/core';

const storageKey = 'CurrentSessionStateV1';
const restTimerStoppedAtStorageKey = `${storageKey}-RestTimerStoppedAt`;
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
            const restoredRestTimerStoppedAt =
              getState().currentSession.workoutSessionRestTimerStoppedAt ??
              parseStoredOffsetDateTime(
                await keyValueStore.getItem(restTimerStoppedAtStorageKey),
              );
            dispatch(
              setWorkoutSessionRestTimerStoppedAt(restoredRestTimerStoppedAt),
            );
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
          const restTimerStoppedAt =
            stateAfterReduce.currentSession.workoutSessionRestTimerStoppedAt;
          const bytes =
            LiftLog.Ui.Models.CurrentSessionStateDao.CurrentSessionStateDaoV2.encode(
              currentSessionStateDao,
            ).finish();
          await keyValueStore.setItem(`${storageKey}-Version`, '2');
          await keyValueStore.setItem(storageKey, bytes);
          if (restTimerStoppedAt) {
            await keyValueStore.setItem(
              restTimerStoppedAtStorageKey,
              restTimerStoppedAt.toString(),
            );
          } else {
            await keyValueStore.removeItem(restTimerStoppedAtStorageKey);
          }
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

  addEffect(stopRestTimer, async (_, { extra: { notificationService } }) => {
    await notificationService.clearSetTimerNotification();
  });

  addEffect(
    notifySetTimer,
    async (_, { extra: { notificationService }, getState }) => {
      await notificationService.clearSetTimerNotification();
      const {
        settings: { restNotifications },
        currentSession: {
          workoutSession: sessionPOJO,
          workoutSessionLastSetTime,
        },
      } = getState();
      if (!restNotifications) {
        return;
      }
      const session = Session.fromPOJO(sessionPOJO);
      const restTimerExercise = session
        ? getRestTimerExercise(session, workoutSessionLastSetTime)
        : undefined;
      if (
        session?.nextExercise &&
        restTimerExercise &&
        restTimerExercise.latestTime &&
        restTimerExercise instanceof RecordedWeightedExercise
      ) {
        await notificationService.scheduleNextSetNotification(
          restTimerExercise,
        );
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

function parseStoredOffsetDateTime(value: string | undefined) {
  if (!value) {
    return undefined;
  }
  try {
    return OffsetDateTime.parse(value);
  } catch {
    return undefined;
  }
}
