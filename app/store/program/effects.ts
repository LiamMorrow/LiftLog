import { BuiltInPrograms } from '@/models/built-in-programs';
import { RemoteData } from '@/models/remote';
import { ProgramBlueprint } from '@/models/blueprint-models';
import { addEffect, RootState } from '@/store/store';
import {
  fetchUpcomingSessions,
  initializeProgramStateSlice,
  savePlan,
  selectActiveProgram,
  setActivePlan,
  setIsHydrated,
  setSavedPlans,
  setUpcomingSessions,
} from '@/store/program';
import { uuid } from '@/utils/uuid';
import { AsyncStream } from 'data-async-iterators';
import { Logger } from '@/services/logger';
import { selectLatestExercises } from '../stored-sessions';
import { programsSchema } from '@/db/schema';
import {
  LatestVersion,
  toLocalDateJSON,
} from '@/models/storage/versions/latest';
import { LocalDate } from '@js-joda/core';
import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { toRecord } from '@/utils/reduce';

const builtInProgramsStorageKey = 'hasSavedDefaultPlans2';
export function applyProgramEffects() {
  addEffect(
    initializeProgramStateSlice,
    async (
      _,
      {
        getState,
        cancelActiveListeners,
        dispatch,
        extra: { keyValueStore, logger, db },
      },
    ) => {
      const start = performance.now();
      cancelActiveListeners();

      let activePlanId: string | undefined;
      const dbPrograms = await db.select().from(programsSchema);
      const programs = (
        dbPrograms.length ? dbPrograms : [getEmptyInitialProgram()]
      ).reduce(
        toRecord(
          (x) => x.id,
          (row) => {
            if (row.active) {
              activePlanId = row.id;
            }
            return ProgramBlueprint.fromJSON(row.payload);
          },
        ),
        {},
      );
      dispatch(setSavedPlans(programs));

      if (!(await keyValueStore.getItem(builtInProgramsStorageKey))) {
        for (const [id, program] of Object.entries(BuiltInPrograms)) {
          if (id in getState().program.savedPrograms) {
            continue;
          }
          dispatch(savePlan({ programId: id, programBlueprint: program }));
        }
        await persistPrograms(getState(), db, logger);
        await keyValueStore.setItem(builtInProgramsStorageKey, 'true');
      }
      if (!activePlanId || !getState().program.savedPrograms[activePlanId]) {
        activePlanId = Object.keys(getState().program.savedPrograms)[0];
      }

      dispatch(setActivePlan({ activePlanId }));

      dispatch(setIsHydrated(true));
      const end = performance.now();
      logger.info(
        `initializeProgramStateSlice effect took ${(end - start).toFixed(2)} ms`,
      );
    },
  );

  // Persist after changes
  addEffect(
    undefined,
    async (_, { originalState, stateAfterReduce, extra: { db, logger } }) => {
      const start = performance.now();
      const shouldPersist =
        stateAfterReduce.program.isHydrated &&
        (stateAfterReduce.program.activePlanId !==
          originalState.program.activePlanId ||
          stateAfterReduce.program.savedPrograms !==
            originalState.program.savedPrograms);
      if (shouldPersist) {
        await persistPrograms(stateAfterReduce, db, logger);
        const end = performance.now();
        logger.info(
          `Persist program state effect took ${(end - start).toFixed(2)} ms`,
        );
      }
    },
  );

  addEffect(
    fetchUpcomingSessions,
    async (
      _,
      {
        signal,
        cancelActiveListeners,
        dispatch,
        getState,
        extra: { sessionService, logger },
      },
    ) => {
      const start = performance.now();
      cancelActiveListeners();
      await yieldToEventLoop();

      const state = getState();
      const sessionBlueprints = selectActiveProgram(state).sessions;
      const numberOfUpcomingSessions = sessionBlueprints.length;

      if (signal.aborted) {
        return;
      }
      await yieldToEventLoop();

      const sessions = await AsyncStream.from(
        sessionService.getUpcomingSessions(
          sessionBlueprints,
          selectLatestExercises(state),
        ),
      )
        .takeWhile(() => !signal.aborted)
        .take(numberOfUpcomingSessions)
        .toArray();
      dispatch(setUpcomingSessions(RemoteData.success(sessions)));
      const end = performance.now();
      logger.info(
        `fetchUpcomingSessions effect took ${(end - start).toFixed(2)} ms`,
      );
    },
  );
}
// Helper function to yield control back to the event loop
const yieldToEventLoop = () => new Promise((resolve) => setTimeout(resolve, 5));

async function persistPrograms(
  stateAfterReduce: RootState,
  db: ExpoSQLiteDatabase,
  logger: Logger,
) {
  try {
    await db.transaction(async (tx) => {
      await tx.delete(programsSchema);
      await tx.insert(programsSchema).values(
        Object.entries(stateAfterReduce.program.savedPrograms).map(
          ([key, program]) => ({
            id: key,
            modelVersion: LatestVersion,
            active: key === stateAfterReduce.program.activePlanId,
            payload: ProgramBlueprint.fromPOJO(program).toJSON(),
          }),
        ),
      );
    });
  } catch (e) {
    logger.error('Failed to persist program state', e);
  }
}

function getEmptyInitialProgram(): typeof programsSchema.$inferSelect {
  return {
    id: uuid(),
    modelVersion: LatestVersion,
    active: true,
    payload: {
      lastEdited: toLocalDateJSON(LocalDate.now()),
      name: 'My Plan',
      sessions: [],
    },
  };
}
