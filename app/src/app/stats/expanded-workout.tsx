import FullHeightScrollView from '@/components/layout/full-height-scroll-view';
import { Remote } from '@/components/presentation/foundation/remote';
import { MultiSeriesWeightLineChart } from '@/components/presentation/stats/multi-series-weight-line-chart';
import { StatCardWithTitle } from '@/components/presentation/stats/stat-card-with-title';
import { TimePeriodSelector } from '@/components/presentation/stats/time-period-selector';
import { spacing } from '@/hooks/useAppTheme';
import { useAppSelector, useAppSelectorWithArg } from '@/store';
import { fetchOverallStats, selectWorkoutView, setOverallViewTime, WorkoutExerciseStatistics } from '@/store/stats';
import { T, useTranslate } from '@tolgee/react';
import { Stack, useFocusEffect } from 'expo-router';
import { useLocalSearchParams, useRouter } from 'expo-router/build/hooks';
import { useEffect } from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { useDispatch } from 'react-redux';

export default function ExpandedWorkoutPage() {
  const dispatch = useDispatch();
  const timePeriod = useAppSelector((x) => x.stats.overallViewTime);
  const { workoutName } = useLocalSearchParams<{ workoutName: string }>();
  const { dismissTo } = useRouter();
  useFocusEffect(() => {
    dispatch(fetchOverallStats());
  });
  useEffect(() => {
    if (!workoutName) {
      dismissTo('/stats');
    }
  }, [workoutName, dismissTo]);
  const stats = useAppSelectorWithArg(selectWorkoutView, workoutName);
  return (
    <FullHeightScrollView contentContainerStyle={{ gap: spacing[2] }}>
      <Stack.Screen
        options={{
          title: workoutName,
        }}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
        <TimePeriodSelector timePeriod={timePeriod} setTimePeriod={(value) => dispatch(setOverallViewTime(value))} />
      </View>
      <Remote value={stats} success={(stats) => <LoadedStats stats={stats} />} />
    </FullHeightScrollView>
  );
}

function LoadedStats({ stats }: { stats: WorkoutExerciseStatistics | undefined }) {
  const { t } = useTranslate();
  return stats && stats.exerciseStats.length ? (
    <StatCardWithTitle title={t('stats.workout.exercise_progress.title')}>
      <MultiSeriesWeightLineChart series={stats.exerciseStats} />
    </StatCardWithTitle>
  ) : (
    <Text>
      <T keyName="stats.no_data.message" />
    </Text>
  );
}
