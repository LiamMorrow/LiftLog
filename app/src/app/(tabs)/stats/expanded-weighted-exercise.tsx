import FullHeightScrollView from '@/components/layout/full-height-scroll-view';
import { Remote } from '@/components/presentation/foundation/remote';
import { RepsBarChart } from '@/components/presentation/stats/reps-bar-chart';
import SingleValueStatisticCard from '@/components/presentation/stats/single-value-statistic-card';
import { SingleValueStatisticsGrid } from '@/components/presentation/stats/single-value-statistics-grid';
import { TimePeriodSelector } from '@/components/presentation/stats/time-period-selector';
import { TitledSection } from '@/components/presentation/stats/titled-section';
import { StatisticBarChart } from '@/components/presentation/stats/statistic-bar-chart';
import { StatisticLineChart } from '@/components/presentation/stats/statistic-line-chart';
import { useLoadAxis, useRepsAxis } from '@/components/presentation/stats/quantity-axis';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { useAppSelector, useAppSelectorWithArg } from '@/store';
import { fetchOverallStats, selectExerciseView, setOverallViewTime, WeightedExerciseStatistics } from '@/store/stats';
import { T, useTranslate } from '@tolgee/react';
import { Stack, useFocusEffect } from 'expo-router';
import { useLocalSearchParams, useRouter } from 'expo-router/build/hooks';
import { ReactNode, useEffect } from 'react';
import { View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { useDispatch } from 'react-redux';

export default function ExpandedExercisePage() {
  const dispatch = useDispatch();
  const timePeriod = useAppSelector((x) => x.stats.overallViewTime);
  const { exerciseName } = useLocalSearchParams<{ exerciseName: string }>();
  const { dismissTo } = useRouter();
  useFocusEffect(() => {
    dispatch(fetchOverallStats());
  });
  useEffect(() => {
    if (!exerciseName) {
      dismissTo('/stats');
    }
  }, [exerciseName, dismissTo]);
  const stats = useAppSelectorWithArg(selectExerciseView, exerciseName);
  return (
    <FullHeightScrollView contentContainerStyle={{ gap: spacing[2] }}>
      <Stack.Screen
        options={{
          title: exerciseName,
        }}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingRight: spacing[2] }}>
        <TimePeriodSelector timePeriod={timePeriod} setTimePeriod={(value) => dispatch(setOverallViewTime(value))} />
      </View>
      <Remote value={stats} success={(stats) => <LoadedStats stats={stats} />} />
    </FullHeightScrollView>
  );
}

function LoadedStats({ stats }: { stats: WeightedExerciseStatistics | undefined }) {
  return stats ? (
    <LoadedStatsFilled stats={stats} />
  ) : (
    <Text>
      <T keyName="stats.no_data.message" />
    </Text>
  );
}

function LoadedStatsFilled({ stats }: { stats: WeightedExerciseStatistics }) {
  const { t } = useTranslate();
  const loadAxis = useLoadAxis();
  const repsAxis = useRepsAxis();
  return (
    <View style={{ gap: spacing[4] }}>
      <OverallStatsGrid stats={stats} />
      {stats.primary === 'reps' ? (
        <StatCardWithTitle title={t('stats.exercise.max_reps.title')}>
          <StatisticLineChart statistics={stats.series.reps} axis={repsAxis} />
        </StatCardWithTitle>
      ) : (
        <StatCardWithTitle title={t('stats.exercise.max_weight.title')}>
          <StatisticLineChart statistics={stats.series.load} axis={loadAxis} />
        </StatCardWithTitle>
      )}
      {/* 1RM and volume both need a load and a rep count, so a reps-only exercise has neither. */}
      {stats.primary === 'load' && (
        <>
          <StatCardWithTitle title={t('stats.exercise.1rm_progress.title')}>
            <StatisticLineChart statistics={stats.max1RMPerSessionStatistics} axis={loadAxis} />
          </StatCardWithTitle>
          <StatCardWithTitle title={t('stats.exercise.volume_per_workout.title')}>
            <StatisticBarChart statistics={stats.totalVolumeStatistics} axis={loadAxis} />
          </StatCardWithTitle>
        </>
      )}
      <StatCardWithTitle title={t('stats.exercise.reps_breakdown.title')}>
        <RepsBarChart statistics={stats.repsStatistics} />
        <Text style={{ textAlign: 'center' }}>{t('stats.exercise.reps_breakdown_sets_x_axis.label')}</Text>
      </StatCardWithTitle>
    </View>
  );
}

