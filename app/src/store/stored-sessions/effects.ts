import { AddEffectFn } from '@/store/store';
import {
  addStoredSession,
  deleteExercise,
  deleteStoredSession,
  initializeStoredSessionsStateSlice,
  setExercises,
  setIsHydrated,
  setStoredSessions,
  updateExercise,
  upsertStoredSessions,
} from './index';
import { fetchUpcomingSessions } from '@/store/program';
import { Session } from '@/models/session-models';
import { exercisesSchema, sessionsSchema } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { toRecord } from '@/utils/reduce';
import { ExerciseDescriptor, fromExerciseDescriptorJSON, toExerciseDescriptorJSON } from '@/models/exercise-models';
import { KeyValueStore } from '@/services/key-value-store';

// We keep track of added builting exerciseIds (which are the exercise name for builtins)
// Then we make sure builtins don't get re-added if they are deleted
const addedBuiltInExerciseIdsStorageKey = 'AddedBuiltInExerciseIdList';

// Session ids queued before each health export and cleared on success, so exports lost to
// process death are retried on next launch. Re-exports are idempotent (keyed by workout id).
const pendingHealthExportSessionIdsStorageKey = 'PendingHealthExportSessionIdList';

async function getPendingHealthExportSessionIds(keyValueStore: KeyValueStore): Promise<string[]> {
  return JSON.parse((await keyValueStore.getItem(pendingHealthExportSessionIdsStorageKey)) ?? '[]') as string[];
}

