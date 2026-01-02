import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Duration, OffsetDateTime, Period } from '@js-joda/core';
import { Weight } from '@/models/weight';

interface StatsState {
  isDirty: boolean;
  isLoading: boolean;
  overallViewSessionName: string | undefined;
  overallViewTime: Period;
  overallView: GranularStatisticView | undefined;
  pinnedExerciseStatistics: PinnedExerciseStatistic[];
}

export interface TimeTrackedStatistic<T> {
  dateTime: OffsetDateTime;
  value: T;
}

// We use this to ensure that when showing multiple series with disparate data, we can ensure that the x axis points are properly aligned
export interface OptionalTimeTrackedStatistic<T> {
  dateTime: OffsetDateTime;
  value: T | undefined;
}

export interface ExerciseStatistics {
  exerciseName: string;
  statistics: StatisticOverTime;
  oneRepMaxStatistics: StatisticOverTime;
  totalLifted: Weight;
  max: Weight;
  current: Weight;
  oneRepMax: Weight;
}

export interface PinnedExerciseStatistic {
  exerciseName: string;
}

export interface StatisticOverTime {
  title: string;
  statistics: TimeTrackedStatistic<Weight>[];
  maxValue: Weight;
  minValue: Weight;
}

export interface OptionalStatisticOverTime<T> {
  title: string;
  statistics: OptionalTimeTrackedStatistic<T>[];
  maxValue: T;
  minValue: T;
}

export interface TimeSpentExercise {
  exerciseName: string;
  timeSpent: Duration;
}

export interface HeaviestLift {
  exerciseName: string;
  weight: Weight;
}

export interface GranularStatisticView {
  maxWeightLiftedInAWorkout: Weight | undefined;
  averageSessionLength: Duration;
  heaviestLift: HeaviestLift | undefined;
  exerciseMostTimeSpent: TimeSpentExercise | undefined;
  exerciseStats: ExerciseStatistics[];
  sessionStats: OptionalStatisticOverTime<Weight>[];
  bodyweightStats: StatisticOverTime;
}

const initialState: StatsState = {
  isDirty: true,
  isLoading: false,
  overallViewSessionName: undefined,
  overallViewTime: Period.ofDays(90),
  overallView: undefined,
  pinnedExerciseStatistics: [],
};

const statsSlice = createSlice({
  name: 'stats',
  initialState,
  reducers: {
    setOverallStats(
      state,
      action: PayloadAction<GranularStatisticView | undefined>,
    ) {
      state.overallView = action.payload;
    },
    setStatsIsLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setStatsIsDirty(state, action: PayloadAction<boolean>) {
      state.isDirty = action.payload;
    },
    setOverallViewTime(state, action: PayloadAction<Period>) {
      state.overallViewTime = action.payload;
    },
    setOverallViewSession(state, action: PayloadAction<string | undefined>) {
      state.overallViewSessionName = action.payload;
    },
    setPinnedExerciseStats(
      state,
      action: PayloadAction<PinnedExerciseStatistic[]>,
    ) {
      state.pinnedExerciseStatistics = action.payload;
    },
  },
  selectors: {
    selectIsLoading: (state: StatsState) => state.isLoading,
    selectOverallView: (state: StatsState) => state.overallView,
    selectPinnedExerciseStats: (state: StatsState) =>
      state.pinnedExerciseStatistics,
  },
});
export const {
  setOverallStats,
  setStatsIsLoading,
  setStatsIsDirty,
  setOverallViewTime,
  setOverallViewSession,
  setPinnedExerciseStats,
} = statsSlice.actions;

export const { selectIsLoading, selectOverallView, selectPinnedExerciseStats } =
  statsSlice.selectors;

export const fetchOverallStats = createAction('fetchOverallStats');

export const statsReducer = statsSlice.reducer;
