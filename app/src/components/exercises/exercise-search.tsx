import { NativeButton } from '@/components/foundation/native-button';
import AddIcon from '@expo/material-symbols/add.xml';
import ExerciseFilterer from '@/components/exercises/exercise-filterer';
import { spacing } from '@/hooks/useAppTheme';
import { useHeaderInset } from '@/hooks/useHeaderInset';
import { ExerciseDescriptor } from '@/models/exercise-models';
import { useAppSelector, useAppSelectorWithArg } from '@/store';
import { selectExerciseById, selectExerciseIds } from '@/store/stored-sessions';
import { LegendList } from '@legendapp/list/react-native';
import { useTranslate } from '@tolgee/react';
import { Stack, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Keyboard, View } from 'react-native';
import { ListItem } from '@/components/foundation/list-item';
import { SafeAreaView } from 'react-native-safe-area-context';

export function ExerciseSearch(props: { requestId: string; exerciseName: string }) {
  const { t } = useTranslate();
  const { push } = useRouter();
  const exerciseIds = useAppSelector(selectExerciseIds);
  const [filteredExerciseIds, setFilteredExerciseIds] = useState(exerciseIds);
  const [suggestedNewExercise, setSuggestedNewExercise] = useState<ExerciseDescriptor | 'NONE'>('NONE');

  const exerciseListItems = useMemo(
    () => ['filter', suggestedNewExercise, ...filteredExerciseIds] as const,
    [filteredExerciseIds, suggestedNewExercise],
  );

  const onSelect = (exercise: ExerciseDescriptor) => {
    Keyboard.dismiss();
    push({
      pathname: '/exercise-variation',
      params: { requestId: props.requestId, exercise: JSON.stringify(exercise) },
    });
  };

  const headerInset = useHeaderInset();

  return (
    <SafeAreaView
      edges={{ left: 'additive', right: 'additive', top: 'off', bottom: 'additive' }}
      style={{ flex: 1, paddingTop: headerInset + spacing.pageVerticalMargin }}
    >
      <Stack.Screen options={{ title: t('generic.search.button') }} />
      <LegendList
        data={exerciseListItems}
        getItemType={(_, index) => (index === 0 ? 'filters' : index === 1 ? 'suggest' : 'exercise')}
        keyExtractor={(item, index) => (index === 0 ? 'filters' : index === 1 ? 'suggest' : (item as string))}
        renderItem={(i) => {
          if (i.index === 0) {
            return (
              <ExerciseFilterer
                autoFocus
                exerciseName={props.exerciseName}
                onSuggestedNewExercise={setSuggestedNewExercise}
                onFilteredExerciseIdsChange={setFilteredExerciseIds}
              />
            );
          }
          if (i.index === 1) {
            return i.item !== 'NONE' ? (
              <SuggestedExerciseSearchListItem exercise={i.item as ExerciseDescriptor} onPress={onSelect} />
            ) : undefined;
          }
          return <ExerciseIdSearchListItem exerciseId={i.item as string} onPress={onSelect} />;
        }}
      />
    </SafeAreaView>
  );
}

function ExerciseIdSearchListItem(props: { exerciseId: string; onPress: (exercise: ExerciseDescriptor) => void }) {
  const exercise = useAppSelectorWithArg(selectExerciseById, props.exerciseId);
  if (!exercise) {
    return <ListItem title={'Unknown'} />;
  }
  return <ListItem title={exercise.name} onPress={() => props.onPress(exercise)} />;
}

function SuggestedExerciseSearchListItem(props: {
  exercise: ExerciseDescriptor;
  onPress: (exercise: ExerciseDescriptor) => void;
}) {
  return (
    <View style={{ padding: spacing.pageHorizontalMargin }}>
      <NativeButton
        variant="outlined"
        icon={AddIcon}
        systemImage="plus"
        label={`Add ${props.exercise.name}`}
        onPress={() => props.onPress(props.exercise)}
      />
    </View>
  );
}
