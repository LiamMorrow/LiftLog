import { configureStore, combineReducers } from '@reduxjs/toolkit';
import currentSessionReducer from './current-session';
import settingsReducer from './settings';
import programReducer from './program';
import appReducer from './app';
import feedReducer from './feed';
import storedSessionsReducer from './stored-sessions';
import sessionEditorReducer from './session-editor';
import { listenerMiddleware } from '@/store/listenerMiddleware';

const store = configureStore({
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // We manually do persistence and devtools aren't needed
      serializableCheck: false,
      immutableCheck: false,
    }).prepend(listenerMiddleware.middleware),
  reducer: combineReducers({
    currentSession: currentSessionReducer,
    settings: settingsReducer,
    program: programReducer,
    feed: feedReducer,
    app: appReducer,
    sessionEditor: sessionEditorReducer,
    storedSessions: storedSessionsReducer,
  }),
});

export function getState(): RootState {
  return store.getState();
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
