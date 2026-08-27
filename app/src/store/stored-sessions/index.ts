import { RecordedExercise, Session } from '@/models/session-models';
import { MovementKey, ProgressionKey } from '@/models/blueprint-models';
import { LocalDate, OffsetDateTime, YearMonth, ZoneId } from '@js-joda/core';
import { createAction, createSelector, createSlice, PayloadAction, WritableDraft } from '@reduxjs/toolkit';
import { shallowEqual } from 'react-redux';
import Enumerable from 'linq';
import { TemporalComparer } from '@/models/comparers';
import { ExerciseDescriptor } from '@/models/exercise-models';
import { findPersonalRecords } from '@/store/stats/personal-records';

interface StoredSessionState {
  isHydrated: boolean;
  sessions: Record<string, Session>;
  // The workout in progress. It lives in `sessions` like any other; this only says which one it is.
  activeSessionId: string | undefined;
  latestExercises: Record<ProgressionKey, RecordedExercise | undefined>;
  // Read-only catalog resolved for the current locale, keyed by the exercise's English name.
  builtInExercises: Record<string, ExerciseDescriptor>;
  // User-created exercises and copy-on-write edits of built-ins.
  savedExercises: Record<string, ExerciseDescriptor>;
  // Built-in ids the user deleted, hidden from the merged list.
  hiddenBuiltInIds: string[];
  filteredExerciseIds: string[];
  earliestSession: Session | undefined;
}

