import { LocalDateComparer, LocalDateTimeComparer } from '@/models/comparers';
import {
  ExerciseBlueprint,
  NormalizedName,
  NormalizedNameKey,
  RecordedExercise,
  Session,
  SessionPOJO,
} from '@/models/session-models';
import { LocalDate, YearMonth } from '@js-joda/core';
import {
  createAction,
  createSelector,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import Enumerable from 'linq';

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

    upsertStoredSessions(state, action: PayloadAction<Session[]>) {
      action.payload.forEach((s) => (state.sessions[s.id] = s.toPOJO()));
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
    selectCompletedDistinctSessionNames: createSelector(
      [
        (state: StoredSessionState) => state.sessions,
        (_, since: LocalDate) => since,
      ],
      (sessions, since) =>
        Enumerable.from(Object.values(sessions))
          .where((x) => x.date.isAfter(since) || x.date.isEqual(since))
          .select((x) => x.blueprint.name)
          .distinct()
          .toArray(),
    ),
  },
});

export const selectSessionsBy = createSelector(
  [
    storedSessionsSlice.selectors.selectSessions,
    (_, date: LocalDate) => date,
    (_, __, sessionName: string | undefined) => sessionName,
  ],
  (sessions, date, sessionName) =>
    Object.values(sessions).filter(
      (x) =>
        (x.date.isAfter(date) || x.date.isEqual(date)) &&
        (!sessionName || x.blueprint.name === sessionName),
    ),
);

export const initializeStoredSessionsStateSlice = createAction(
  'initializeStoredSessionsStateSlice',
);

export const {
  setIsHydrated,
  setStoredSessions,
  upsertStoredSessions,
  addStoredSession,
  deleteStoredSession,
} = storedSessionsSlice.actions;

export const { selectSessions, selectCompletedDistinctSessionNames } =
  storedSessionsSlice.selectors;

export const selectLatestOrderedRecordedExercises = createSelector(
  [
    storedSessionsSlice.selectors.selectSessions,
    (_, maxRecordsPerExercise: number) => maxRecordsPerExercise,
  ],
  (
    sessions,
    maxRecordsPerExercise,
  ): Record<NormalizedNameKey, RecordedExercise[]> => {
    return Enumerable.from(sessions)
      .selectMany((x) =>
        x.recordedExercises.filter((x) => x.lastRecordedSet?.set),
      )
      .groupBy((x) =>
        NormalizedName.fromExerciseBlueprint(x.blueprint).toString(),
      )
      .toObject(
        (x) => x.key(),
        (x) =>
          x
            .orderByDescending(
              (x) => x.lastRecordedSet!.set!.completionDateTime,
              LocalDateTimeComparer,
            )
            .take(maxRecordsPerExercise)
            .toArray(),
      );
  },
);

export const selectRecentlyCompletedExercises = createSelector(
  selectLatestOrderedRecordedExercises,
  (recentlyCompletedExercises) =>
    (blueprint: ExerciseBlueprint): RecordedExercise[] =>
      recentlyCompletedExercises[
        NormalizedName.fromExerciseBlueprint(blueprint).toString()
      ] ?? [],
);

export const selectSessionsInMonth = createSelector(
  [selectSessions, (_, ym: YearMonth) => ym],
  (sessions, ym) =>
    Enumerable.from(sessions)
      .where(
        (x) => x.date.year() === ym.year() && x.date.month().equals(ym.month()),
      )
      .orderByDescending((x) => x.date, LocalDateComparer)
      .thenByDescending(
        (x) => x.lastExercise?.lastRecordedSet?.set?.completionDateTime,
        LocalDateTimeComparer,
      )
      .toArray(),
);

export default storedSessionsSlice.reducer;
