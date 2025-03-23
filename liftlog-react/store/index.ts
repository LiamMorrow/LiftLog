import { combineReducers, configureStore } from '@reduxjs/toolkit';
import currentSessionReducer from './current-session';
import settingsReducer from './settings';

const store = configureStore({
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // We manually do persistence and devtools aren't needed
      serializableCheck: false,
    }),
  reducer: combineReducers({
    currentSession: currentSessionReducer,
    settings: settingsReducer,
  }),
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
