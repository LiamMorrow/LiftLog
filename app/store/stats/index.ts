import {
  createAction,
  createSelector,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import { Duration, LocalDate, OffsetDateTime } from '@js-joda/core';
import { Weight } from '@/models/weight';
import { LocalDateRange } from '@/models/time-models';
import { RemoteData } from '@/models/remote';
import { NormalizedName } from '@/models/blueprint-models';

interface StatsState {
  isDirty: boolean;
  overallViewSessionName: string | undefined;
  overallViewTime: LocalDateRange;
  overallView: RemoteData<GranularStatisticView>;
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

export interface RepsBreakdownStatistics {
  breakdown: Record<
    number,
    {
      numberOfSets: number;
    }
  >;
}

export interface WeightedExerciseStatistics {
  exerciseName: string;
  setsPerWeek: number;
  maxLiftedPerSessionStatistics: WeightedStatisticOverTime;
  totalVolumeStatistics: WeightedStatisticOverTime;
  repsStatistics: RepsBreakdownStatistics;
  oneRepMax: Weight;
}

export interface PinnedExerciseStatistic {
  exerciseName: string;
}

export interface WeightedStatisticOverTime {
  statistics: TimeTrackedStatistic<Weight>[];
  currentValue: Weight;
  totalValue: Weight;
  maxValue: Weight;
  minValue: Weight;
}

export interface OptionalStatisticOverTime<T> {
  title: string;
  statistics: OptionalTimeTrackedStatistic<T>[];
  maxValue: T;
  minValue: T;
}

export interface HeaviestLift {
  exerciseName: string;
  weight: Weight;
}

export interface GranularStatisticView {
  workoutsPerWeek: number;
  setsPerWeek: number;
  maxWeightLiftedInAWorkout: Weight | undefined;
  averageSessionLength: Duration;
  heaviestLift: HeaviestLift | undefined;
  weightedExerciseStats: WeightedExerciseStatistics[];
  sessionStats: OptionalStatisticOverTime<Weight>[];
  bodyweightStats: WeightedStatisticOverTime;
}

const today = LocalDate.now();
const initialState: StatsState = {
  isDirty: true,
  overallViewSessionName: undefined,
  overallViewTime: { from: today.minusDays(90), to: today },
  overallView: RemoteData.notAsked(),
  pinnedExerciseStatistics: [],
};

const statsSlice = createSlice({
  name: 'stats',
  initialState,
  reducers: {
    setOverallStats(
      state,
      action: PayloadAction<RemoteData<GranularStatisticView>>,
    ) {
      state.overallView = action.payload;
    },
    setStatsIsDirty(state, action: PayloadAction<boolean>) {
      state.isDirty = action.payload;
    },
    setOverallViewTime(state, action: PayloadAction<LocalDateRange>) {
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
    selectOverallView: (state: StatsState) => state.overallView,
    selectPinnedExerciseStats: (state: StatsState) =>
      state.pinnedExerciseStatistics,
  },
});

export const {
  setOverallStats,
  setStatsIsDirty,
  setOverallViewTime,
  setOverallViewSession,
  setPinnedExerciseStats,
} = statsSlice.actions;

export const { selectOverallView, selectPinnedExerciseStats } =
  statsSlice.selectors;
export const selectExerciseView = createSelector(
  selectOverallView,
  (_, exercise: string) => exercise,
  (state: RemoteData<GranularStatisticView>, exerciseName: string) =>
    state.map((x) =>
      x.weightedExerciseStats.find((ex) =>
        new NormalizedName(ex.exerciseName).equals(
          new NormalizedName(exerciseName),
        ),
      ),
    ),
);

export const fetchOverallStats = createAction('fetchOverallStats');

export const statsReducer = statsSlice.reducer;
