import {
  ExerciseBlueprint,
  ExerciseBlueprintPOJO,
  SessionBlueprint,
  SessionBlueprintPOJO,
} from '@/models/blueprint-models';
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: SessionEditorState = {
  sessionBlueprint: undefined,
};

export type SessionEditorState = {
  sessionBlueprint: SessionBlueprintPOJO | undefined;
};

const sessionEditorSlice = createSlice({
  name: 'sessionEditor',
  initialState,
  reducers: {
    setEditingSession(
      state,
      action: PayloadAction<SessionBlueprint | undefined>,
    ) {
      state.sessionBlueprint = action.payload?.toPOJO();
    },
    setEditingSessionName(state, action: PayloadAction<string>) {
      if (state.sessionBlueprint) {
        state.sessionBlueprint.name = action.payload;
      }
    },
    setEditingSessionNotes(state, action: PayloadAction<string>) {
      if (state.sessionBlueprint) {
        state.sessionBlueprint.notes = action.payload;
      }
    },
    addExercise(state, action: PayloadAction<ExerciseBlueprint>) {
      if (state.sessionBlueprint) {
        state.sessionBlueprint.exercises.push(action.payload.toPOJO());
      }
    },
    removeExercise(state, action: PayloadAction<ExerciseBlueprint>) {
      if (state.sessionBlueprint) {
        state.sessionBlueprint.exercises =
          state.sessionBlueprint.exercises.filter(
            (x) => !action.payload.equals(x as ExerciseBlueprintPOJO),
          );
      }
    },
    moveExerciseUp(state, action: PayloadAction<ExerciseBlueprint>) {
      if (state.sessionBlueprint) {
        const index = state.sessionBlueprint.exercises.findIndex((x) =>
          action.payload.equals(x as ExerciseBlueprintPOJO),
        );
        if (index > 0) {
          const exercises = [...state.sessionBlueprint.exercises];
          [exercises[index - 1], exercises[index]] = [
            exercises[index],
            exercises[index - 1],
          ];
          state.sessionBlueprint = {
            ...state.sessionBlueprint,
            exercises,
          };
        }
      }
    },
    moveExerciseDown(state, action: PayloadAction<ExerciseBlueprint>) {
      if (state.sessionBlueprint) {
        const index = state.sessionBlueprint.exercises.findIndex((x) =>
          action.payload.equals(x as ExerciseBlueprintPOJO),
        );
        if (index >= 0 && index < state.sessionBlueprint.exercises.length - 1) {
          const exercises = [...state.sessionBlueprint.exercises];
          [exercises[index], exercises[index + 1]] = [
            exercises[index + 1],
            exercises[index],
          ];
          state.sessionBlueprint = {
            ...state.sessionBlueprint,
            exercises,
          };
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
          state.sessionBlueprint.exercises[index] = exercise.toPOJO();
        }
      }
    },
  },
  selectors: {
    selectCurrentlyEditingSession: createSelector(
      (state: SessionEditorState) => state.sessionBlueprint,
      (x) => (x ? SessionBlueprint.fromPOJO(x) : undefined),
    ),
  },
});

export const {
  addExercise,
  moveExerciseDown,
  moveExerciseUp,
  removeExercise,
  setEditingSession,
  setEditingSessionName,
  setEditingSessionNotes,
  updateSessionExercise,
} = sessionEditorSlice.actions;

export const { selectCurrentlyEditingSession } = sessionEditorSlice.selectors;

export const sessionEditorReducer = sessionEditorSlice.reducer;
