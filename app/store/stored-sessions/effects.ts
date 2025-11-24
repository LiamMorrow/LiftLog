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
import { LiftLog } from '@/gen/proto';
import { match } from 'ts-pattern';
import { fromSessionDao } from '@/models/storage/conversions.from-dao';
import { toSessionHistoryDao } from '@/models/storage/conversions.to-dao';
import { fetchUpcomingSessions } from '@/store/program';
import { KeyValueStore } from '@/services/key-value-store';
import Enumerable from 'linq';
import { RecordedWeightedExercise, Session } from '@/models/session-models';
import { Weight } from '@/models/weight';
import { setCurrentSession } from '@/store/current-session';

const storageKey = 'Progress';
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
      { cancelActiveListeners, getState, dispatch, extra: { keyValueStore } },
    ) => {
      cancelActiveListeners();
      if (!getState().settings.isHydrated) {
        throw new Error('Settings must be hydrated before stored sessions');
      }
      let version = await keyValueStore.getItem(`${storageKey}-Version`);
      if (!version) {
        version = '2';
        await keyValueStore.setItem(`${storageKey}-Version`, '2');
      }

      const storedData = await match(version)
        .with('2', async () =>
          LiftLog.Ui.Models.SessionHistoryDao.SessionHistoryDaoV2.decode(
            (await keyValueStore.getItemBytes(storageKey)) ??
              Uint8Array.from([]),
          ),
        )
        .otherwise((x) => {
          throw new Error(`Unsupported version ${x}`);
        });
      const preferredUnit = getState().settings.useImperialUnits
        ? 'pounds'
        : 'kilograms';

      // Convert old bodyweights with nil to be the set weight
      const coalesceWeightUnit = (weight: undefined | Weight) =>
        weight?.with({
          unit: weight.unit === 'nil' ? preferredUnit : weight.unit,
        });

      const completedSessionsList =
        storedData?.completedSessions.map((x) => {
          const s = fromSessionDao(x);
          return s.with({
            bodyweight: coalesceWeightUnit(s.bodyweight),
          });
        }) ?? [];
      const completedSessions = Object.fromEntries(
        completedSessionsList.map((x) => [x.id, x.toPOJO()]),
      );
      dispatch(setStoredSessions(completedSessions));

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
    [deleteStoredSession, addStoredSession, upsertStoredSessions],
    async (
      _,
      { cancelActiveListeners, getState, extra: { keyValueStore } },
    ) => {
      cancelActiveListeners();
      const s = LiftLog.Ui.Models.SessionHistoryDao.SessionHistoryDaoV2.encode(
        toSessionHistoryDao(getState().storedSessions.sessions),
      );
      await Promise.all([
        keyValueStore.setItem(`${storageKey}-Version`, '2'),
        keyValueStore.setItem(storageKey, s.finish()),
      ]);
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
