import { LiftLog } from '@/gen/proto';
import { BuiltInPrograms } from '@/models/built-in-programs';
import { RemoteData } from '@/models/remote';
import { ProgramBlueprint } from '@/models/blueprint-models';
import { fromProgramBlueprintDao } from '@/models/storage/conversions.from-dao';
import {
  toProgramBlueprintDao,
  toStringValue,
} from '@/models/storage/conversions.to-dao';
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
import { LocalDate } from '@js-joda/core';
import { AsyncStream } from 'data-async-iterators';
import { KeyValueStore } from '@/services/key-value-store';
import { Logger } from '@/services/logger';

const storageKey = 'SavedPrograms';
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
        extra: { keyValueStore, logger },
      },
    ) => {
      const start = performance.now();
      cancelActiveListeners();
      // eslint-disable-next-line prefer-const
      let [version, programBytes] = await Promise.all([
        keyValueStore.getItem(`${storageKey}-Version`),
        keyValueStore.getItemBytes(storageKey),
      ]);
      let hasSetActivePlan = false;
      if (!version) {
        version = '1';
        await keyValueStore.setItem(`${storageKey}-Version`, '1');
      }
      if (version !== '1') {
        throw new Error('Unexpected version ' + version);
      }
      if (programBytes) {
        const decoded =
          LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoContainerV1.decode(
            programBytes,
          );
        const converted = Object.fromEntries(
          Object.entries(decoded.programBlueprints).map(
            ([key, pojo]) => [key, fromProgramBlueprintDao(pojo)] as const,
          ),
        );

        dispatch(setSavedPlans(converted));
        if (decoded.activeProgramId?.value) {
          if (!(decoded.activeProgramId.value in decoded.programBlueprints)) {
            if (Object.entries(decoded.programBlueprints).length) {
              dispatch(
                setActivePlan({ programId: decoded.activeProgramId.value }),
              );
              hasSetActivePlan = true;
            }
          } else {
            dispatch(
              setActivePlan({ programId: decoded.activeProgramId.value }),
            );
            hasSetActivePlan = true;
          }
        }
        if (
          !decoded.activeProgramId?.value ||
          !Object.entries(decoded.programBlueprints).length
        ) {
          const activeProgramId = uuid();
          dispatch(setActivePlan({ programId: activeProgramId }));
          hasSetActivePlan = true;
          dispatch(
            setSavedPlans({
              [activeProgramId]: ProgramBlueprint.fromPOJO({
                name: 'My plan',
                lastEdited: LocalDate.now(),
                sessions: [],
              }),
            }),
          );
        }
      }

      if (!(await keyValueStore.getItem(builtInProgramsStorageKey))) {
        for (const [id, program] of Object.entries(BuiltInPrograms)) {
          if (id in getState().program.savedPrograms) {
            continue;
          }
          dispatch(savePlan({ programId: id, programBlueprint: program }));
        }
        await persistPrograms(getState(), keyValueStore, logger);
        await keyValueStore.setItem(builtInProgramsStorageKey, 'true');
      }
      if (
        !hasSetActivePlan ||
        !Object.keys(getState().program.savedPrograms).includes(
          getState().program.activeProgramId,
        )
      ) {
        dispatch(
          setActivePlan({
            programId: Object.keys(getState().program.savedPrograms)[0],
          }),
        );
      }

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
    async (
      _,
      { originalState, stateAfterReduce, extra: { keyValueStore, logger } },
    ) => {
      const start = performance.now();
      const shouldPersist =
        stateAfterReduce.program.isHydrated &&
        (stateAfterReduce.program.activeProgramId !==
          originalState.program.activeProgramId ||
          stateAfterReduce.program.savedPrograms !==
            originalState.program.savedPrograms);
      if (shouldPersist) {
        await persistPrograms(stateAfterReduce, keyValueStore, logger);
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
        sessionService.getUpcomingSessions(sessionBlueprints),
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
  keyValueStore: KeyValueStore,
  logger: Logger,
) {
  try {
    const currentSessionStateDao =
      new LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoContainerV1({
        activeProgramId: toStringValue(
          stateAfterReduce.program.activeProgramId,
        ),
        programBlueprints: Object.fromEntries(
          Object.entries(stateAfterReduce.program.savedPrograms).map(
            ([key, program]) => [
              key,
              toProgramBlueprintDao(ProgramBlueprint.fromPOJO(program)),
            ],
          ),
        ),
      });
    const bytes =
      LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoContainerV1.encode(
        currentSessionStateDao,
      ).finish();
    await keyValueStore.setItem(`${storageKey}-Version`, '1');
    await keyValueStore.setItem(storageKey, bytes);
  } catch (e) {
    logger.error('Failed to persist program state', e);
  }
}
