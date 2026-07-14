import Button from '@/components/presentation/foundation/gesture-wrappers/button';
import { SegmentedList } from '@/components/presentation/foundation/segmented-list';
import { TitledSection } from '@/components/presentation/stats/titled-section';
import { WeightedExerciseStatSummary } from '@/components/presentation/stats/weighted-exercise-stat-summary';
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
      titleRight={
        <Button mode="text" onPress={() => push('/stats/exercise-list')} style={{ alignSelf: 'flex-end' }}>
          {t('stats.see_more.button')}
        </Button>
      }
    >
      <SegmentedList
        items={topWeightedExercises}
        renderItem={(item) => <WeightedExerciseStatSummary onPress={onItemPress} exerciseStats={item} />}
      />
    </TitledSection>
  );
}
