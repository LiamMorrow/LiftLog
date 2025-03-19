import { combineReducers, configureStore } from '@reduxjs/toolkit';
import currentSessionReducer from './current-session';

const store = configureStore({
  reducer: combineReducers({
    currentSession: currentSessionReducer,
  }),
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
