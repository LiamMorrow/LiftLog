import FullHeightScrollView from '@/components/layout/full-height-scroll-view';
import Icon from '@/components/presentation/foundation/gesture-wrappers/icon';
import { Remote } from '@/components/presentation/foundation/remote';
import { ExerciseListSummary } from '@/components/presentation/stats/exercise-list-summary';
import SingleValueStatisticCard from '@/components/presentation/stats/single-value-statistic-card';
import { SingleValueStatisticsGrid } from '@/components/presentation/stats/single-value-statistics-grid';
import { TimePeriodSelector } from '@/components/presentation/stats/time-period-selector';
import { TitledSection } from '@/components/presentation/stats/titled-section';
import { spacing } from '@/hooks/useAppTheme';
import { Weight } from '@/models/weight';
import { useAppSelector } from '@/store';
import {
  fetchOverallStats,
  GranularStatisticView,
  selectOverallView,
  setOverallViewTime,
} from '@/store/stats';
import { formatDuration } from '@/utils/format-date';
import { useTranslate } from '@tolgee/react';
import { Stack, useFocusEffect } from 'expo-router';
import { View, Text } from 'react-native';
import { useDispatch } from 'react-redux';
import { match } from 'ts-pattern';

export default function StatsPage() {
  const { t } = useTranslate();
  const timePeriod = useAppSelector((x) => x.stats.overallViewTime);
  const dispatch = useDispatch();
  useFocusEffect(() => {
    dispatch(fetchOverallStats());
  });
  const stats = useAppSelector(selectOverallView);
  return (
    <FullHeightScrollView contentContainerStyle={{ gap: spacing[2] }}>
      <Stack.Screen
        options={{
          title: t('stats.statistics.title'),
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

function LoadedStats({ stats }: { stats: GranularStatisticView }) {
  return (
    <View>
      <OverallStatsGrid stats={stats} />
      <ExerciseListSummary stats={stats} />
    </View>
  );
}

function OverallStatsGrid({ stats }: { stats: GranularStatisticView }) {
  const { t } = useTranslate();
  return (
    <TitledSection title={t('stats.overview.title')}>
      <SingleValueStatisticsGrid>
        <SingleValueStatisticCard
          title={t('stats.workouts_per_week.label')}
          value={formatWeeklyRate(stats.workoutsPerWeek)}
          icon={'assignment'}
        />
        <SingleValueStatisticCard
          title={t('stats.sets_per_week.label')}
          value={formatWeeklyRate(stats.setsPerWeek)}
          icon={'function'}
        />
        <SingleValueStatisticCard
          title={t('stats.max_weight_in_workout.label')}
          value={stats.maxWeightLiftedInAWorkout?.shortLocaleFormat(0) ?? '-'}
          icon={'weight'}
        />
        <SingleValueStatisticCard
          title={t('workout.average_length.label')}
          icon={'avgTime'}
          value={formatDuration(stats.averageSessionLength, 'mins')}
        />
        <SingleValueStatisticCard
          title={t('stats.bodyweight_change.label')}
          icon={'monitorWeight'}
          value={<BodyweightStatValue stats={stats} />}
        />
        <SingleValueStatisticCard
          title={t('stats.heaviest_lift.label')}
          icon={'fitnessCenter'}
          value={
            stats.heaviestLift
              ? stats.heaviestLift.exerciseName +
                ' - ' +
                stats.heaviestLift.weight.shortLocaleFormat(0)
              : '-'
          }
        />
      </SingleValueStatisticsGrid>
    </TitledSection>
  );
}

function formatWeeklyRate(value: number) {
  const rounded =
    Math.abs(value - Math.round(value)) < 0.05
      ? Math.round(value).toString()
      : value.toFixed(1);
  return rounded;
}

function BodyweightStatValue({
  stats: { bodyweightStats },
}: {
  stats: GranularStatisticView;
}) {
  const showBodyweight = useAppSelector((x) => x.settings.showBodyweight);
  if (!showBodyweight) {
    return <Text>-</Text>;
  }
  const currentValue = bodyweightStats.currentValue;
  const earliestValue = bodyweightStats.statistics[0]?.value ?? Weight.NIL;
  const change = currentValue.minus(earliestValue);
  const changeDirection = match({
    zero: change.value.isZero(),
    positive: change.value.isPositive(),
  })
    .with({ zero: true }, () => <Icon source={'plusMinus'} size={12} />)
    .with({ positive: true }, () => <Icon source={'plus'} size={12} />)
    .with({ positive: false }, () => <Icon source={'minus'} size={12} />)
    .exhaustive();

  return (
    <Text>
      {currentValue.shortLocaleFormat(0)} ({changeDirection}
      {change.abs().shortLocaleFormat(2)})
    </Text>
  );
}
