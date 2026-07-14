import { ExerciseDescriptor } from '@/models/exercise-models';
import { createAction, createSlice, PayloadAction, UnknownAction } from '@reduxjs/toolkit';

const initialState: AppState = {
  isHydrated: false,
  currentSnackbar: undefined,
  exerciseSearchResult: undefined,
};

type AppState = {
  isHydrated: boolean;
  currentSnackbar: SnackbarDescriptor | undefined;
  exerciseSearchResult: ExerciseSearchResult | undefined;
};

// The exercise search is its own route, so it hands its result back through the store rather than a
// callback. The requestId ties a result to the searcher that opened it, so a result is never applied
// to a searcher that did not ask for it.
export type ExerciseSearchResult = {
  requestId: string;
  exercise: ExerciseDescriptor;
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setIsHydrated(state, action: PayloadAction<boolean>) {
      state.isHydrated = action.payload;
    },

    setCurrentSnackbar(state, action: PayloadAction<SnackbarDescriptor | undefined>) {
      state.currentSnackbar = action.payload;
    },

    setExerciseSearchResult(state, action: PayloadAction<ExerciseSearchResult>) {
      state.exerciseSearchResult = action.payload;
    },

    clearExerciseSearchResult(state) {
      state.exerciseSearchResult = undefined;
    },
  },
});

export const initializeAppStateSlice = createAction('initializeAppStateSlice');

export const shareString = createAction<{ title: string; value: string }>('shareString');
export const copyLogs = createAction('copyLogs');

export type SnackbarDescriptor =
  | {
      text: string;
      action?: undefined;
      dispatchAction?: undefined;
    }
  | {
      text: string;
      action: string;
      dispatchAction: UnknownAction | UnknownAction[];
    };
export const showSnackbar = createAction<SnackbarDescriptor & { duration?: number }>('snackBarWithAction');

export const { setIsHydrated, setCurrentSnackbar, setExerciseSearchResult, clearExerciseSearchResult } =
  appSlice.actions;

export default appSlice.reducer;
