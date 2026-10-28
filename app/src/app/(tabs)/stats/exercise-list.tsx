import { Remote } from '@/components/presentation/foundation/remote';
import { WeightedExerciseListSearcher } from '@/components/presentation/stats/weighted-exercise-list-searcher';
import { useHeaderInset } from '@/hooks/useHeaderInset';
import { useAppSelector } from '@/store';
import { fetchOverallStats, selectOverallView, WeightedExerciseStatistics } from '@/store/stats';
import { useTranslate } from '@tolgee/react';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';

export default function ExerciseListPage() {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const { dismiss, push } = useRouter();
  useFocusEffect(() => {
    dispatch(fetchOverallStats());
  });
  const stats = useAppSelector(selectOverallView);

  const onItemPress = (item: WeightedExerciseStatistics) => {
    dismiss();
    push(`/stats/expanded-weighted-exercise?exerciseName=${encodeURIComponent(item.exerciseName)}`);
  };

  const headerInset = useHeaderInset();
  return (
    <SafeAreaView
      edges={{ bottom: 'additive', left: 'additive', right: 'additive', top: 'off' }}
      style={{ flex: 1, paddingTop: headerInset }}
    >
      <Stack.Screen
        options={{
          title: t('stats.weighted_exercise_list.title'),
        }}
      />
      <Remote
        value={stats}
        success={(stats) => <WeightedExerciseListSearcher stats={stats} onItemPress={onItemPress} />}
      />
    </SafeAreaView>
  );
}
