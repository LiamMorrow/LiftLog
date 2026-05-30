import AppBottomSheet from '@/components/presentation/foundation/app-bottom-sheet';
import Button from '@/components/presentation/foundation/gesture-wrappers/button';
import ExerciseFilterer from '@/components/presentation/workout-editor/exercise-filterer';
import { spacing } from '@/hooks/useAppTheme';
import { ExerciseBlueprint } from '@/models/blueprint-models';
import { ExerciseDescriptor } from '@/models/exercise-models';
import { useAppSelector, useAppSelectorWithArg } from '@/store';
import {
  selectExerciseById,
  selectExerciseIds,
  updateExercise,
} from '@/store/stored-sessions';
import { uuid } from '@/utils/uuid';
import BottomSheet, {
  useBottomSheetScrollableCreator,
} from '@gorhom/bottom-sheet';
import { LegendList } from '@legendapp/list';
import { useMemo, useRef, useState } from 'react';
import { Keyboard, View } from 'react-native';
import { List } from 'react-native-paper';
import { useDispatch } from 'react-redux';

interface ExerciseSearcherProps {
  currentExercise: ExerciseBlueprint;
  onSelectExercise: (e: ExerciseDescriptor) => void;
}

export function ExerciseSearcher({
  currentExercise,
  onSelectExercise,
}: ExerciseSearcherProps) {
  const [open, setOpen] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const BottomSheetScrollView = useBottomSheetScrollableCreator();
  const exerciseIds = useAppSelector(selectExerciseIds);
  const [filteredExerciseIds, setFilteredExerciseIds] = useState(exerciseIds);
  const [suggestedNewExercise, setSuggestedNewExercise] = useState<
    ExerciseDescriptor | 'NONE'
  >('NONE');

  const exerciseListItems = useMemo(
    () => ['filter', suggestedNewExercise, ...filteredExerciseIds] as const,
    [filteredExerciseIds, suggestedNewExercise],
  );

  const onSelect = (exercise: ExerciseDescriptor) => {
    setFilteredExerciseIds(exerciseIds);
    setSuggestedNewExercise('NONE');
    onSelectExercise(exercise);
    setOpen(false);
  };
  return (
    <>
      <Button
        icon={'contentPasteSearch'}
        mode="contained"
        onPress={() => {
          setOpen(true);
          Keyboard.dismiss();
          bottomSheetRef.current?.expand();
        }}
      >
        {currentExercise.name}
      </Button>
      <AppBottomSheet
        index={-1}
        sheetRef={bottomSheetRef}
        enablePanDownToClose
        enableDynamicSizing={false}
      >
        {open && (
          <LegendList
            data={exerciseListItems}
            renderScrollComponent={BottomSheetScrollView}
            getItemType={(_, index) =>
              index === 0 ? 'filters' : index === 1 ? 'suggest' : 'exercise'
            }
            keyExtractor={(item, index) =>
              index === 0
                ? 'filters'
                : index === 1
                  ? 'suggest'
                  : (item as string)
            }
            renderItem={(i) => {
              if (i.index === 0) {
                return (
                  <ExerciseFilterer
                    onSuggestedNewExercise={setSuggestedNewExercise}
                    onFilteredExerciseIdsChange={setFilteredExerciseIds}
                  />
                );
              }
              if (i.index === 1) {
                return i.item !== 'NONE' ? (
                  <SuggestedExerciseSearchListItem
                    exercise={i.item as ExerciseDescriptor}
                    onPress={onSelect}
                  />
                ) : undefined;
              }
              return (
                <ExerciseIdSearchListItem
                  exerciseId={i.item as string}
                  onPress={onSelect}
                />
              );
            }}
          />
        )}
      </AppBottomSheet>
    </>
  );
}
function ExerciseIdSearchListItem(props: {
  exerciseId: string;
  onPress: (exercise: ExerciseDescriptor) => void;
}) {
  const exercise = useAppSelectorWithArg(selectExerciseById, props.exerciseId);
  return (
    <List.Item title={exercise.name} onPress={() => props.onPress(exercise)} />
  );
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
