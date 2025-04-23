import {
  ProgramBlueprint,
  ProgramBlueprintPOJO,
  SessionBlueprint,
} from '@/models/blueprint-models';
import { RemoteData } from '@/models/remote';
import { Session, SessionPOJO } from '@/models/session-models';
import { defaultSessionBlueprint } from '@/models/test-data';

import { LocalDate } from '@js-joda/core';
import {
  createAction,
  createSelector,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';

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
  upcomingSessions: RemoteData.notAsked(),
  savedPrograms: {
    '00000000-0000-0000-0000-000000000000': ProgramBlueprint.fromPOJO({
      lastEdited: LocalDate.now(),
      name: 'MY SESSION',
      sessions: [
        defaultSessionBlueprint.toPOJO(),
        defaultSessionBlueprint.with({ name: 'HIEL' }).toPOJO(),
      ],
    }).toPOJO(),
  },
};

const programSlice = createSlice({
  name: 'program',
  initialState,
  reducers: {
    setIsHydrated(state, action: PayloadAction<boolean>) {
      state.isHydrated = action.payload;
    },

    setUpcomingSessions(
      state,
      action: PayloadAction<RemoteData<readonly Session[]>>,
    ) {
      state.upcomingSessions = action.payload.map((x) =>
        x.map((y) => y.toPOJO()),
      );
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
  selectors: {
    selectActiveProgram: createSelector(
      (state: ProgramState) => state.savedPrograms[state.activeProgramId],
      ProgramBlueprint.fromPOJO,
    ),
  },
});

export const {
  setIsHydrated,
  setUpcomingSessions,
  addProgramSession,
  createSavedPlan,
  deleteSavedPlan,
  moveSessionBlueprintDownInProgram,
  moveSessionBlueprintUpInProgram,
  removeSessionFromProgram,
  savePlan,
  setActivePlan,
  setProgramSession,
  setProgramSessions,
  setSavedPlanName,
  setSavedPlans,
} = programSlice.actions;

export const { selectActiveProgram } = programSlice.selectors;

export const fetchUpcomingSessions = createAction('fetchUpcomingSessions');

export default programSlice.reducer;
