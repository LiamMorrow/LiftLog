import { NativeButton } from '@/components/presentation/foundation/native-button';
import { SegmentedList } from '@/components/presentation/foundation/segmented-list';
import { TitledSection } from '@/components/presentation/foundation/titled-section';
import { WeightedExerciseStatSummary } from '@/components/presentation/stats/weighted-exercise-stat-summary';
import { spacing } from '@/hooks/useAppTheme';
import { GranularStatisticView, WeightedExerciseStatistics } from '@/store/stats';
import { useTranslate } from '@tolgee/react';
import { useRouter } from 'expo-router';
import Enumerable from 'linq';

export function ExerciseListSummary(props: { stats: GranularStatisticView }) {
  const { push } = useRouter();
  const { t } = useTranslate();
  const topWeightedExercises = Enumerable.from(props.stats.weightedExerciseStats).take(5).toArray();
  const onItemPress = (item: WeightedExerciseStatistics) => {
    push(`/stats/expanded-weighted-exercise?exerciseName=${encodeURIComponent(item.exerciseName)}`);
  };
  return (
    <TitledSection
      title={t('stats.weighted_exercise_list.title')}
      style={{ marginHorizontal: spacing.pageHorizontalMargin }}
      trailing={
        <NativeButton
          variant="text"
          style={{ alignSelf: 'flex-end' }}
          label={t('stats.see_more.button')}
          onPress={() => push('/stats/exercise-list')}
        />
      }
    >
      <SegmentedList
        items={topWeightedExercises}
        renderItem={(item) => <WeightedExerciseStatSummary onPress={onItemPress} exerciseStats={item} />}
      />
    </TitledSection>
  );
}
