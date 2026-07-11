import AppBottomSheet from '@/components/presentation/foundation/app-bottom-sheet';
import Button from '@/components/presentation/foundation/gesture-wrappers/button';
import { SegmentedList } from '@/components/presentation/foundation/segmented-list';
import { TitledSection } from '@/components/presentation/stats/titled-section';
import { WorkoutListSearcher } from '@/components/presentation/stats/workout-list-searcher';
import { WorkoutStatSummary } from '@/components/presentation/stats/workout-stat-summary';
import { useAppTheme } from '@/hooks/useAppTheme';
import { GranularStatisticView, WorkoutExerciseStatistics } from '@/store/stats';
import BottomSheet from '@gorhom/bottom-sheet';
import { useTranslate } from '@tolgee/react';
import { useRouter } from 'expo-router';
import Enumerable from 'linq';
import { useRef } from 'react';

export function WorkoutListSummary(props: { stats: GranularStatisticView }) {
  const { push } = useRouter();
  const { colors } = useAppTheme();
  const { t } = useTranslate();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const topWorkouts = Enumerable.from(props.stats.workoutExerciseStats).take(5).toArray();
  const onItemPress = (item: WorkoutExerciseStatistics) => {
    bottomSheetRef.current?.close();

    push(`/stats/expanded-workout?workoutName=${encodeURIComponent(item.workoutName)}`);
  };
  return (
    <TitledSection
      title={t('stats.workout_list.title')}
      titleRight={
        <Button
          mode="text"
          onPress={() => {
            bottomSheetRef.current?.expand();
          }}
          style={{ alignSelf: 'flex-end' }}
        >
          {t('stats.see_more.button')}
        </Button>
      }
    >
      <SegmentedList
        items={topWorkouts}
        renderItem={(item) => <WorkoutStatSummary onPress={onItemPress} workoutStats={item} />}
      />
      <AppBottomSheet
        backgroundStyle={{ backgroundColor: colors.surfaceContainerHighest }}
        index={-1}
        sheetRef={bottomSheetRef}
        enableContentPanningGesture={false}
        enablePanDownToClose
        containerStyle={{ flex: 1 }}
        style={{ flex: 1 }}
        enableDynamicSizing={false}
      >
        <WorkoutListSearcher stats={props.stats} onItemPress={onItemPress} />
      </AppBottomSheet>
    </TitledSection>
  );
}
