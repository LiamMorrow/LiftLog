import { ProgramBlueprint, SessionBlueprint } from '@/models/blueprint-models';
import { RemoteData } from '@/models/remote';
import { Session } from '@/models/session-models';
import { defaultSession } from '@/models/test-data';

import { LocalDate } from '@js-joda/core';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ProgramState {
  readonly isHydrated: boolean;
  readonly activeProgramId: string;
  readonly upcomingSessions: RemoteData<readonly Session[]>;
  readonly savedPrograms: {
    readonly [programId: string]: ProgramBlueprint;
  };
}

const initialState: ProgramState = {
  isHydrated: false,
  activeProgramId: '00000000-0000-0000-0000-000000000000',
  upcomingSessions: RemoteData.success([defaultSession]),
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
      action: PayloadAction<RemoteData<readonly Session[]>>,
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
          sessions: action.payload.sessionBlueprints,
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
          action.payload.sessionBlueprint;
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
      state.savedPrograms = action.payload;
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
        action.payload.programBlueprint;
    },
  },
});

export const { setIsHydrated } = programSlice.actions;

export default programSlice.reducer;
