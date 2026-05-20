import { ExerciseBlueprint, SessionBlueprint } from '@/models/blueprint-models';
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: SessionEditorState = {
  sessionBlueprint: undefined,
  editingExerciseIndex: undefined,
};

export type SessionEditorState = {
  sessionBlueprint: SessionBlueprint | undefined;
  editingExerciseIndex: number | undefined;
};

const sessionEditorSlice = createSlice({
  name: 'sessionEditor',
  initialState,
  reducers: {
    setEditingSession(
      state,
      action: PayloadAction<SessionBlueprint | undefined>,
    ) {
      state.sessionBlueprint = action.payload;
    },
    setEditingSessionName(state, action: PayloadAction<string>) {
      if (state.sessionBlueprint) {
        state.sessionBlueprint = state.sessionBlueprint.with({
          name: action.payload,
        });
      }
    },
    setEditingSessionNotes(state, action: PayloadAction<string>) {
      if (state.sessionBlueprint) {
        state.sessionBlueprint = state.sessionBlueprint.with({
          notes: action.payload,
        });
      }
    },
    addExercise(state, action: PayloadAction<ExerciseBlueprint>) {
      if (state.sessionBlueprint) {
        state.sessionBlueprint = state.sessionBlueprint.with({
          exercises: state.sessionBlueprint.exercises.concat(
            action.payload,
          ) as ExerciseBlueprint[],
        });
      }
    },
    setEditingExerciseIndex(state, action: PayloadAction<number | undefined>) {
      state.editingExerciseIndex = action.payload;
    },
    removeExercise(state, action: PayloadAction<ExerciseBlueprint>) {
      if (state.sessionBlueprint) {
        state.sessionBlueprint = state.sessionBlueprint.with({
          exercises: (
            state.sessionBlueprint.exercises as ExerciseBlueprint[]
          ).filter((x) => !action.payload.equals(x)),
        });
      }
    },
    moveExerciseUp(state, action: PayloadAction<ExerciseBlueprint>) {
      if (state.sessionBlueprint) {
        const index = state.sessionBlueprint.exercises.findIndex((x) =>
          action.payload.equals(x as ExerciseBlueprint),
        );
        if (index > 0) {
          const exercises = [
            ...state.sessionBlueprint.exercises,
          ] as ExerciseBlueprint[];
          [exercises[index - 1], exercises[index]] = [
            exercises[index],
            exercises[index - 1],
          ];
          state.sessionBlueprint = state.sessionBlueprint.with({
            exercises,
          });
        }
      }
    },
    moveExerciseDown(state, action: PayloadAction<ExerciseBlueprint>) {
      if (state.sessionBlueprint) {
        const index = state.sessionBlueprint.exercises.findIndex((x) =>
          action.payload.equals(x as ExerciseBlueprint),
        );
        if (index >= 0 && index < state.sessionBlueprint.exercises.length - 1) {
          const exercises = [
            ...state.sessionBlueprint.exercises,
          ] as ExerciseBlueprint[];
          [exercises[index], exercises[index + 1]] = [
            exercises[index + 1],
            exercises[index],
          ];
          state.sessionBlueprint = state.sessionBlueprint.with({ exercises });
        }
      }
    },
    updateSessionExercise(
      state,
      action: PayloadAction<{
        index: number;
        exercise: ExerciseBlueprint;
      }>,
    ) {
      if (state.sessionBlueprint) {
        const { index, exercise } = action.payload;
        if (index >= 0 && index < state.sessionBlueprint.exercises.length) {
          state.sessionBlueprint = state.sessionBlueprint.with({
            exercises: (
              state.sessionBlueprint.exercises as ExerciseBlueprint[]
            ).with(index, exercise),
          });
        }
      }
    },
  },
  selectors: {
    selectCurrentlyEditingSession: createSelector(
      (state: SessionEditorState) => state.sessionBlueprint,
      (x) => (x ? x : undefined),
    ),
    selectEditingExercise: createSelector(
      (state: SessionEditorState) =>
        state.editingExerciseIndex !== undefined &&
        state.sessionBlueprint?.exercises[state.editingExerciseIndex],
      (exercise) => (exercise ? exercise : undefined),
    ),
  },
});

export const {
  addExercise,
  moveExerciseDown,
  moveExerciseUp,
  removeExercise,
  setEditingExerciseIndex,
  setEditingSession,
  setEditingSessionName,
  setEditingSessionNotes,
  updateSessionExercise,
} = sessionEditorSlice.actions;

export const { selectCurrentlyEditingSession, selectEditingExercise } =
  sessionEditorSlice.selectors;

export const sessionEditorReducer = sessionEditorSlice.reducer;
