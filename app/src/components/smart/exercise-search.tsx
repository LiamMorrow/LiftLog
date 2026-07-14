import Button from '@/components/presentation/foundation/gesture-wrappers/button';
import ExerciseFilterer from '@/components/presentation/workout-editor/exercise-filterer';
import { spacing } from '@/hooks/useAppTheme';
import { ExerciseDescriptor } from '@/models/exercise-models';
import { useAppSelector, useAppSelectorWithArg } from '@/store';
import { setExerciseSearchResult } from '@/store/app';
import { selectExerciseById, selectExerciseIds, updateExercise } from '@/store/stored-sessions';
import { uuid } from '@/utils/uuid';
import { LegendList } from '@legendapp/list';
import { useTranslate } from '@tolgee/react';
import { Stack, useRouter } from 'expo-router';
import { HeaderHeightContext } from 'expo-router/react-navigation';
import { useContext, useMemo, useState } from 'react';
import { Platform, View } from 'react-native';
import { List } from 'react-native-paper';
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

  const headerHeight = useContext(HeaderHeightContext); // Intentionally don't use useHeaderHeight as it might not be in a stack
  const topInsetHeight = Platform.select({ ios: headerHeight }) ?? 0;

  return (
    <View style={{ flex: 1, insetBlockStart: topInsetHeight }}>
      <Stack.Screen options={{ title: t('generic.search.button') }} />
      <LegendList
        data={exerciseListItems}
        getItemType={(_, index) => (index === 0 ? 'filters' : index === 1 ? 'suggest' : 'exercise')}
        keyExtractor={(item, index) => (index === 0 ? 'filters' : index === 1 ? 'suggest' : (item as string))}
        renderItem={(i) => {
          if (i.index === 0) {
            return (
              <ExerciseFilterer
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
    </View>
  );
}

function ExerciseIdSearchListItem(props: { exerciseId: string; onPress: (exercise: ExerciseDescriptor) => void }) {
  const exercise = useAppSelectorWithArg(selectExerciseById, props.exerciseId);
  if (!exercise) {
    return <List.Item title={'Unknown'} />;
  }
  return <List.Item title={exercise.name} onPress={() => props.onPress(exercise)} />;
}

function SuggestedExerciseSearchListItem(props: {
  exercise: ExerciseDescriptor;
  onPress: (exercise: ExerciseDescriptor) => void;
}) {
  const dispatch = useDispatch();
  return (
    <View style={{ padding: spacing.pageHorizontalMargin }}>
      <Button
        icon={'plus'}
        mode="outlined"
        onPress={() => {
          dispatch(updateExercise({ id: uuid(), exercise: props.exercise }));
          props.onPress(props.exercise);
        }}
      >
        Add {props.exercise.name}
      </Button>
    </View>
  );
}
