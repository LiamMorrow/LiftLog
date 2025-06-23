import {
  ProgramBlueprint,
  ProgramBlueprintPOJO,
  SessionBlueprint,
  SessionBlueprintPOJO,
} from '@/models/session-models';
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
import Enumerable from 'linq';

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
      name: 'My plan',
      sessions: [
        defaultSessionBlueprint.toPOJO(),
        defaultSessionBlueprint.with({ name: 'Workout B' }).toPOJO(),
      ],
    }).toPOJO(),
    '00000000-0000-0000-0000-000000000001': ProgramBlueprint.fromPOJO({
      lastEdited: LocalDate.now(),
      name: 'My other plan',
      sessions: [
        defaultSessionBlueprint.toPOJO(),
        defaultSessionBlueprint.with({ name: 'DOGLET' }).toPOJO(),
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
        programId: string;
        sessionBlueprints: SessionBlueprint[];
      }>,
    ) {
      if (state.savedPrograms[action.payload.programId]) {
        state.savedPrograms[action.payload.programId] = {
          ...state.savedPrograms[action.payload.programId],
          sessions: action.payload.sessionBlueprints.map((x) => x.toPOJO()),
        };
      }
    },

    setProgramSession(
      state,
      action: PayloadAction<{
        programId: string;
        sessionIndex: number;
        sessionBlueprint: SessionBlueprint;
      }>,
    ) {
      const program = state.savedPrograms[action.payload.programId];
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
      action: PayloadAction<{
        programId: string;
        sessionBlueprint: SessionBlueprint;
      }>,
    ) {
      const program = state.savedPrograms[action.payload.programId];
      if (program) {
        program.sessions.push(action.payload.sessionBlueprint.toPOJO());
      }
    },

    deleteSavedPlan(state, action: PayloadAction<{ programId: string }>) {
      const { [action.payload.programId]: _, ...remainingPrograms } =
        state.savedPrograms;
      state.savedPrograms = remainingPrograms;
    },

    setSavedPlanName(
      state,
      action: PayloadAction<{ programId: string; name: string }>,
    ) {
      const program = state.savedPrograms[action.payload.programId];
      if (program) {
        state.savedPrograms[action.payload.programId] = {
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

    upsertSavedPlans(
      state,
      action: PayloadAction<{ [programId: string]: ProgramBlueprint }>,
    ) {
      Object.entries(action.payload).forEach(
        ([id, program]) => (state.savedPrograms[id] = program.toPOJO()),
      );
    },

    moveSessionBlueprintUpInProgram(
      state,
      action: PayloadAction<{
        programId: string;
        sessionBlueprint: SessionBlueprint;
      }>,
    ) {
      const program = state.savedPrograms[action.payload.programId];
      if (program) {
        const index = program.sessions.findIndex((s) =>
          action.payload.sessionBlueprint.equals(s as SessionBlueprintPOJO),
        );
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
      action: PayloadAction<{
        programId: string;
        sessionBlueprint: SessionBlueprint;
      }>,
    ) {
      const program = state.savedPrograms[action.payload.programId];
      if (program) {
        const index = program.sessions.findIndex((s) =>
          action.payload.sessionBlueprint.equals(s as SessionBlueprintPOJO),
        );
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

    setActivePlan(state, action: PayloadAction<{ programId: string }>) {
      state.activeProgramId = action.payload.programId;
    },

    removeSessionFromProgram(
      state,
      action: PayloadAction<{
        programId: string;
        sessionBlueprint: SessionBlueprint;
      }>,
    ) {
      const program = state.savedPrograms[action.payload.programId];
      if (program) {
        program.sessions = program.sessions.filter(
          (session) =>
            !action.payload.sessionBlueprint.equals(
              session as SessionBlueprintPOJO,
            ),
        );
      }
    },

    createSavedPlan(
      state,
      action: PayloadAction<{
        programId: string;
        name: string;
        time: LocalDate;
      }>,
    ) {
      state.savedPrograms[action.payload.programId] = {
        _BRAND: 'PROGRAM_BLUEPRINT_POJO',
        name: action.payload.name,
        sessions: [],
        lastEdited: action.payload.time,
      };
    },

    savePlan(
      state,
      action: PayloadAction<{
        programId: string;
        programBlueprint: ProgramBlueprint;
      }>,
    ) {
      state.savedPrograms[action.payload.programId] =
        action.payload.programBlueprint.toPOJO();
    },
  },
  selectors: {
    selectActiveProgram: createSelector(
      (state: ProgramState) => state.savedPrograms[state.activeProgramId],
      ProgramBlueprint.fromPOJO,
    ),

    selectAllPrograms: createSelector(
      (state: ProgramState) => state.savedPrograms,
      (programMap) =>
        Enumerable.from(Object.entries(programMap))
          .select(([id, val]) => ({
            id,
            program: ProgramBlueprint.fromPOJO(val),
          }))
          .orderBy((x) => x.program.name)
          .toArray(),
    ),
    selectProgram: createSelector(
      [(state: ProgramState) => state.savedPrograms, (_, id: string) => id],
      (programs, id) => ProgramBlueprint.fromPOJO(programs[id]),
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
  upsertSavedPlans,
  setSavedPlans,
} = programSlice.actions;

export const { selectActiveProgram, selectProgram, selectAllPrograms } =
  programSlice.selectors;

export const fetchUpcomingSessions = createAction('fetchUpcomingSessions');
export const initializeProgramStateSlice = createAction(
  'initializeProgramStateSlice',
);

export default programSlice.reducer;
