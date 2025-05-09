import { Session, SessionPOJO } from '@/models/session-models';
import {
  createAction,
  createSelector,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';

interface StoredSessionState {
  isHydrated: boolean;
  sessions: Record<string, SessionPOJO>;
}

const initialState: StoredSessionState = {
  isHydrated: false,
  sessions: {},
};

const storedSessionsSlice = createSlice({
  name: 'storedSessions',
  initialState,
  reducers: {
    setIsHydrated(state, action: PayloadAction<boolean>) {
      state.isHydrated = action.payload;
    },
    setStoredSessions(
      state,
      action: PayloadAction<Record<string, SessionPOJO>>,
    ) {
      state.sessions = action.payload;
    },

    addStoredSession(state, action: PayloadAction<Session>) {
      state.sessions[action.payload.id] = action.payload.toPOJO();
    },

    deleteStoredSession(state, action: PayloadAction<string>) {
      delete state.sessions[action.payload];
    },
  },

  selectors: {
    selectSessions: createSelector(
      [(state: StoredSessionState) => state.sessions],
      (sessions) => Object.values(sessions).map((x) => Session.fromPOJO(x)),
    ),
  },
});
export const initializeStoredSessionsStateSlice = createAction(
  'initializeStoredSessionsStateSlice',
);

export const {
  setIsHydrated,
  setStoredSessions,
  addStoredSession,
  deleteStoredSession,
} = storedSessionsSlice.actions;

export const { selectSessions } = storedSessionsSlice.selectors;

export default storedSessionsSlice.reducer;
