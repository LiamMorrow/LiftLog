import { RemoteData } from '@/models/remote';
import { addEffect } from '@/store/listenerMiddleware';
import {
  fetchUpcomingSessions,
  initializeProgramStateSlice,
  selectActiveProgram,
  setIsHydrated,
  setUpcomingSessions,
} from '@/store/program';
import { AsyncStream } from 'data-async-iterators';

export function applyProgramEffects() {
  addEffect(
    initializeProgramStateSlice,
    async (_, { cancelActiveListeners, dispatch, extra: {} }) => {
      cancelActiveListeners();
      // TODO see PersistProgramMiddleware - should load all programs from disk
      dispatch(setIsHydrated(true));
    },
  );
  addEffect(
    fetchUpcomingSessions,
    async (
      _,
      { cancelActiveListeners, dispatch, getState, extra: { sessionService } },
    ) => {
      cancelActiveListeners();

      const state = getState();
      const sessionBlueprints = selectActiveProgram(state).sessions;
      const numberOfUpcomingSessions = sessionBlueprints.length;

      const sessions = await AsyncStream.from(
        sessionService.getUpcomingSessions(sessionBlueprints),
      )
        .take(numberOfUpcomingSessions)
        .toArray();
      dispatch(setUpcomingSessions(RemoteData.success(sessions)));
    },
  );
}
