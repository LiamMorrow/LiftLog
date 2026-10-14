import { Session } from '@/models/session-models';
import { OffsetDateTime, ZoneId } from '@js-joda/core';
import { createAction, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import Enumerable from 'linq';
import { ExerciseDescriptor } from '@/models/exercise-models';

interface StoredSessionState {
  isHydrated: boolean;
  // Sessions being edited: the workout in progress, and a past one while it is open in History. Edits land
  // here first and are written through to the database. Every other session is only in the database.
  openSessions: Record<string, Session>;
  // The workout in progress. It lives in `openSessions` like any other; this only says which one it is.
  activeSessionId: string | undefined;
  // Read-only catalog resolved for the current locale, keyed by the exercise's English name.
  builtInExercises: Record<string, ExerciseDescriptor>;
  // User-created exercises and copy-on-write edits of built-ins.
  savedExercises: Record<string, ExerciseDescriptor>;
  // Built-in ids the user deleted, hidden from the merged list.
  hiddenBuiltInIds: string[];
  filteredExerciseIds: string[];
  // Bumped once a write that changes the set of finished sessions has landed in the database, so screens
  // that read them from there know to read again.
  sessionsRevision: number;
}

const initialState: StoredSessionState = {
  isHydrated: false,
  openSessions: {},
  activeSessionId: undefined,
  builtInExercises: {},
  savedExercises: {},
  hiddenBuiltInIds: [],
  filteredExerciseIds: [],
  sessionsRevision: 0,
};

function mergeExercises(
  builtIn: Record<string, ExerciseDescriptor>,
  saved: Record<string, ExerciseDescriptor>,
  hidden: string[],
): Record<string, ExerciseDescriptor> {
  const merged: Record<string, ExerciseDescriptor> = { ...builtIn, ...saved };
  hidden.forEach((id) => delete merged[id]);
  return Object.fromEntries(Object.entries(merged).sort((a, b) => a[1].name.localeCompare(b[1].name)));
}

const storedSessionsSlice = createSlice({
  name: 'storedSessions',
  initialState,
  reducers: {
    setIsHydrated(state, action: PayloadAction<boolean>) {
      state.isHydrated = action.payload;
    },
    /** Opens a session for editing without writing it, for one that came from the database. */
    openSession(state, action: PayloadAction<Session>) {
      state.openSessions[action.payload.id] = action.payload;
    },

    /** The workout in progress stays open, so closing it is a no-op until it is finished. */
    closeSession(state, action: PayloadAction<string>) {
      if (state.activeSessionId !== action.payload) {
        delete state.openSessions[action.payload];
      }
    },

    /** Writes sessions without opening them. One that is already open takes the written content. */
    upsertStoredSessions(state, action: PayloadAction<Session[]>) {
      action.payload.forEach((session) => {
        if (state.openSessions[session.id]) {
          state.openSessions[session.id] = session;
        }
      });
    },

    /** Opens a session and writes it. */
    putStoredSession(state, action: PayloadAction<Session>) {
      state.openSessions[action.payload.id] = action.payload;
    },

    /** Applies an edit to one session, addressed by id so it cannot land on the wrong one. */
    updateStoredSession(
      state,
      action: PayloadAction<{
        sessionId: string;
        update: (session: Session) => Session;
      }>,
    ) {
      const session = state.openSessions[action.payload.sessionId] as Session | undefined;
      if (!session) {
        return;
      }
      state.openSessions[action.payload.sessionId] = action.payload.update(session);
    },

    sessionsChanged(state) {
      state.sessionsRevision += 1;
    },

    setActiveSessionId(state, action: PayloadAction<string | undefined>) {
      state.activeSessionId = action.payload;
    },

    deleteStoredSession(state, action: PayloadAction<string>) {
      delete state.openSessions[action.payload];
      if (state.activeSessionId === action.payload) {
        state.activeSessionId = undefined;
      }
    },
    updateExercise(state, action: PayloadAction<{ id: string; exercise: ExerciseDescriptor }>) {
      state.savedExercises[action.payload.id] = action.payload.exercise;
      state.hiddenBuiltInIds = state.hiddenBuiltInIds.filter((x) => x !== action.payload.id);
    },
    upsertExercises(state, action: PayloadAction<Record<string, ExerciseDescriptor>>) {
      Object.assign(state.savedExercises, action.payload);
      state.hiddenBuiltInIds = state.hiddenBuiltInIds.filter((x) => !action.payload[x]);
    },
    deleteExercise(state, action: PayloadAction<string>) {
      if (state.builtInExercises[action.payload]) {
        // Deleting a built-in tombstones it (its override row, if any, is kept for undo).
        if (!state.hiddenBuiltInIds.includes(action.payload)) {
          state.hiddenBuiltInIds.push(action.payload);
        }
      } else {
        delete state.savedExercises[action.payload];
      }
    },
    restoreExercise(state, action: PayloadAction<string>) {
      state.hiddenBuiltInIds = state.hiddenBuiltInIds.filter((x) => x !== action.payload);
    },
    setExercises(state, action: PayloadAction<Record<string, ExerciseDescriptor>>) {
      state.savedExercises = action.payload;
    },
    setBuiltInExercises(state, action: PayloadAction<Record<string, ExerciseDescriptor>>) {
      state.builtInExercises = action.payload;
    },
    setHiddenBuiltInIds(state, action: PayloadAction<string[]>) {
      state.hiddenBuiltInIds = action.payload;
    },
    setFilteredExerciseIds(state, action: PayloadAction<string[]>) {
      state.filteredExerciseIds = action.payload;
    },
  },

  selectors: {
    /** Only finds an open session. Any other is read from the database. */
    selectSession: createSelector(
      [(state: StoredSessionState) => state.openSessions, (_, id: string) => id],
      (sessions, id) => sessions[id],
    ),
    selectActiveSessionId: (state: StoredSessionState) => state.activeSessionId,

    selectSessionsRevision: (state: StoredSessionState) => state.sessionsRevision,

    selectActiveSession: (state: StoredSessionState) =>
      state.activeSessionId === undefined ? undefined : state.openSessions[state.activeSessionId],

    selectExercises: createSelector(
      [
        (state: StoredSessionState) => state.builtInExercises,
        (state: StoredSessionState) => state.savedExercises,
        (state: StoredSessionState) => state.hiddenBuiltInIds,
      ],
      mergeExercises,
    ),
  },
});

export const initializeStoredSessionsStateSlice = createAction('initializeStoredSessionsStateSlice');

export const {
  setIsHydrated,
  openSession,
  closeSession,
  upsertStoredSessions,
  putStoredSession,
  updateStoredSession,
  sessionsChanged,
  setActiveSessionId,
  deleteStoredSession,
  updateExercise,
  upsertExercises,
  deleteExercise,
  restoreExercise,
  setExercises,
  setBuiltInExercises,
  setHiddenBuiltInIds,
  setFilteredExerciseIds,
} = storedSessionsSlice.actions;

export const { selectSession, selectActiveSession, selectActiveSessionId, selectSessionsRevision, selectExercises } =
  storedSessionsSlice.selectors;

/** Fired when a session is done being edited: publish it, export it, and re-derive what depends on it. */
export const sessionFinished = createAction<string>('sessionFinished');

export const selectExerciseById = createSelector(
  [selectExercises, (_, id: string) => id],
  (exercises, id) => exercises[id],
);

export const selectMuscles = createSelector([selectExercises], (exercises) =>
  Enumerable.from(Object.entries(exercises))
    .selectMany(([, x]) => x.muscles)
    .distinct()
    .orderBy((x) => x)
    .toArray(),
);

export const selectExerciseIds = createSelector([selectExercises], (exercises) => Object.keys(exercises));

export const storedSessionsReducer = storedSessionsSlice.reducer;

export function getSessionReferenceTime(session: Session): OffsetDateTime {
  return (
    session.lastExercise?.latestTime ?? session.date.atStartOfDay().atZone(ZoneId.systemDefault()).toOffsetDateTime()
  );
}
