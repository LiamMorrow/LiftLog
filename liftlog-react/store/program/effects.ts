import { SessionBlueprint } from '@/models/blueprint-models';
import { RemoteData } from '@/models/remote';
import { addEffect } from '@/store/listenerMiddleware';
import {
  fetchUpcomingSessions,
  getActiveProgramSessionBlueprints,
  setUpcomingSessions,
} from '@/store/program';
import { AsyncStream } from 'data-async-iterators';

export function applyProgramEffects() {
  // Add one or more listener entries that look for specific actions.
  // They may contain any sync or async logic, similar to thunks.
  addEffect(
    fetchUpcomingSessions,
    async (
      _,
      { cancelActiveListeners, dispatch, getState, extra: { sessionService } },
    ) => {
      cancelActiveListeners();
      dispatch(setUpcomingSessions(RemoteData.loading()));
      const state = getState().program;
      const sessionBlueprints = getActiveProgramSessionBlueprints(state);
      const numberOfUpcomingSessions = sessionBlueprints.length;
      const sessions = await AsyncStream.from(
        sessionService.getUpcomingSessions(
          sessionBlueprints.map((x) => SessionBlueprint.fromPOJO(x)),
        ),
      )
        .take(numberOfUpcomingSessions)
        .map((x) => x.toPOJO())
        .toArray();
      dispatch(setUpcomingSessions(RemoteData.success(sessions)));
    },
  );
}
