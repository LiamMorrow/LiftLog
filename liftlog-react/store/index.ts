import { combineReducers, configureStore } from '@reduxjs/toolkit';
import currentSessionReducer from './current-session';
import settingsReducer from './settings';
import programReducer from './program';
// eslint-disable-next-line no-restricted-imports
import { useSelector as untypedUseSelector, UseSelector } from 'react-redux';

const store = configureStore({
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // We manually do persistence and devtools aren't needed
      serializableCheck: false,
    }),
  reducer: combineReducers({
    currentSession: currentSessionReducer,
    settings: settingsReducer,
    program: programReducer,
  }),
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useSelector: UseSelector<RootState> = untypedUseSelector;
