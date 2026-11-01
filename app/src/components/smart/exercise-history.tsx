import { AppText } from '@/components/presentation/foundation/app-text';
import { ExerciseHistoryList } from '@/components/presentation/workout/exercise-history-list';
import { spacing } from '@/hooks/useAppTheme';
import { ExerciseBlueprint, MovementKey } from '@/models/blueprint-models';
import { readExerciseHistory } from '@/db/sessions';
import { useSessionsQuery } from '@/hooks/useSessionsQuery';
import { Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export function getExerciseHistoryHref(blueprint: Pick<ExerciseBlueprint, 'name' | 'type'>): Href {
  return `/exercise-history?name=${encodeURIComponent(blueprint.name)}&type=${blueprint.type}`;
}

export function ExerciseHistory(props: { movementKey: MovementKey; exerciseName: string }) {
  const exercises = useSessionsQuery((db) => readExerciseHistory(db, props.movementKey), props.movementKey) ?? [];

  return (
    <SafeAreaView edges={{ left: 'additive', right: 'additive', top: 'off', bottom: 'off' }} style={{ flex: 1 }}>
      <AppText
        variant="titleLarge"
        numberOfLines={1}
        style={{ paddingHorizontal: spacing.pageHorizontalMargin, paddingTop: spacing.pageVerticalMargin }}
      >
        {props.exerciseName}
      </AppText>
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
