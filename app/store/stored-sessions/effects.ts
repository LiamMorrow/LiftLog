import { addDebouncedEffect, addEffect } from '@/store/store';
import {
  addStoredSession,
  deleteExercise,
  deleteStoredSession,
  ExerciseDescriptor,
  initializeStoredSessionsStateSlice,
  setExercises,
  setIsHydrated,
  setStoredSessions,
  updateExercise,
  upsertStoredSessions,
} from './index';
import { LiftLog } from '@/gen/proto';
import { match } from 'ts-pattern';
import { fromSessionDao } from '@/models/storage/conversions.from-dao';
import { toSessionHistoryDao } from '@/models/storage/conversions.to-dao';
import { fetchUpcomingSessions } from '@/store/program';

const storageKey = 'Progress';
const exerciseListStorageKey = 'ExerciseList';

export function applyStoredSessionsEffects() {
  addEffect(
    initializeStoredSessionsStateSlice,
    async (
      _,
      { cancelActiveListeners, dispatch, extra: { keyValueStore } },
    ) => {
      cancelActiveListeners();
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

      const map = Object.fromEntries(
        storedData?.completedSessions
          .map(fromSessionDao)
          .map((x) => [x.id, x.toPOJO()]) ?? [],
      );
      dispatch(setStoredSessions(map));

      const { exercises } = await import('../../assets/exercises.json');
      const builtInExercises = exercises.reduce(
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

      dispatch(setExercises({ ...builtInExercises, ...savedExercises }));

      dispatch(setIsHydrated(true));
      dispatch(fetchUpcomingSessions());
    },
  );

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
      await keyValueStore.setItem(exerciseListStorageKey, JSON.stringify(data));
    },
  );
}
