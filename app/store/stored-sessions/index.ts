import {
  RecordedExercise,
  Session,
  SessionPOJO,
} from '@/models/session-models';
import {
  NormalizedName,
  NormalizedNameKey,
  ExerciseBlueprint,
} from '@/models/blueprint-models';
import { LocalDate, YearMonth, ZoneId } from '@js-joda/core';
import {
  createAction,
  createSelector,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import Enumerable from 'linq';
import { WeightUnit } from '@/models/weight';
import { TemporalComparer } from '@/models/comparers';

export interface ExerciseDescriptor {
  name: string;
  force: string | null;
  level: string;
  mechanic: string | null;
  equipment: string | null;
  muscles: string[];
  instructions: string;
  category: string;
}

export interface WeightMigrateableExercise {
  name: string;
  unit: WeightUnit;
}

interface StoredSessionState {
  isHydrated: boolean;
  sessions: Record<string, SessionPOJO>;
  savedExercises: Record<string, ExerciseDescriptor>;
  filteredExerciseIds: string[];
  exercisesRequiringWeightMigration: WeightMigrateableExercise[];
}

const initialState: StoredSessionState = {
  isHydrated: false,
  sessions: {},
  savedExercises: {},
  filteredExerciseIds: [],
  exercisesRequiringWeightMigration: [],
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
    updateExercise(
      state,
      action: PayloadAction<{ id: string; exercise: ExerciseDescriptor }>,
    ) {
      state.savedExercises[action.payload.id] = action.payload.exercise;
    },
    deleteExercise(state, action: PayloadAction<string>) {
      delete state.savedExercises[action.payload];
    },
    setExercises(
      state,
      action: PayloadAction<Record<string, ExerciseDescriptor>>,
    ) {
      state.savedExercises = action.payload;
    },
    setFilteredExerciseIds(state, action: PayloadAction<string[]>) {
      state.filteredExerciseIds = action.payload;
    },
    setExercisesRequiringWeightMigration(
      state,
      action: PayloadAction<WeightMigrateableExercise[]>,
    ) {
      state.exercisesRequiringWeightMigration = action.payload;
    },
    updateExerciseRequiringWeightMigration(
      state,
      action: PayloadAction<WeightMigrateableExercise>,
    ) {
      const val = state.exercisesRequiringWeightMigration.find(
        (x) => x.name === action.payload.name,
      );
      if (val) val.unit = action.payload.unit;
    },
  },

  selectors: {
    selectSessions: createSelector(
      [(state: StoredSessionState) => state.sessions],
      (sessions) => Object.values(sessions).map((x) => Session.fromPOJO(x)),
    ),
    selectSession: createSelector(
      [(state: StoredSessionState) => state.sessions, (_, id: string) => id],
      (sessions, id) => Session.fromPOJO(sessions[id]),
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

    selectExercises: (state: StoredSessionState) => state.savedExercises,
    selectExerciseById: createSelector(
      [
        (state: StoredSessionState) => state.savedExercises,
        (_, id: string) => id,
      ],
      (exercises, id) => exercises[id],
    ),

    selectExerciseIds: (state: StoredSessionState) =>
      Object.keys(state.savedExercises),
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

export const migrateExerciseWeights = createAction('migrateExerciseWeights');
export const checkIfWeightMigrationRequired = createAction(
  'checkIfWeightMigrationRequired',
);

export const {
  setIsHydrated,
  setStoredSessions,
  upsertStoredSessions,
  addStoredSession,
  deleteStoredSession,
  updateExercise,
  deleteExercise,
  setExercises,
  setFilteredExerciseIds,
  setExercisesRequiringWeightMigration,
  updateExerciseRequiringWeightMigration,
} = storedSessionsSlice.actions;

export const {
  selectSessions,
  selectCompletedDistinctSessionNames,
  selectSession,
  selectExercises,
  selectExerciseById,
} = storedSessionsSlice.selectors;

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
      .selectMany((x) => x.recordedExercises.filter((x) => x.isStarted))
      .groupBy((x) =>
        NormalizedName.fromExerciseBlueprint(x.blueprint).toString(),
      )
      .toObject(
        (x) => x.key(),
        (x) =>
          x
            .orderByDescending((x) => x.latestTime, TemporalComparer)
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
      .orderByDescending((x) => x.date, TemporalComparer)
      .thenByDescending(
        (x) =>
          x.lastExercise?.latestTime ??
          x.date
            .atStartOfDay()
            .atZone(ZoneId.systemDefault())
            .toOffsetDateTime(),
        TemporalComparer,
      )
      .toArray(),
);

export const selectMuscles = createSelector([selectExercises], (exercises) =>
  Enumerable.from(Object.entries(exercises))
    .selectMany(([, x]) => x.muscles)
    .distinct()
    .orderBy((x) => x)
    .toArray(),
);

export const selectExerciseIds = createSelector(
  [selectExercises],
  (exercises) => Object.keys(exercises),
);

export const storedSessionsReducer = storedSessionsSlice.reducer;
