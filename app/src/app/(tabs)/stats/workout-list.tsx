import { Remote } from '@/components/presentation/foundation/remote';
import { WorkoutListSearcher } from '@/components/presentation/stats/workout-list-searcher';
import { useAppSelector } from '@/store';
import { fetchOverallStats, selectOverallView, WorkoutExerciseStatistics } from '@/store/stats';
import { useTranslate } from '@tolgee/react';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { HeaderHeightContext } from 'expo-router/react-navigation';
import { useContext } from 'react';
import { Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';

export default function WorkoutListPage() {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const { dismiss, push } = useRouter();
  useFocusEffect(() => {
    dispatch(fetchOverallStats());
  });
  const stats = useAppSelector(selectOverallView);

  const onItemPress = (item: WorkoutExerciseStatistics) => {
    dismiss();
    push(`/stats/expanded-workout?workoutName=${encodeURIComponent(item.workoutName)}`);
  };

  const headerHeight = useContext(HeaderHeightContext); // Intentionally don't use useHeaderHeight as it might not be in a stack
  const topInsetHeight = Platform.select({ ios: headerHeight }) ?? 0;
  return (
    <SafeAreaView
      edges={{ bottom: 'additive', left: 'additive', right: 'additive', top: 'off' }}
      style={{ flex: 1, paddingTop: topInsetHeight }}
    >
      <Stack.Screen
        options={{
          title: t('stats.workout_list.title'),
        }}
      />
      <Remote value={stats} success={(stats) => <WorkoutListSearcher stats={stats} onItemPress={onItemPress} />} />
    </SafeAreaView>
  );
}
