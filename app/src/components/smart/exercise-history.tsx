import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import { ExerciseHistoryList } from '@/components/presentation/workout/exercise-history-list';
import { spacing } from '@/hooks/useAppTheme';
import { ExerciseBlueprint, MovementKey } from '@/models/blueprint-models';
import { useAppSelectorWithArg } from '@/store';
import { selectRecentlyCompletedExercises } from '@/store/stored-sessions';
import { Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export function getExerciseHistoryHref(blueprint: ExerciseBlueprint): Href {
  return `/exercise-history?name=${encodeURIComponent(blueprint.name)}&type=${blueprint.type}` as Href;
}

export function ExerciseHistory(props: { movementKey: MovementKey; exerciseName: string }) {
  // No session to exclude: this sheet is opened from an exercise, and shows the whole lineage.
  const exercises = useAppSelectorWithArg(selectRecentlyCompletedExercises, undefined)(props.movementKey);

  return (
    <SafeAreaView edges={{ left: 'additive', right: 'additive', top: 'off', bottom: 'off' }} style={{ flex: 1 }}>
      <SurfaceText
        font="text-xl"
        weight="bold"
        numberOfLines={1}
        style={{ paddingHorizontal: spacing.pageHorizontalMargin, paddingTop: spacing[3] }}
      >
        {props.exerciseName}
      </SurfaceText>
      <ExerciseHistoryList
        exercises={exercises}
        contentContainerStyle={{
          paddingHorizontal: spacing.pageHorizontalMargin,
          paddingTop: spacing[2],
          paddingBottom: spacing[8],
        }}
      />
    </SafeAreaView>
  );
}
