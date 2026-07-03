import { LiftLog } from '@/gen/proto';
import { Session } from '@/models/session-models';
import {
  broadcastWorkoutEvent,
  clearSetTimerNotification,
  currentWorkoutSessionUpdated,
  finishCurrentWorkout,
  initializeCurrentSessionStateSlice,
  notifySetTimer,
  persistCurrentSession,
  selectCurrentSession,
  setCurrentSession,
  setCurrentSessionFromBlueprint,
  setIsHydrated,
} from '@/store/current-session';
import { AddEffectFn, RootState } from '@/store/store';
import { fetchUpcomingSessions } from '@/store/program';
import { addStoredSession, selectLatestExercises } from '@/store/stored-sessions';
import { selectPreferredWeightUnit } from '@/store/settings';
import { addUnpublishedSessionId } from '@/store/feed';
import { setStatsIsDirty } from '@/store/stats';
import { getCardioTimerInfo, getCurrentExerciseDetails, getTimerInfo } from '@/store/current-session/helpers';
import { ProtobufToJsonV1Migrator } from '@/models/storage/versions/initial/protobuf-migrator';
import { fromJsonString, JsonString, toDurationJSON, toJsonString } from '@/models/storage/versions/latest';
import { Duration, OffsetDateTime } from '@js-joda/core';
import { Dispatch } from '@reduxjs/toolkit';
import { KeyValueStore } from '@/services/key-value-store';
import { AnyVersionSessionJSON } from '@/models/storage/versions/any';
import { copyLogs, showSnackbar } from '@/store/app';
import { sessionMigrations } from '@/models/storage/versions/migrations/session';

const storageKey = 'CurrentSessionStateV1';
export function applyCurrentSessionEffects(addEffect: AddEffectFn) {
  addEffect(initializeCurrentSessionStateSlice, async (_, { dispatch, getState, extra: { keyValueStore, logger } }) => {
    if (!getState().settings.isHydrated) {
      throw new Error('Settings must be hydrated before stored sessions');
    }
    try {
      const currentSessionVersion = (await keyValueStore.getItem(`${storageKey}-Version`)) ?? '2';

      switch (currentSessionVersion) {
        case '2':
          await handleV2ProtoStorage(dispatch, keyValueStore, getState);
          break;
        case '3':
          await handleV3JsonStorage(dispatch, keyValueStore);
          break;
      }

      dispatch(setIsHydrated(true));
    } catch (e) {
      logger.error('Failed to initialize current session state', e);
      dispatch(setIsHydrated(true));
      dispatch(
        showSnackbar({
          text: 'Failed to load current session. Please submit a bug report with your logs in settings!',
          action: 'Copy logs',
          dispatchAction: copyLogs(),
        }),
      );
    }
  });

  addEffect(
    setCurrentSession,
    async (_, { stateBeforeReduce, stateAfterReduce, dispatch, extra: { keyValueStore, logger } }) => {
      const shouldPersistChanges =
        stateAfterReduce.currentSession.isHydrated &&
        stateAfterReduce.currentSession !== stateBeforeReduce.currentSession;

      const currentWorkoutSessionChanged =
        stateBeforeReduce.currentSession.workoutSession !== stateAfterReduce.currentSession.workoutSession;
      if (currentWorkoutSessionChanged) {
        dispatch(
          currentWorkoutSessionUpdated({
            before: stateBeforeReduce.currentSession.workoutSession,
            after: stateAfterReduce.currentSession.workoutSession,
          }),
        );
      }

      if (shouldPersistChanges) {
        try {
          await keyValueStore.setItem(`${storageKey}-Version`, '3');
          if (stateAfterReduce.currentSession.workoutSession) {
            await keyValueStore.setItem(
              storageKey,
              toJsonString(stateAfterReduce.currentSession.workoutSession.toJSON()),
            );
          } else {
            await keyValueStore.removeItem(storageKey);
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
    if (session) {
      dispatch(addStoredSession(session));
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
      !currentValue.restTimerEndTime?.isEqual(previousValue?.restTimerEndTime ?? OffsetDateTime.MAX)
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
          workoutDuration: toDurationJSON(currentValue.duration ?? Duration.ZERO),
        }),
      );
    }
    if (previousValue && !currentValue) {
      dispatch(broadcastWorkoutEvent({ type: 'WorkoutEndedEvent' }));
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
  });

  addEffect(
    setCurrentSessionFromBlueprint,
    async (action, { stateAfterReduce, dispatch, extra: { sessionService } }) => {
      const session = sessionService.hydrateSessionFromBlueprint(
        action.payload.blueprint,
        selectLatestExercises(stateAfterReduce),
      );
      dispatch(setCurrentSession({ session, target: action.payload.target }));
    },
  );
}

function fromCurrentSessionDao(dao: LiftLog.Ui.Models.CurrentSessionStateDao.ICurrentSessionStateDaoV2) {
  return {
    workoutSession:
      dao.workoutSession &&
      Session.fromJSON(sessionMigrations.migrate(ProtobufToJsonV1Migrator.migrateSession(dao.workoutSession))),
    historySession:
      dao.historySession &&
      Session.fromJSON(sessionMigrations.migrate(ProtobufToJsonV1Migrator.migrateSession(dao.historySession))),
  };
}

async function handleV2ProtoStorage(dispatch: Dispatch, keyValueStore: KeyValueStore, getState: () => RootState) {
  const bytes = (await keyValueStore.getItemBytes(storageKey)) ?? Uint8Array.from([]);
  const currentSessionStateDao = LiftLog.Ui.Models.CurrentSessionStateDao.CurrentSessionStateDaoV2.decode(bytes);

  if (currentSessionStateDao) {
    const currentSessionState = fromCurrentSessionDao(currentSessionStateDao);
    if (currentSessionState.workoutSession) {
      dispatch(
        setCurrentSession({
          target: 'workoutSession',
          session: currentSessionState.workoutSession.withNoNilWeights(selectPreferredWeightUnit(getState())),
        }),
      );
    }
    if (currentSessionState.historySession) {
      dispatch(
        setCurrentSession({
          target: 'historySession',
          session: currentSessionState.historySession.withNoNilWeights(selectPreferredWeightUnit(getState())),
        }),
      );
    }
  }
}

async function handleV3JsonStorage(dispatch: Dispatch, keyValueStore: KeyValueStore) {
  const bytes = (await keyValueStore.getItem(storageKey)) ?? 'null';
  const currentSessionState = fromJsonString(bytes as JsonString<AnyVersionSessionJSON | null>);
  if (!currentSessionState) {
    return;
  }

  dispatch(
    setCurrentSession({
      target: 'workoutSession',
      session: Session.fromJSON(sessionMigrations.migrate(currentSessionState)),
    }),
  );
}
