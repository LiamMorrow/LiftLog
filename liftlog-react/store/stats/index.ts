import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Duration, LocalDateTime } from '@js-joda/core';
import BigNumber from 'bignumber.js';

interface StatsState {
  isDirty: boolean;
  isLoading: boolean;
  overallViewSessionName: string | undefined;
  overallViewTime: Duration;
  overallView: GranularStatisticView | undefined;
  pinnedExerciseStatistics: PinnedExerciseStatistic[];
}

export interface TimeTrackedStatistic {
  dateTime: LocalDateTime;
  value: number;
}

export interface ExerciseStatistics {
  exerciseName: string;
  statistics: TimeTrackedStatistic[];
  oneRepMaxStatistics: TimeTrackedStatistic[];
  totalLifted: number;
  max: number;
  current: number;
  oneRepMax: number;
}

export interface PinnedExerciseStatistic {
  exerciseName: string;
}

export interface StatisticOverTime {
  title: string;
  statistics: TimeTrackedStatistic[];
}

export interface TimeSpentExercise {
  exerciseName: string;
  timeSpent: Duration;
}

export interface HeaviestLift {
  exerciseName: string;
  weight: BigNumber;
}

export interface GranularStatisticView {
  averageTimeBetweenSets: Duration;
  averageSessionLength: Duration;
  heaviestLift: HeaviestLift | undefined;
  exerciseMostTimeSpent: TimeSpentExercise | undefined;
  exerciseStats: ExerciseStatistics[];
  sessionStats: StatisticOverTime[];
  bodyweightStats: StatisticOverTime;
}

const initialState: StatsState = {
  isDirty: true,
  isLoading: false,
  overallViewSessionName: undefined,
  overallViewTime: Duration.ofDays(90),
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
    setOverallViewTime(state, action: PayloadAction<Duration>) {
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
