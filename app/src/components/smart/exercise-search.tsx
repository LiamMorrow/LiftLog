import { NativeButton } from '@/components/presentation/foundation/native-button';
import AddIcon from '@expo/material-symbols/add.xml';
import ExerciseFilterer from '@/components/presentation/workout-editor/exercise-filterer';
import { spacing } from '@/hooks/useAppTheme';
import { useHeaderInset } from '@/hooks/useHeaderInset';
import { ExerciseDescriptor } from '@/models/exercise-models';
import { useAppSelector, useAppSelectorWithArg } from '@/store';
import { setExerciseSearchResult } from '@/store/app';
import { selectExerciseById, selectExerciseIds, updateExercise } from '@/store/stored-sessions';
import { uuid } from '@/utils/uuid';
import { LegendList } from '@legendapp/list/react-native';
import { useTranslate } from '@tolgee/react';
import { Stack, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { ListItem } from '@/components/presentation/foundation/list-item';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';

export function ExerciseSearch(props: { requestId: string; exerciseName: string }) {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const { dismiss } = useRouter();
  const exerciseIds = useAppSelector(selectExerciseIds);
  const [filteredExerciseIds, setFilteredExerciseIds] = useState(exerciseIds);
  const [suggestedNewExercise, setSuggestedNewExercise] = useState<ExerciseDescriptor | 'NONE'>('NONE');

  const exerciseListItems = useMemo(
    () => ['filter', suggestedNewExercise, ...filteredExerciseIds] as const,
    [filteredExerciseIds, suggestedNewExercise],
  );

  const onSelect = (exercise: ExerciseDescriptor) => {
    dispatch(setExerciseSearchResult({ requestId: props.requestId, exercise }));
    dismiss();
  };

  const headerInset = useHeaderInset();

  return (
    <SafeAreaView
      edges={{ left: 'additive', right: 'additive', top: 'off', bottom: 'additive' }}
      style={{ flex: 1, paddingTop: headerInset }}
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
  const dispatch = useDispatch();
  return (
    <View style={{ padding: spacing.pageHorizontalMargin }}>
      <NativeButton
        variant="outlined"
        icon={AddIcon}
        systemImage="plus"
        label={`Add ${props.exercise.name}`}
        onPress={() => {
          dispatch(updateExercise({ id: uuid(), exercise: props.exercise }));
          props.onPress(props.exercise);
        }}
      />
    </View>
  );
}
