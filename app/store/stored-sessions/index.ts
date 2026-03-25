import {
  fromRecordedExercisePOJO,
  RecordedExercise,
  RecordedExercisePOJO,
  Session,
  SessionPOJO,
} from '@/models/session-models';
import {
  NormalizedName,
  NormalizedNameKey,
  ExerciseBlueprint,
  KeyedExerciseBlueprint,
  fromExerciseBlueprintPOJO,
  ExerciseBlueprintPOJO,
} from '@/models/blueprint-models';
import { LocalDate, OffsetDateTime, YearMonth, ZoneId } from '@js-joda/core';
import {
  createAction,
  createSelector,
  createSlice,
  PayloadAction,
  WritableDraft,
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
  latestExercises: Record<string, RecordedExercisePOJO | undefined>; // KeyedExerciseBlueprint -> RecordedExercise
  savedExercises: Record<string, ExerciseDescriptor>;
  filteredExerciseIds: string[];
  exercisesRequiringWeightMigration: WeightMigrateableExercise[];
}

const initialState: StoredSessionState = {
  isHydrated: false,
  sessions: {},
  latestExercises: {},
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
      action.payload.forEach((session) => {
        state.sessions[session.id] = session.toPOJO();
        updateLatestExercises(state, session);
      });
    },

    addStoredSession(state, action: PayloadAction<Session>) {
      state.sessions[action.payload.id] = action.payload.toPOJO();
      updateLatestExercises(state, action.payload);
    },

    deleteStoredSession(state, action: PayloadAction<string>) {
      const deletedSession = state.sessions[action.payload];
      delete state.sessions[action.payload];

      if (!deletedSession) return;

      // Collect the exercise keys that were in the deleted session
      const affectedKeys = new Set(
        deletedSession.recordedExercises.map((e) =>
          KeyedExerciseBlueprint.fromExerciseBlueprint(
            fromExerciseBlueprintPOJO(e.blueprint as ExerciseBlueprintPOJO),
          ).toString(),
        ),
      );

      // For each affected key, clear and recalculate from remaining sessions
      affectedKeys.forEach((key) => {
        delete state.latestExercises[key];
      });

      Object.values(state.sessions).forEach((sessionPOJO) => {
        updateLatestExercises(
          state,
          Session.fromPOJO(sessionPOJO as SessionPOJO),
        );
      });
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
    selectLatestExercises: createSelector(
      [(state: StoredSessionState) => state.latestExercises],
      (exercises) =>
        Object.fromEntries(
          Object.entries(exercises).map(([key, exercise]) => [
            key,
            exercise ? fromRecordedExercisePOJO(exercise) : undefined,
          ]),
        ),
    ),
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

function updateLatestExercises(
  state: WritableDraft<StoredSessionState>,
  session: Session,
) {
  session.recordedExercises.forEach((exercise) => {
    const key = KeyedExerciseBlueprint.fromExerciseBlueprint(
      exercise.blueprint,
    ).toString();
    const latestExercise = state.latestExercises[key];
    if (
      !latestExercise ||
      fromRecordedExercisePOJO(
        latestExercise as RecordedExercisePOJO,
      ).latestTime?.isBefore(exercise.latestTime ?? OffsetDateTime.MIN)
    ) {
      state.latestExercises[key] = exercise.toPOJO();
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
        (x.date.isAfter(minDate) || x.date.isEqual(minDate)) &&
        (x.date.isBefore(maxDate) || x.date.isEqual(maxDate)),
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
  selectLatestExercises,
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
