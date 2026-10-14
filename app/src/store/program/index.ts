import { applySessionBlueprintDiff, PlanDiff } from '@/models/blueprint-diff';
import { ProgramBlueprint, SessionBlueprint } from '@/models/blueprint-models';
import { RemoteData } from '@/models/remote';
import { EmptySession, Session } from '@/models/session-models';
import { createAction, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import Enumerable from 'linq';

/** Addresses one workout of one plan, which is how the workout editor screens identify what they edit. */
export type ProgramSessionLocation = {
  programId: string;
  sessionIndex: number;
};

function updateProgramIn(
  state: { savedPrograms: { [programId: string]: unknown } },
  programId: string,
  update: (program: ProgramBlueprint) => ProgramBlueprint,
) {
  const program = state.savedPrograms[programId] as ProgramBlueprint | undefined;
  if (!program) {
    return;
  }
  state.savedPrograms[programId] = update(program);
}

interface ProgramState {
  readonly isHydrated: boolean;
  readonly activePlanId: string;
  readonly upcomingSessions: RemoteData<readonly Session[]>;
  readonly savedPrograms: {
    readonly [programId: string]: ProgramBlueprint;
  };
  /** A plan parsed from an imported file, awaiting the user's confirmation to save. */
  readonly pendingImport?: ProgramBlueprint;
  /** How a just-finished session differs from the plan, awaiting the user's decision in /diff-save. */
  readonly pendingPlanDiff?: PlanDiff;
}

const initialState: ProgramState = {
  isHydrated: false,
  activePlanId: '00000000-0000-0000-0000-000000000000',
  upcomingSessions: RemoteData.notAsked(),
  savedPrograms: {},
};

const programSlice = createSlice({
  name: 'program',
  initialState,
  reducers: {
    setIsHydrated(state, action: PayloadAction<boolean>) {
      state.isHydrated = action.payload;
    },

    setUpcomingSessions(state, action: PayloadAction<RemoteData<readonly Session[]>>) {
      state.upcomingSessions = action.payload;
    },

    setProgramSessions(
      state,
      action: PayloadAction<{
        programId: string;
        sessionBlueprints: SessionBlueprint[];
      }>,
    ) {
      updateProgramIn(state, action.payload.programId, (program) =>
        program.withSessions(action.payload.sessionBlueprints),
      );
    },

    /** Applies an arbitrary edit to a plan, addressed by id so it cannot land on the wrong one. */
    updateProgram(
      state,
      action: PayloadAction<{
        programId: string;
        update: (program: ProgramBlueprint) => ProgramBlueprint;
      }>,
    ) {
      updateProgramIn(state, action.payload.programId, action.payload.update);
    },

    applyDiffToPlan(state, action: PayloadAction<PlanDiff>) {
      updateProgramIn(state, action.payload.programId, (program) => {
        if (action.payload.type === 'add') {
          return program.withAddedSession(applySessionBlueprintDiff(EmptySession.blueprint, action.payload.diff));
        }
        // The plan can have been edited between the diff being computed and the user confirming it, so
        // trust the name over the index it was found at.
        const { originalSession } = action.payload.diff;
        const index =
          program.sessions[action.payload.sessionIndex]?.name === originalSession.name
            ? action.payload.sessionIndex
            : program.sessions.findIndex((s) => s.name === originalSession.name);
        return program.withSession(index, (session) => applySessionBlueprintDiff(session, action.payload.diff));
      });
    },

    setProgramSession(
      state,
      action: PayloadAction<{
        programId: string;
        sessionIndex: number;
        sessionBlueprint: SessionBlueprint;
      }>,
    ) {
      updateProgramIn(state, action.payload.programId, (program) =>
        program.withSession(action.payload.sessionIndex, () => action.payload.sessionBlueprint),
      );
    },

    addProgramSession(
      state,
      action: PayloadAction<{
        programId: string;
        sessionBlueprint: SessionBlueprint;
      }>,
    ) {
      updateProgramIn(state, action.payload.programId, (program) =>
        program.withAddedSession(action.payload.sessionBlueprint),
      );
    },

    deleteSavedPlan(state, action: PayloadAction<{ programId: string }>) {
      const { [action.payload.programId]: _, ...remainingPrograms } = state.savedPrograms;
      state.savedPrograms = remainingPrograms;
    },

    setSavedPlanName(state, action: PayloadAction<{ programId: string; name: string }>) {
      updateProgramIn(state, action.payload.programId, (program) => program.withName(action.payload.name));
    },

    setSavedPlans(state, action: PayloadAction<{ [programId: string]: ProgramBlueprint }>) {
      state.savedPrograms = action.payload;
    },

    upsertSavedPlans(state, action: PayloadAction<{ [programId: string]: ProgramBlueprint }>) {
      Object.entries(action.payload).forEach(([id, program]) => (state.savedPrograms[id] = program));
    },

    moveSessionBlueprintUpInProgram(
      state,
      action: PayloadAction<{
        programId: string;
        sessionBlueprint: SessionBlueprint;
      }>,
    ) {
      updateProgramIn(state, action.payload.programId, (program) =>
        program.withSessionMovedUp(action.payload.sessionBlueprint),
      );
    },

    moveSessionBlueprintDownInProgram(
      state,
      action: PayloadAction<{
        programId: string;
        sessionBlueprint: SessionBlueprint;
      }>,
    ) {
      updateProgramIn(state, action.payload.programId, (program) =>
        program.withSessionMovedDown(action.payload.sessionBlueprint),
      );
    },

    setActivePlan(state, action: PayloadAction<{ activePlanId: string }>) {
      state.activePlanId = action.payload.activePlanId;
    },

    removeSessionFromProgram(
      state,
      action: PayloadAction<{
        programId: string;
        sessionBlueprint: SessionBlueprint;
      }>,
    ) {
      updateProgramIn(state, action.payload.programId, (program) =>
        program.withoutSession(action.payload.sessionBlueprint),
      );
    },

    savePlan(
      state,
      action: PayloadAction<{
        programId: string;
        programBlueprint: ProgramBlueprint;
      }>,
    ) {
      state.savedPrograms[action.payload.programId] = action.payload.programBlueprint;
    },

    setPendingImport(state, action: PayloadAction<{ programBlueprint: ProgramBlueprint }>) {
      state.pendingImport = action.payload.programBlueprint;
    },

    clearPendingImport(state) {
      state.pendingImport = undefined;
    },

    setPendingPlanDiff(state, action: PayloadAction<PlanDiff | undefined>) {
      state.pendingPlanDiff = action.payload;
    },
  },
  selectors: {
    selectActiveProgram: (state: ProgramState) => state.savedPrograms[state.activePlanId]!,

    selectAllPrograms: createSelector(
      (state: ProgramState) => state.savedPrograms,
      (programMap) =>
        Enumerable.from(Object.entries(programMap))
          .select(([id, program]) => ({
            id,
            program,
          }))
          .orderBy((x) => x.program.name)
          .toArray(),
    ),
    selectProgram: (state: ProgramState, id: string) => state.savedPrograms[id]!,
    selectPendingImport: (state: ProgramState) => state.pendingImport,
    selectPendingPlanDiff: (state: ProgramState) => state.pendingPlanDiff,
    selectProgramSession: (state: ProgramState, location: ProgramSessionLocation) =>
      state.savedPrograms[location.programId]?.sessions[location.sessionIndex],
    selectProgramSessionExercise: (state: ProgramState, location: ProgramSessionLocation & { exerciseIndex: number }) =>
      state.savedPrograms[location.programId]?.sessions[location.sessionIndex]?.exercises[location.exerciseIndex],
    /**
     * Finds a unique name for a new workout in the given plan.
     * Will be Workout {Number} where number is the first non conflicting number after sessions.length
     */
    selectNewWorkoutName: createSelector(
      [(state: ProgramState) => state.savedPrograms, (_: ProgramState, programId: string) => programId],
      (savedPrograms, programId) => {
        const sessions = savedPrograms[programId]?.sessions ?? [];
        const existingNames = sessions.map((session) => session.name);
        let counter = sessions.length + 1;
        let proposedName = `Workout ${counter}`;

        while (existingNames.includes(proposedName)) {
          counter++;
          proposedName = `Workout ${counter}`;
        }

        return proposedName;
      },
    ),
  },
});

export const {
  setIsHydrated,
  setUpcomingSessions,
  applyDiffToPlan,
  addProgramSession,
  updateProgram,
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
  setPendingImport,
  clearPendingImport,
  setPendingPlanDiff,
} = programSlice.actions;

export const {
  selectActiveProgram,
  selectProgram,
  selectAllPrograms,
  selectNewWorkoutName,
  selectPendingImport,
  selectPendingPlanDiff,
  selectProgramSession,
  selectProgramSessionExercise,
} = programSlice.selectors;

export const fetchUpcomingSessions = createAction('fetchUpcomingSessions');
export const initializeProgramStateSlice = createAction('initializeProgramStateSlice');

export const exportPlan = createAction<{ programId: string }>('exportPlan');
export const importPlanFromPicker = createAction('importPlanFromPicker');
export const importPlanFromUri = createAction<{ uri: string }>('importPlanFromUri');
export const importPlanFromFile = createAction<{ name?: string; bytes: Uint8Array }>('importPlanFromFile');

export default programSlice.reducer;
