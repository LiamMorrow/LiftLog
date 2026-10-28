import Button from '@/components/presentation/foundation/button';
import { SegmentedList } from '@/components/presentation/foundation/segmented-list';
import { TitledSection } from '@/components/presentation/stats/titled-section';
import { WorkoutStatSummary } from '@/components/presentation/stats/workout-stat-summary';
import { GranularStatisticView, WorkoutExerciseStatistics } from '@/store/stats';
import { useTranslate } from '@tolgee/react';
import { useRouter } from 'expo-router';
import Enumerable from 'linq';

export function WorkoutListSummary(props: { stats: GranularStatisticView }) {
  const { push } = useRouter();
  const { t } = useTranslate();
  const topWorkouts = Enumerable.from(props.stats.workoutExerciseStats).take(5).toArray();
  const onItemPress = (item: WorkoutExerciseStatistics) => {
    push(`/stats/expanded-workout?workoutName=${encodeURIComponent(item.workoutName)}`);
  };
  return (
    <TitledSection
      title={t('stats.workout_list.title')}
      titleRight={
        <Button mode="text" onPress={() => push('/stats/workout-list')} style={{ alignSelf: 'flex-end' }}>
          {t('stats.see_more.button')}
        </Button>
      }
    >
      <SegmentedList
        items={topWorkouts}
        renderItem={(item) => <WorkoutStatSummary onPress={onItemPress} workoutStats={item} />}
      />
    </TitledSection>
  );
}
