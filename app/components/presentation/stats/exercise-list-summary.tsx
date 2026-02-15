import AppBottomSheet from '@/components/presentation/foundation/app-bottom-sheet';
import Button from '@/components/presentation/foundation/gesture-wrappers/button';
import { SegmentedList } from '@/components/presentation/foundation/segmented-list';
import { TitledSection } from '@/components/presentation/stats/titled-section';
import { WeightedExerciseListSearcher } from '@/components/presentation/stats/weighted-exercise-list-searcher';
import { WeightedExerciseStatSummary } from '@/components/presentation/stats/weighted-exercise-stat-summary';
import { useAppTheme } from '@/hooks/useAppTheme';
import {
  GranularStatisticView,
  WeightedExerciseStatistics,
} from '@/store/stats';
import BottomSheet from '@gorhom/bottom-sheet';
import { useTranslate } from '@tolgee/react';
import { useRouter } from 'expo-router';
import Enumerable from 'linq';
import { useRef } from 'react';

export function ExerciseListSummary(props: { stats: GranularStatisticView }) {
  const { push } = useRouter();
  const { colors } = useAppTheme();
  const { t } = useTranslate();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const topWeightedExercises = Enumerable.from(
    props.stats.weightedExerciseStats,
  )
    .take(5)
    .toArray();
  const onItemPress = (item: WeightedExerciseStatistics) => {
    bottomSheetRef.current?.close();
    push(
      `/(tabs)/stats/expanded-weighted-exercise?exerciseName=${encodeURIComponent(item.exerciseName)}`,
    );
  };
  return (
    <TitledSection
      title={t('stats.weighted_exercise_list.title')}
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
        items={topWeightedExercises}
        onItemPress={onItemPress}
        renderItem={(item) => (
          <WeightedExerciseStatSummary exerciseStats={item} />
        )}
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
        <WeightedExerciseListSearcher
          stats={props.stats}
          onItemPress={onItemPress}
        />
      </AppBottomSheet>
    </TitledSection>
  );
}
