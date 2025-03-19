import { combineReducers, configureStore } from '@reduxjs/toolkit';
import currentSessionReducer from './current-session';

const store = configureStore({
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // We manually do persistence and devtools aren't needed
      serializableCheck: false,
    }),
  reducer: combineReducers({
    currentSession: currentSessionReducer,
  }),
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
