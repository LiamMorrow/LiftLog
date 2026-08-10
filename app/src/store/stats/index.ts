import { createAction, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Duration, LocalDate, OffsetDateTime } from '@js-joda/core';
import { Weight } from '@/models/weight';
import { LocalDateRange } from '@/models/time-models';
import { RemoteData } from '@/models/remote';
import { normalizeExerciseName } from '@/models/blueprint-models';
import { StatAxis } from '@/store/stats/quantity';

export type { StatAxis };

interface StatsState {
  isDirty: boolean;
  overallViewSessionName: string | undefined;
  overallViewTime: LocalDateRange | 'all-time';
  overallView: RemoteData<GranularStatisticView>;
}

export interface TimeTrackedStatistic<T> {
  dateTime: OffsetDateTime;
  value: T;
}

// We use this to ensure that when showing multiple series with disparate data, we can ensure that the x axis points are properly aligned
interface OptionalTimeTrackedStatistic<T> {
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

/**
 * The best single set of each session, on each axis. Both are always populated — a barbell lift has
 * a rep count and a rep-based exercise has a (zero) load — and {@link WeightedExerciseStatistics.primary}
 * says which one this exercise's progress is actually read on.
 */
export interface ExerciseSeries {
  load: StatisticOverTime<Weight>;
  reps: StatisticOverTime<number>;
}

export interface WeightedExerciseStatistics {
  exerciseName: string;
  setsPerWeek: number;
  /** Which axis leads: what this exercise is tracked on, and therefore how its chart is labelled. */
  primary: StatAxis;
  series: ExerciseSeries;
  maxLiftedPerSessionStatistics: WeightedStatisticOverTime;
  /**
   * Derived metrics declare their inputs: both of these need a load *and* a rep count, so an
   * exercise that tracks no load simply has nothing to offer here.
   */
  max1RMPerSessionStatistics: WeightedStatisticOverTime;
  totalVolumeStatistics: WeightedStatisticOverTime;
  repsStatistics: RepsBreakdownStatistics;
}

export interface StatisticOverTime<T> {
  statistics: TimeTrackedStatistic<T>[];
  currentValue: T;
  totalValue: T;
  maxValue: T;
  minValue: T;
}

export type WeightedStatisticOverTime = StatisticOverTime<Weight>;

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
};

const statsSlice = createSlice({
  name: 'stats',
  initialState,
  reducers: {
    setOverallStats(state, action: PayloadAction<RemoteData<GranularStatisticView>>) {
      state.overallView = action.payload;
    },
    setStatsIsDirty(state, action: PayloadAction<boolean>) {
      state.isDirty = action.payload;
    },
    setOverallViewTime(state, action: PayloadAction<LocalDateRange | 'all-time'>) {
      state.overallViewTime = action.payload;
    },
    setOverallViewSession(state, action: PayloadAction<string | undefined>) {
      state.overallViewSessionName = action.payload;
    },
  },
  selectors: {
    selectOverallView: (state: StatsState) => state.overallView,
  },
});

export const { setOverallStats, setStatsIsDirty, setOverallViewTime } = statsSlice.actions;

export const { selectOverallView } = statsSlice.selectors;
export const selectExerciseView = createSelector(
  selectOverallView,
  (_, exercise: string) => exercise,
  (state: RemoteData<GranularStatisticView>, exerciseName: string) =>
    state.map((x) =>
      x.weightedExerciseStats.find(
        (ex) => normalizeExerciseName(ex.exerciseName) === normalizeExerciseName(exerciseName),
      ),
    ),
);

export const fetchOverallStats = createAction('fetchOverallStats');

export const statsReducer = statsSlice.reducer;
