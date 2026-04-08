import { addDebouncedEffect, addEffect } from '@/store/store';
import {
  addStoredSession,
  checkIfWeightMigrationRequired,
  deleteExercise,
  deleteStoredSession,
  ExerciseDescriptor,
  initializeStoredSessionsStateSlice,
  migrateExerciseWeights,
  selectSessions,
  setExercises,
  setExercisesRequiringWeightMigration,
  setIsHydrated,
  setStoredSessions,
  updateExercise,
  upsertStoredSessions,
  WeightMigrateableExercise,
} from './index';
import { fetchUpcomingSessions } from '@/store/program';
import { KeyValueStore } from '@/services/key-value-store';
import Enumerable from 'linq';
import {
  RecordedWeightedExercise,
  Session,
  SessionPOJO,
} from '@/models/session-models';
import { setCurrentSession } from '@/store/current-session';
import { sessionsSchema } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { LatestVersion } from '@/models/storage/versions/latest';

const exerciseListStorageKey = 'ExerciseList';
// We keep track of added builting exerciseIds (which are the exercise name for builtins)
// Then we make sure builtins don't get re-added if they are deleted
const addedBuiltInExerciseIdsStorageKey = 'AddedBuiltInExerciseIdList';

export function applyStoredSessionsEffects() {
  // Dispatched AFTER settings, so we can safely access settings
  addEffect(
    initializeStoredSessionsStateSlice,
    async (
      _,
      {
        cancelActiveListeners,
        getState,
        dispatch,
        extra: { keyValueStore, db, logger },
      },
    ) => {
      cancelActiveListeners();
      if (!getState().settings.isHydrated) {
        throw new Error('Settings must be hydrated before stored sessions');
      }
      await logger.time('initializeStoredSessions', async () => {
        const completedSessions = (
          await db.select().from(sessionsSchema)
        ).reduce(
          (accum, row) => {
            accum[row.id] = Session.fromJSON(row.payload).toPOJO();
            return accum;
          },
          {} as Record<string, SessionPOJO>,
        );
        dispatch(setStoredSessions(completedSessions));
      });

      const { exercises } = await import('../../assets/exercises.json');
      const alreadyAddedBuiltIns = JSON.parse(
        (await keyValueStore.getItem(addedBuiltInExerciseIdsStorageKey)) ??
          '[]',
      ) as string[];
      const builtInExercisesNotAlreadyAdded = exercises
        .filter((x) => !alreadyAddedBuiltIns.includes(x.name))
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
      const savedExercises = JSON.parse(
        (await keyValueStore.getItem(exerciseListStorageKey)) ?? '{}',
      ) as Record<string, ExerciseDescriptor>;

      const currentExercises = Object.entries({
        ...builtInExercisesNotAlreadyAdded,
        ...savedExercises,
      }).sort((a, b) => a[1].name.localeCompare(b[1].name));

      dispatch(setExercises(Object.fromEntries(currentExercises)));

      // We added some, so we should persist it
      if (Object.keys(builtInExercisesNotAlreadyAdded).length) {
        await persistExercises(
          getState().storedSessions.savedExercises,
          keyValueStore,
        );
      }

      const newBuiltIns = alreadyAddedBuiltIns.concat(
        Object.keys(builtInExercisesNotAlreadyAdded),
      );
      await keyValueStore.setItem(
        addedBuiltInExerciseIdsStorageKey,
        JSON.stringify(newBuiltIns),
      );

      dispatch(checkIfWeightMigrationRequired());

      dispatch(setIsHydrated(true));
      dispatch(fetchUpcomingSessions());
    },
  );

  addEffect(
    checkIfWeightMigrationRequired,
    (_, { dispatch, stateAfterReduce }) => {
      const completedSessionsList = selectSessions(stateAfterReduce);

      const weightsNeedMigration = Enumerable.from(completedSessionsList)
        .selectMany((x) =>
          Enumerable.from(x.recordedExercises)
            .ofType<RecordedWeightedExercise>(RecordedWeightedExercise)
            .selectMany((ex) =>
              Enumerable.from(ex.potentialSets)
                .where((set) => set.weight.unit === 'nil')
                .select(() => ex)
                .take(1),
            ),
        )
        .select(
          (ex) =>
            ({
              name: ex.blueprint.name,
              unit: 'nil',
            }) satisfies WeightMigrateableExercise,
        )
        .distinct((x) => x.name)
        .orderBy((x) => x.name)
        .toArray();
      dispatch(setExercisesRequiringWeightMigration(weightsNeedMigration));
    },
  );

  addEffect(migrateExerciseWeights, (_, { dispatch, stateAfterReduce }) => {
    const sessions = selectSessions(stateAfterReduce);
    const migrations =
      stateAfterReduce.storedSessions.exercisesRequiringWeightMigration;
    const findUnit = (exerciseName: string) =>
      migrations.find((x) => x.name === exerciseName)?.unit;
    const applyWeightToSession = (session: Session) =>
      session.with({
        recordedExercises: session.recordedExercises.map((re) =>
          re instanceof RecordedWeightedExercise
            ? re.with({
                potentialSets: re.potentialSets.map((ps) =>
                  ps
                    .with({
                      weight: ps.weight.with({
                        unit:
                          ps.weight.unit === 'nil'
                            ? (findUnit(re.blueprint.name) ?? 'nil')
                            : ps.weight.unit,
                      }),
                    })
                    .toPOJO(),
                ),
              })
            : re,
        ),
      });
    const newSessions = sessions.map(applyWeightToSession);
    const currentSession = Session.fromPOJO(
      stateAfterReduce.currentSession.workoutSession,
    );
    if (currentSession) {
      dispatch(
        setCurrentSession({
          target: 'workoutSession',
          session: applyWeightToSession(currentSession),
        }),
      );
    }
    dispatch(upsertStoredSessions(newSessions));
    dispatch(fetchUpcomingSessions());
    dispatch(setExercisesRequiringWeightMigration([]));
  });

  addEffect(
    addStoredSession,
    async (a, { getState, extra: { healthExportService, logger } }) => {
      const workout = a.payload;
      if (
        !getState().settings.exportToHealthAggregator ||
        !healthExportService.canExport()
      ) {
        return;
      }
      try {
        await healthExportService.exportWorkout(workout);
      } catch (e) {
        logger.error('Failed to sync to health aggregator', e);
      }
    },
  );

  addEffect(
    deleteStoredSession,
    async (
      action,
      { stateAfterReduce, extra: { healthExportService, logger, db } },
    ) => {
      const workoutId = action.payload;
      if (
        !stateAfterReduce.settings.exportToHealthAggregator ||
        !healthExportService.canExport()
      ) {
        return;
      }
      try {
        await healthExportService.deleteWorkout(workoutId);
      } catch (e) {
        logger.error('Failed to delete workout from HealthConnect', e);
      }
      await logger.time('deleteStoredSession', async () => {
        await db
          .delete(sessionsSchema)
          .where(eq(sessionsSchema.id, action.payload));
      });
    },
  );

  addEffect(
    addStoredSession,
    async (action, { cancelActiveListeners, extra: { db, logger } }) => {
      cancelActiveListeners();
      await logger.time('addStoredSession', async () => {
        const payload = action.payload.toJSON();
        await db
          .insert(sessionsSchema)
          .values({
            id: action.payload.id,
            modelVersion: LatestVersion,
            payload,
          })
          .onConflictDoUpdate({
            target: sessionsSchema.id,
            set: {
              payload: sql.raw(`excluded.${sessionsSchema.payload.name}`),
              modelVersion: LatestVersion,
            },
          });
      });
    },
  );

  addEffect(
    upsertStoredSessions,
    async (action, { cancelActiveListeners, extra: { db, logger } }) => {
      cancelActiveListeners();
      await logger.time('upsertStoredSessions', async () => {
        const toUpsert = action.payload.map((x) => ({
          id: x.id,
          modelVersion: LatestVersion,
          payload: x.toJSON(),
        }));
        await db
          .insert(sessionsSchema)
          .values(toUpsert)
          .onConflictDoUpdate({
            target: sessionsSchema.id,
            set: {
              payload: sql.raw(`excluded.${sessionsSchema.payload.name}`),
              modelVersion: LatestVersion,
            },
          });
      });
    },
  );

  addDebouncedEffect(
    [updateExercise, deleteExercise, setExercises],
    async (_, { stateAfterReduce, extra: { keyValueStore } }) => {
      if (!stateAfterReduce.storedSessions.isHydrated) {
        return;
      }

      const data = stateAfterReduce.storedSessions.savedExercises;
      await persistExercises(data, keyValueStore);
    },
  );

  async function persistExercises(
    exercises: Record<string, ExerciseDescriptor>,
    keyValueStore: KeyValueStore,
  ) {
    await keyValueStore.setItem(
      exerciseListStorageKey,
      JSON.stringify(exercises),
    );
  }
}
