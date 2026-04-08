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
import { selectExerciseView, setOverallViewTime, WeightedExerciseStatistics } from '@/store/stats';
import { formatWeeklyRate, getUsualRepRange, getWeightedExerciseSetsPerWeek } from '@/utils/weighted-exercise-stats';
import { LocalDate } from '@js-joda/core';
import { T, useTranslate } from '@tolgee/react';
import { Stack } from 'expo-router';
import { useLocalSearchParams, useRouter } from 'expo-router/build/hooks';
import { ReactNode, useEffect } from 'react';
import { View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { useDispatch } from 'react-redux';

export function ExpandedWeightedExerciseContent(props: { emptyRoute: '/stats' | '/(tabs)/progress' }) {
  const dispatch = useDispatch();
  const timePeriod = useAppSelector((x) => x.stats.overallViewTime);
  const { exerciseName } = useLocalSearchParams<{ exerciseName: string }>();
  const { dismissTo } = useRouter();

  useEffect(() => {
    if (!exerciseName) {
      dismissTo(props.emptyRoute as never);
    }
  }, [dismissTo, exerciseName, props.emptyRoute]);

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
      <Remote value={stats} success={(loadedStats) => <LoadedStats stats={loadedStats} />} />
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
      {/* Volume needs a load and a rep count, so a reps-only exercise has none to offer. */}
      {stats.primary === 'load' && (
        <StatCardWithTitle title={t('stats.exercise.volume_per_workout.title')}>
          <StatisticBarChart statistics={stats.totalVolumeStatistics} axis={loadAxis} />
        </StatCardWithTitle>
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
  const timePeriod = useAppSelector((x) => x.stats.overallViewTime);
  const earliestSession = useAppSelector((x) => x.storedSessions.earliestSession);
  // 'all-time' is resolved the same way the stats effect resolves it, from the earliest session.
  const resolvedPeriod =
    timePeriod === 'all-time'
      ? { from: earliestSession?.date ?? LocalDate.now(), to: LocalDate.now() }
      : timePeriod;
  const setsPerWeek = getWeightedExerciseSetsPerWeek(stats, resolvedPeriod);
  const repsAxis = useRepsAxis();
  const onReps = stats.primary === 'reps';
  // The grid lays each child out as its own cell, so this has to stay a flat list.
  return (
    <TitledSection title={t('stats.exercise.overview.title')}>
      <SingleValueStatisticsGrid>
        {[
          <SingleValueStatisticCard
            key="sets-per-week"
            title={t('stats.exercise.sets_per_week.label')}
            icon={'function'}
            value={formatWeeklyRate(setsPerWeek)}
          />,
          <SingleValueStatisticCard
            key="current"
            title={onReps ? t('stats.exercise.current_reps.label') : t('stats.exercise.current_weight.label')}
            icon={onReps ? 'barChart' : 'weight'}
            value={
              onReps
                ? repsAxis.format(stats.series.reps.currentValue)
                : stats.series.load.currentValue.shortLocaleFormat()
            }
          />,
          <SingleValueStatisticCard
            key="max"
            title={onReps ? t('stats.exercise.max_reps.label') : t('stats.exercise.max_weight.label')}
            icon={'fitnessCenter'}
            value={
              onReps ? repsAxis.format(stats.series.reps.maxValue) : stats.series.load.maxValue.shortLocaleFormat()
            }
          />,
          onReps ? (
            <SingleValueStatisticCard
              key="total"
              title={t('stats.exercise.total_reps.label')}
              icon={'anchor'}
              value={repsAxis.format(stats.series.reps.totalValue)}
            />
          ) : (
            <SingleValueStatisticCard
              key="total"
              title={t('stats.exercise.total_lifted.label')}
              icon={'anchor'}
              value={stats.totalVolumeStatistics.totalValue.shortLocaleFormat(0)}
            />
          ),
          // A 1RM needs a load and a rep count, so a reps-only exercise has none to offer.
          ...(onReps
            ? []
            : [
                <SingleValueStatisticCard
                  key="1rm"
                  title={t('stats.exercise.estimated_1rm.label')}
                  icon={'function'}
                  value={stats.max1RMPerSessionStatistics.currentValue.shortLocaleFormat(0)}
                />,
              ]),
          <SingleValueStatisticCard
            key="rep-range"
            title={t('stats.exercise.usual_rep_range.label')}
            icon={'barChart'}
            value={usualRepRange}
          />,
        ]}
      </SingleValueStatisticsGrid>
    </TitledSection>
  );
}