function StatCardWithTitle(props: { title: string; children: ReactNode }) {
  const { colors } = useAppTheme();
  return (
    <TitledSection title={props.title}>
      <Card
        mode="contained"
        style={{
          backgroundColor: colors.surfaceContainer,
        }}
      >
        <Card.Content style={{ paddingVertical: spacing[8] }}>{props.children}</Card.Content>
      </Card>
    </TitledSection>
  );
}

function OverallStatsGrid({ stats }: { stats: WeightedExerciseStatistics }) {
  const { t } = useTranslate();
  const usualRepRange = getUsualRepRange(stats);
  const repsAxis = useRepsAxis();
  const onReps = stats.primary === 'reps';
  return (
    <TitledSection title={t('stats.exercise.overview.title')}>
      <SingleValueStatisticsGrid>
        <SingleValueStatisticCard
          title={t('stats.exercise.sets_per_week.label')}
          icon={'function'}
          value={formatWeeklyRate(stats.setsPerWeek)}
        />
        <SingleValueStatisticCard
          title={onReps ? t('stats.exercise.current_reps.label') : t('stats.exercise.current_weight.label')}
          icon={onReps ? 'barChart' : 'weight'}
          value={
            onReps
              ? repsAxis.format(stats.series.reps.currentValue)
              : stats.series.load.currentValue.shortLocaleFormat()
          }
        />
        <SingleValueStatisticCard
          title={onReps ? t('stats.exercise.max_reps.label') : t('stats.exercise.max_weight.label')}
          icon={'fitnessCenter'}
          value={onReps ? repsAxis.format(stats.series.reps.maxValue) : stats.series.load.maxValue.shortLocaleFormat()}
        />
        {/* Volume and 1RM need both axes, so a reps-only exercise offers neither. */}
        {!onReps && (
          <>
            <SingleValueStatisticCard
              title={t('stats.exercise.total_lifted.label')}
              icon={'anchor'}
              value={stats.totalVolumeStatistics.totalValue.shortLocaleFormat(0)}
            />
            <SingleValueStatisticCard
              title={t('stats.exercise.estimated_1rm.label')}
              icon={'function'}
              value={stats.max1RMPerSessionStatistics.currentValue.shortLocaleFormat(0)}
            />
          </>
        )}
        {onReps && (
          <SingleValueStatisticCard
            title={t('stats.exercise.total_reps.label')}
            icon={'anchor'}
            value={repsAxis.format(stats.series.reps.totalValue)}
          />
        )}
        <SingleValueStatisticCard
          title={t('stats.exercise.usual_rep_range.label')}
          icon={'barChart'}
          value={usualRepRange}
        />
      </SingleValueStatisticsGrid>
    </TitledSection>
  );
}

function formatWeeklyRate(value: number) {
  return Math.abs(value - Math.round(value)) < 0.05 ? Math.round(value).toString() : value.toFixed(1);
}

function getUsualRepRange(stats: WeightedExerciseStatistics) {
  const breakdown = Object.entries(stats.repsStatistics.breakdown)
    .map(([reps, { numberOfSets }]) => ({
      reps: Number(reps),
      numberOfSets,
    }))
    .sort((a, b) => a.reps - b.reps);

  const totalSets = breakdown.reduce((sum, entry) => sum + entry.numberOfSets, 0);
  if (!totalSets) {
    return '-';
  }

  const lowerBound = getPercentileRepCount(breakdown, totalSets, 0.1);
  const upperBound = getPercentileRepCount(breakdown, totalSets, 0.9);
  return `${lowerBound}-${upperBound}`;
}

function getPercentileRepCount(
  breakdown: { reps: number; numberOfSets: number }[],
  totalSets: number,
  percentile: number,
) {
  const target = Math.ceil(totalSets * percentile);
  let cumulativeSets = 0;

  for (const entry of breakdown) {
    cumulativeSets += entry.numberOfSets;
    if (cumulativeSets >= target) {
      return entry.reps.toString();
    }
  }

  return breakdown.at(-1)?.reps.toString() ?? '-';
}
