import FullHeightScrollView from '@/components/layout/full-height-scroll-view';
import { Remote } from '@/components/presentation/foundation/remote';
import { RepsBarChart } from '@/components/presentation/stats/reps-bar-chart';
import SingleValueStatisticCard from '@/components/presentation/stats/single-value-statistic-card';
import { SingleValueStatisticsGrid } from '@/components/presentation/stats/single-value-statistics-grid';
import { TimePeriodSelector } from '@/components/presentation/stats/time-period-selector';
import { TitledSection } from '@/components/presentation/stats/titled-section';
import { WeightBarChart } from '@/components/presentation/stats/weight-bar-chart';
import { WeightLineChart } from '@/components/presentation/stats/weight-line-chart';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { useAppSelector, useAppSelectorWithArg } from '@/store';
import {
  selectExerciseView,
  setOverallViewTime,
  WeightedExerciseStatistics,
} from '@/store/stats';
import { T, useTranslate } from '@tolgee/react';
import { Stack } from 'expo-router';
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
      <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
        <TimePeriodSelector
          timePeriod={timePeriod}
          setTimePeriod={(value) => dispatch(setOverallViewTime(value))}
        />
      </View>
      <Remote
        value={stats}
        success={(stats) => <LoadedStats stats={stats} />}
      />
    </FullHeightScrollView>
  );
}

function LoadedStats({
  stats,
}: {
  stats: WeightedExerciseStatistics | undefined;
}) {
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
  return (
    <View style={{ gap: spacing[4] }}>
      <OverallStatsGrid stats={stats} />
      <StatCardWithTitle title={t('stats.exercise.weight_progress.title')}>
        <WeightLineChart statistics={stats.maxLiftedPerSessionStatistics} />
      </StatCardWithTitle>
      <StatCardWithTitle title={t('stats.exercise.volume_per_workout.title')}>
        <WeightBarChart statistics={stats.totalVolumeStatistics} />
      </StatCardWithTitle>
      <StatCardWithTitle title={t('stats.exercise.reps_breakdown.title')}>
        <RepsBarChart statistics={stats.repsStatistics} />
        <Text style={{ textAlign: 'center' }}>
          {t('stats.exercise.reps_breakdown_sets_x_axis.label')}
        </Text>
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
        <Card.Content style={{ paddingVertical: spacing[8] }}>
          {props.children}
        </Card.Content>
      </Card>
    </TitledSection>
  );
}

function OverallStatsGrid({ stats }: { stats: WeightedExerciseStatistics }) {
  const { t } = useTranslate();
  return (
    <TitledSection title={t('stats.exercise.overview.title')}>
      <SingleValueStatisticsGrid>
        <SingleValueStatisticCard
          title={t('stats.exercise.sets_per_week.label')}
          icon={'function'}
          value={formatWeeklyRate(stats.setsPerWeek)}
        />
        <SingleValueStatisticCard
          title={t('stats.exercise.current_weight.label')}
          icon={'weight'}
          value={stats.maxLiftedPerSessionStatistics.currentValue.shortLocaleFormat()}
        />
        <SingleValueStatisticCard
          title={t('stats.exercise.max_weight.label')}
          icon={'fitnessCenter'}
          value={stats.maxLiftedPerSessionStatistics.maxValue.shortLocaleFormat()}
        />
        <SingleValueStatisticCard
          title={t('stats.exercise.total_lifted.label')}
          icon={'anchor'}
          value={stats.totalVolumeStatistics.totalValue.shortLocaleFormat(0)}
        />
        <SingleValueStatisticCard
          title={t('stats.exercise.estimated_1rm.label')}
          icon={'function'}
          value={stats.oneRepMax.shortLocaleFormat(0)}
        />
      </SingleValueStatisticsGrid>
    </TitledSection>
  );
}

function formatWeeklyRate(value: number) {
  return Math.abs(value - Math.round(value)) < 0.05
    ? Math.round(value).toString()
    : value.toFixed(1);
}