const initialState: StoredSessionState = {
  isHydrated: false,
  sessions: {},
  activeSessionId: undefined,
  latestExercises: {},
  builtInExercises: {},
  savedExercises: {},
  hiddenBuiltInIds: [],
  filteredExerciseIds: [],
  earliestSession: undefined,
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

/**
 * Every session the user has finished with. The workout in progress is deliberately absent, because
 * this is the input to every whole-history aggregate - streak, personal records, volume scales, the
 * month list - and the History tab stays mounted behind the workout screen.
 *
 * The shallow result check is what makes that hold: `sessions` changes identity on each tap, so this
 * recomputes, but handing back the previous array keeps everything downstream memoized. Use
 * `selectSession` to look a session up by id, active or not.
 */
const selectFinishedSessions = createSelector(
  [(state: StoredSessionState) => state.sessions, (state: StoredSessionState) => state.activeSessionId],
  (sessions, activeSessionId) => Object.values(sessions).filter((session) => session.id !== activeSessionId),
  { memoizeOptions: { resultEqualityCheck: shallowEqual } },
);

const storedSessionsSlice = createSlice({
  name: 'storedSessions',
  initialState,
  reducers: {
    setIsHydrated(state, action: PayloadAction<boolean>) {
      state.isHydrated = action.payload;
    },
    setStoredSessions(state, action: PayloadAction<Record<string, Session>>) {
      state.sessions = action.payload;
      state.latestExercises = {};
      Object.values(action.payload).forEach((session) => {
        updateDerivatives(state, session);
      });
    },

    upsertStoredSessions(state, action: PayloadAction<Session[]>) {
      action.payload.forEach((session) => {
        state.sessions[session.id] = session;
        updateDerivatives(state, session);
      });
    },

    putStoredSession(state, action: PayloadAction<Session>) {
      state.sessions[action.payload.id] = action.payload;
      updateDerivatives(state, action.payload);
    },

    /** Applies an edit to one session, addressed by id so it cannot land on the wrong one. */
    updateStoredSession(
      state,
      action: PayloadAction<{
        sessionId: string;
        update: (session: Session) => Session;
      }>,
    ) {
      const session = state.sessions[action.payload.sessionId] as Session | undefined;
      if (!session) {
        return;
      }
      const updated = action.payload.update(session);
      state.sessions[action.payload.sessionId] = updated;
      updateDerivatives(state, updated);
    },

    setActiveSessionId(state, action: PayloadAction<string | undefined>) {
      state.activeSessionId = action.payload;
    },

    deleteStoredSession(state, action: PayloadAction<string>) {
      const deletedSession = state.sessions[action.payload];
      delete state.sessions[action.payload];
      if (state.activeSessionId === action.payload) {
        state.activeSessionId = undefined;
      }

      if (!deletedSession) return;

      // Collect the exercise keys that were in the deleted session
      const affectedKeys = new Set(deletedSession.recordedExercises.map((e) => e.progressionKey()));

      // For each affected key, clear and recalculate from remaining sessions
      affectedKeys.forEach((key) => {
        delete state.latestExercises[key];
      });

      Object.values(state.sessions).forEach((session) => {
        updateDerivatives(state, session as Session);
      });
    },
    updateExercise(state, action: PayloadAction<{ id: string; exercise: ExerciseDescriptor }>) {
      state.savedExercises[action.payload.id] = action.payload.exercise;
      state.hiddenBuiltInIds = state.hiddenBuiltInIds.filter((x) => x !== action.payload.id);
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
    selectLatestExercises: createSelector([(state: StoredSessionState) => state.latestExercises], (exercises) =>
      Object.fromEntries(Object.entries(exercises).map(([key, exercise]) => [key, exercise ? exercise : undefined])),
    ),
    selectSessions: selectFinishedSessions,
    selectSession: createSelector(
      [(state: StoredSessionState) => state.sessions, (_, id: string) => id],
      (sessions, id) => sessions[id],
    ),
    selectCompletedDistinctSessionNames: createSelector(
      [selectFinishedSessions, (_: StoredSessionState, since: LocalDate) => since],
      (sessions, since) =>
        Enumerable.from(sessions)
          .where((x) => x.date.isAfter(since) || x.date.isEqual(since))
          .select((x) => x.blueprint.name)
          .distinct()
          .toArray(),
    ),

    selectActiveSessionId: (state: StoredSessionState) => state.activeSessionId,

    selectActiveSession: (state: StoredSessionState) =>
      state.activeSessionId === undefined ? undefined : state.sessions[state.activeSessionId],

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

function updateDerivatives(state: WritableDraft<StoredSessionState>, session: Session) {
  if (!state.earliestSession || state.earliestSession.date.isAfter(session.date)) {
    state.earliestSession = session;
  }
  session.recordedExercises.forEach((exercise) => {
    if (!exercise.latestTime) {
      return;
    }
    const key = exercise.progressionKey();
    const latestExercise = state.latestExercises[key];
    if (!latestExercise?.latestTime || latestExercise.latestTime.isBefore(exercise.latestTime)) {
      state.latestExercises[key] = exercise;
    }
  });
}

export const selectSessionsBy = createSelector(
  [
    storedSessionsSlice.selectors.selectSessions,
    (_, minDate: LocalDate) => minDate,
    (_, __, maxDate: LocalDate) => maxDate,
  ],
  (sessions, minDate, maxDate) =>
    Object.values(sessions).filter(
      (x) =>
        (x.date.isAfter(minDate) || x.date.isEqual(minDate)) && (x.date.isBefore(maxDate) || x.date.isEqual(maxDate)),
    ),
);

export const initializeStoredSessionsStateSlice = createAction('initializeStoredSessionsStateSlice');

export const {
  setIsHydrated,
  setStoredSessions,
  upsertStoredSessions,
  putStoredSession,
  updateStoredSession,
  setActiveSessionId,
  deleteStoredSession,
  updateExercise,
  deleteExercise,
  restoreExercise,
  setExercises,
  setBuiltInExercises,
  setHiddenBuiltInIds,
  setFilteredExerciseIds,
} = storedSessionsSlice.actions;

export const {
  selectSessions,
  selectSession,
  selectActiveSession,
  selectActiveSessionId,
  selectExercises,
  selectLatestExercises,
} = storedSessionsSlice.selectors;

/** Fired when a session is done being edited: publish it, export it, and re-derive what depends on it. */
export const sessionFinished = createAction<string>('sessionFinished');

export const selectExerciseById = createSelector(
  [selectExercises, (_, id: string) => id],
  (exercises, id) => exercises[id],
);

/**
 * Finished sessions, minus the one the caller is looking at. Editing a session changes the contents of
 * `selectSessions`, so a selector that derives from it recomputes on every recorded set - dropping the
 * session under edit keeps the input identical, and the shallow result check turns that into a stable
 * reference the groupBy below can memoize on.
 */
const selectSessionsExcluding = createSelector(
  [storedSessionsSlice.selectors.selectSessions, (_, excludeSessionId: string | undefined) => excludeSessionId],
  (sessions, excludeSessionId) => sessions.filter((x) => x.id !== excludeSessionId),
  { memoizeOptions: { resultEqualityCheck: shallowEqual } },
);

const selectLatestOrderedRecordedExercises = createSelector(
  [selectSessionsExcluding],
  (sessions): Record<MovementKey, RecordedExercise[]> => {
    return Enumerable.from(sessions)
      .selectMany((x) => x.recordedExercises.filter((x) => x.isStarted))
      .groupBy((x) => x.movementKey())
      .toObject(
        (x) => x.key(),
        (x) => x.orderByDescending((x) => x.latestTime, TemporalComparer).toArray(),
      );
  },
);

const noRecordedExercises: RecordedExercise[] = [];

/**
 * Previous performances of each movement, for the session identified by `excludeSessionId` - which is
 * left out, because "previous" cannot mean the session you are looking at.
 */
export const selectRecentlyCompletedExercises = createSelector(
  selectLatestOrderedRecordedExercises,
  (recentlyCompletedExercises) =>
    (exercise: MovementKey): RecordedExercise[] =>
      recentlyCompletedExercises[exercise] ?? noRecordedExercises,
);

export const selectPreviousComparableSession = createSelector(
  [selectSessions, (_, session: Session | undefined) => session],
  (sessions, session) => {
    if (!session) {
      return undefined;
    }

    const sessionReferenceTime = getSessionReferenceTime(session);
    const previousSessions = Enumerable.from(sessions)
      .where((storedSession) => storedSession.id !== session.id)
      .where(
        (storedSession) =>
          getSessionReferenceTime(storedSession).toEpochSecond() < sessionReferenceTime.toEpochSecond(),
      )
      .orderByDescending((storedSession) => getSessionReferenceTime(storedSession), TemporalComparer);

    return previousSessions.firstOrDefault((storedSession) => storedSession.blueprint.name === session.blueprint.name);
  },
);

/**
 * Records per session across the user's whole history. Unlike the feed, which only holds its 90-day retention
 * window, nothing here is truncated, so these are all-time bests.
 */
export const selectHistoryPersonalRecords = createSelector([selectSessions], (sessions) =>
  findPersonalRecords(
    Enumerable.from(sessions)
      .orderBy((x) => getSessionReferenceTime(x), TemporalComparer)
      .toArray(),
  ),
);

export const selectSessionsInMonth = createSelector([selectSessions, (_, ym: YearMonth) => ym], (sessions, ym) =>
  Enumerable.from(sessions)
    .where((x) => x.date.year() === ym.year() && x.date.month().equals(ym.month()))
    .orderByDescending((x) => getSessionReferenceTime(x), TemporalComparer)
    .toArray(),
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