// Serialized so concurrent effects can't interleave read-modify-write on the key
let pendingHealthExportUpdateChain: Promise<unknown> = Promise.resolve();
function updatePendingHealthExportIds(
  keyValueStore: KeyValueStore,
  update: (ids: string[]) => string[],
): Promise<void> {
  const run = pendingHealthExportUpdateChain.then(async () => {
    const ids = await getPendingHealthExportSessionIds(keyValueStore);
    await keyValueStore.setItem(pendingHealthExportSessionIdsStorageKey, JSON.stringify(update(ids)));
  });
  pendingHealthExportUpdateChain = run.catch(() => undefined);
  return run;
}
export function applyStoredSessionsEffects(addEffect: AddEffectFn) {
  // Dispatched AFTER settings, so we can safely access settings
  addEffect(
    initializeStoredSessionsStateSlice,
    async (_, { cancelActiveListeners, getState, dispatch, extra: { keyValueStore, db, logger } }) => {
      cancelActiveListeners();
      if (!getState().settings.isHydrated) {
        throw new Error('Settings must be hydrated before stored sessions');
      }
      await logger.time('initializeStoredSessions', async () => {
        const completedSessions = (await db.select().from(sessionsSchema)).reduce(
          toRecord(
            (x) => x.id,
            (row) => Session.fromJSON(row.payload),
          ),
          {},
        );
        dispatch(setStoredSessions(completedSessions));
      });

      const { exercises: builtInExerciseList } = await import('../../../assets/exercises.json');
      const builtinExercisesAddedInThePast = JSON.parse(
        (await keyValueStore.getItem(addedBuiltInExerciseIdsStorageKey)) ?? '[]',
      ) as string[];
      const savedExercises = (await db.select().from(exercisesSchema)).reduce(
        toRecord(
          (x) => x.id,
          (x) => fromExerciseDescriptorJSON(x.payload),
        ),
        {},
      );
      const builtInExercisesNotAlreadyAdded = builtInExerciseList
        .filter((x) => !builtinExercisesAddedInThePast.includes(x.name))
        .reduce(
          (a, b) => {
            a[b.name] = {
              name: b.name,
              force: b.force,
              level: b.level,
              mechanic: b.mechanic,
              equipment: b.equipment,
              category: b.category,
              instructions: b.instructions.join('\n'),
              muscles: b.primaryMuscles.concat(b.secondaryMuscles),
            };
            return a;
          },
          {} as Record<string, ExerciseDescriptor>,
        );

      const currentExercises = Object.entries({
        ...builtInExercisesNotAlreadyAdded,
        ...savedExercises,
      }).sort((a, b) => a[1].name.localeCompare(b[1].name));

      Object.entries(builtInExercisesNotAlreadyAdded).forEach(([id, ex]) => {
        dispatch(updateExercise({ id, exercise: ex }));
      });

      dispatch(setExercises(Object.fromEntries(currentExercises)));

      const newBuiltIns: string[] = builtinExercisesAddedInThePast.concat(Object.keys(builtInExercisesNotAlreadyAdded));
      await keyValueStore.setItem(addedBuiltInExerciseIdsStorageKey, JSON.stringify(newBuiltIns));

      dispatch(setIsHydrated(true));
      dispatch(fetchUpcomingSessions());
    },
  );

  addEffect(addStoredSession, async (a, { getState, extra: { healthExportService, keyValueStore, logger } }) => {
    const workout = a.payload;
    if (!getState().settings.exportToHealthAggregator || !healthExportService.canExport()) {
      return;
    }
    await updatePendingHealthExportIds(keyValueStore, (ids) =>
      ids.includes(workout.id) ? ids : ids.concat(workout.id),
    );
    try {
      await healthExportService.exportWorkout(workout);
      await updatePendingHealthExportIds(keyValueStore, (ids) => ids.filter((id) => id !== workout.id));
    } catch (e) {
      logger.error('Failed to sync to health aggregator', e);
    }
  });

  // Retry queued exports that never completed
  addEffect(setIsHydrated, async (action, { getState, extra: { healthExportService, keyValueStore, logger } }) => {
    if (!action.payload) {
      return;
    }
    const state = getState();
    if (!state.settings.exportToHealthAggregator || !healthExportService.canExport()) {
      return;
    }
    for (const sessionId of await getPendingHealthExportSessionIds(keyValueStore)) {
      const workout = state.storedSessions.sessions[sessionId];
      try {
        if (workout) {
          await healthExportService.exportWorkout(workout);
        }
        // A session deleted since it was queued is dropped rather than retried forever
        await updatePendingHealthExportIds(keyValueStore, (ids) => ids.filter((id) => id !== sessionId));
      } catch (e) {
        logger.error('Failed to sync to health aggregator', e);
      }
    }
  });

  addEffect(deleteStoredSession, async (action, { extra: { logger, db } }) => {
    await logger.time('deleteStoredSession', async () => {
      await db.delete(sessionsSchema).where(eq(sessionsSchema.id, action.payload));
    });
  });
  addEffect(deleteStoredSession, async (action, { stateAfterReduce, extra: { healthExportService, logger } }) => {
    const workoutId = action.payload;
    if (!stateAfterReduce.settings.exportToHealthAggregator || !healthExportService.canExport()) {
      return;
    }
    try {
      await healthExportService.deleteWorkout(workoutId);
    } catch (e) {
      logger.error('Failed to delete workout from HealthConnect', e);
    }
  });

  addEffect(addStoredSession, async (action, { cancelActiveListeners, extra: { db, logger } }) => {
    cancelActiveListeners();
    await logger.time('addStoredSession', async () => {
      const payload = action.payload.toJSON();
      await db
        .insert(sessionsSchema)
        .values({
          id: action.payload.id,
          payload,
        })
        .onConflictDoUpdate({
          target: sessionsSchema.id,
          set: {
            payload: sql.raw(`excluded.${sessionsSchema.payload.name}`),
          },
        });
    });
  });

  addEffect(upsertStoredSessions, async (action, { cancelActiveListeners, extra: { db, logger } }) => {
    cancelActiveListeners();
    await logger.time('upsertStoredSessions', async () => {
      const toUpsert = action.payload.map((x) => ({
        id: x.id,
        payload: x.toJSON(),
      }));
      await db
        .insert(sessionsSchema)
        .values(toUpsert)
        .onConflictDoUpdate({
          target: sessionsSchema.id,
          set: {
            payload: sql.raw(`excluded.${sessionsSchema.payload.name}`),
          },
        });
    });
  });

  addEffect(deleteExercise, async (action, { extra: { db } }) => {
    await db.delete(exercisesSchema).where(eq(exercisesSchema.id, action.payload));
  });

  addEffect(updateExercise, async (action, { extra: { db } }) => {
    await db
      .insert(exercisesSchema)
      .values({
        id: action.payload.id,
        payload: toExerciseDescriptorJSON(action.payload.exercise),
      })
      .onConflictDoUpdate({
        target: exercisesSchema.id,
        set: {
          payload: sql.raw(`excluded.${exercisesSchema.payload.name}`),
        },
      });
  });

  addEffect(setExercises, async (action, { stateAfterReduce, extra: { db } }) => {
    if (!stateAfterReduce.storedSessions.isHydrated) {
      return;
    }
    await db.transaction(async (tx) => {
      await tx.delete(exercisesSchema);
      await tx.insert(exercisesSchema).values(
        Object.entries(action.payload).map(([id, exercise]) => ({
          id,
          payload: toExerciseDescriptorJSON(exercise),
        })),
      );
    });
  });
}
