import {
  ProgramBlueprint,
  ProgramBlueprintPOJO,
  SessionBlueprint,
} from '@/models/blueprint-models';
import { RemoteData } from '@/models/remote';
import { SessionPOJO } from '@/models/session-models';
import { defaultSession } from '@/models/test-data';

import { LocalDate } from '@js-joda/core';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ProgramState {
  readonly isHydrated: boolean;
  readonly activeProgramId: string;
  readonly upcomingSessions: RemoteData<readonly SessionPOJO[]>;
  readonly savedPrograms: {
    readonly [programId: string]: ProgramBlueprintPOJO;
  };
}

const initialState: ProgramState = {
  isHydrated: false,
  activeProgramId: '00000000-0000-0000-0000-000000000000',
  upcomingSessions: RemoteData.success([defaultSession.toPOJO()]),
  savedPrograms: {},
};

const programSlice = createSlice({
  name: 'currentSession',
  initialState,
  reducers: {
    setIsHydrated(state, action: PayloadAction<boolean>) {
      state.isHydrated = action.payload;
    },

    setUpcomingSessions(
      state,
      action: PayloadAction<RemoteData<readonly SessionPOJO[]>>,
    ) {
      state.upcomingSessions = action.payload;
    },

    setProgramSessions(
      state,
      action: PayloadAction<{
        planId: string;
        sessionBlueprints: SessionBlueprint[];
      }>,
    ) {
      if (state.savedPrograms[action.payload.planId]) {
        state.savedPrograms[action.payload.planId] = {
          ...state.savedPrograms[action.payload.planId],
          sessions: action.payload.sessionBlueprints.map((x) => x.toPOJO()),
        };
      }
    },

    setProgramSession(
      state,
      action: PayloadAction<{
        planId: string;
        sessionIndex: number;
        sessionBlueprint: SessionBlueprint;
      }>,
    ) {
      const program = state.savedPrograms[action.payload.planId];
      if (
        program &&
        action.payload.sessionIndex >= 0 &&
        action.payload.sessionIndex < program.sessions.length
      ) {
        program.sessions[action.payload.sessionIndex] =
          action.payload.sessionBlueprint.toPOJO();
      }
    },

    addProgramSession(
      state,
      action: PayloadAction<{ planId: string; sessionBlueprint: any }>,
    ) {
      const program = state.savedPrograms[action.payload.planId];
      if (program) {
        program.sessions = [
          ...program.sessions,
          action.payload.sessionBlueprint,
        ];
      }
    },

    deleteSavedPlan(state, action: PayloadAction<{ planId: string }>) {
      const { [action.payload.planId]: _, ...remainingPrograms } =
        state.savedPrograms;
      state.savedPrograms = remainingPrograms;
    },

    setSavedPlanName(
      state,
      action: PayloadAction<{ planId: string; name: string }>,
    ) {
      const program = state.savedPrograms[action.payload.planId];
      if (program) {
        state.savedPrograms[action.payload.planId] = {
          ...program,
          name: action.payload.name,
        };
      }
    },

    setSavedPlans(
      state,
      action: PayloadAction<{ [programId: string]: ProgramBlueprint }>,
    ) {
      state.savedPrograms = Object.fromEntries(
        Object.entries(action.payload).map(([x, y]) => [x, y.toPOJO()]),
      );
    },

    moveSessionBlueprintUpInProgram(
      state,
      action: PayloadAction<{ planId: string; sessionBlueprint: any }>,
    ) {
      const program = state.savedPrograms[action.payload.planId];
      if (program) {
        const index = program.sessions.indexOf(action.payload.sessionBlueprint);
        if (index > 0) {
          const sessions = [...program.sessions];
          [sessions[index - 1], sessions[index]] = [
            sessions[index],
            sessions[index - 1],
          ];
          program.sessions = sessions;
        }
      }
    },

    moveSessionBlueprintDownInProgram(
      state,
      action: PayloadAction<{ planId: string; sessionBlueprint: any }>,
    ) {
      const program = state.savedPrograms[action.payload.planId];
      if (program) {
        const index = program.sessions.indexOf(action.payload.sessionBlueprint);
        if (index >= 0 && index < program.sessions.length - 1) {
          const sessions = [...program.sessions];
          [sessions[index], sessions[index + 1]] = [
            sessions[index + 1],
            sessions[index],
          ];
          program.sessions = sessions;
        }
      }
    },

    setActivePlan(state, action: PayloadAction<{ planId: string }>) {
      state.activeProgramId = action.payload.planId;
    },

    removeSessionFromProgram(
      state,
      action: PayloadAction<{ planId: string; sessionBlueprint: any }>,
    ) {
      const program = state.savedPrograms[action.payload.planId];
      if (program) {
        program.sessions = program.sessions.filter(
          (session) => session !== action.payload.sessionBlueprint,
        );
      }
    },

    createSavedPlan(
      state,
      action: PayloadAction<{ planId: string; name: string; time: LocalDate }>,
    ) {
      state.savedPrograms[action.payload.planId] = {
        _BRAND: 'PROGRAM_BLUEPRINT_POJO',
        name: action.payload.name,
        sessions: [],
        lastEdited: action.payload.time,
      };
    },

    savePlan(
      state,
      action: PayloadAction<{
        planId: string;
        programBlueprint: ProgramBlueprint;
      }>,
    ) {
      state.savedPrograms[action.payload.planId] =
        action.payload.programBlueprint.toPOJO();
    },
  },
});

export function getSessionBlueprints(state: ProgramState, programId: string) {
  return state.savedPrograms[programId];
}

export function getActiveProgramSessionBlueprints(state: ProgramState) {
  return getSessionBlueprints(state, state.activeProgramId).sessions;
}

export function getActiveProgram(state: ProgramState) {
  return state.savedPrograms[state.activeProgramId];
}

// const listenerMiddleware = createListenerMiddleware<RootState>();

// export const fetchUpcomingSessions = { type: 'FETCH_UPCOMING_SESSIONS' };

// // Add one or more listener entries that look for specific actions.
// // They may contain any sync or async logic, similar to thunks.
// listenerMiddleware.startListening({
//   predicate: (action) => action.type === fetchUpcomingSessions.type,
//   effect: async (_, { cancelActiveListeners, dispatch, getState }) => {
//     cancelActiveListeners();
//     dispatch(programSlice.actions.setUpcomingSessions(RemoteData.loading()));
//     const state = getState().program;
//     const sessionBlueprints = getActiveProgramSessionBlueprints(state)
//     const numberOfUpcomingSessions = sessionBlueprints.length;

//       const sessions = await SessionService.getUpcomingSessions(sessionBlueprints).take(5).toArrayAsync()
//   },
// });

export const { setIsHydrated } = programSlice.actions;

export default programSlice.reducer;
