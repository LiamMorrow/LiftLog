import AppBottomSheet from '@/components/presentation/app-bottom-sheet';
import EditableIncrementer from '@/components/presentation/editable-incrementer';
import ExerciseFilterer from '@/components/presentation/exercise-filterer';
import FixedIncrementer from '@/components/presentation/fixed-incrementer';
import ListSwitch from '@/components/presentation/list-switch';
import RestEditorGroup from '@/components/presentation/rest-editor-group';
import { spacing } from '@/hooks/useAppTheme';
import { ExerciseBlueprint } from '@/models/blueprint-models';
import { RootState, useAppSelector, useAppSelectorWithArg } from '@/store';
import {
  ExerciseDescriptor,
  selectExerciseById,
  selectExerciseIds,
} from '@/store/stored-sessions';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { FlashList } from '@shopify/flash-list';
import { useTranslate } from '@tolgee/react';
import BigNumber from 'bignumber.js';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, View } from 'react-native';
import { Card, Divider, List, TextInput } from 'react-native-paper';

interface ExerciseEditorProps {
  exercise: ExerciseBlueprint;
  updateExercise: (ex: ExerciseBlueprint) => void;
}

export function ExerciseEditor(props: ExerciseEditorProps) {
  const exerciseIds = useAppSelector(selectExerciseIds);
  const { exercise: propsExercise, updateExercise: updatePropsExercise } =
    props;
  const [exercise, setExercise] = useState(propsExercise);
  const { t } = useTranslate();
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Bit of a hack to let us update exercise immediately without going through the whole props loop
  useEffect(() => {
    setExercise(propsExercise);
  }, [propsExercise]);
  const updateExercise = (ex: Partial<ExerciseBlueprint>) => {
    const update = ExerciseBlueprint.fromPOJO({ ...exercise.toPOJO(), ...ex });
    setExercise(update);
    updatePropsExercise(update);
  };
  const useImperialUnits = useAppSelector(
    (s: RootState) => s.settings.useImperialUnits,
  );
  const weightSuffix = useImperialUnits ? 'lb' : 'kg';

  const incrementSets = () => updateExercise({ sets: exercise.sets + 1 });

  const decrementSets = () =>
    updateExercise({ sets: Math.max(exercise.sets - 1, 0) });

  const incrementReps = () =>
    updateExercise({ repsPerSet: exercise.repsPerSet + 1 });

  const decrementReps = () =>
    updateExercise({ repsPerSet: Math.max(exercise.repsPerSet - 1, 0) });

  const setExerciseNotes = (notes: string) => updateExercise({ notes });

  const setExerciseLink = (link: string) => updateExercise({ link });

  const setExerciseWeightIncrease = (weightIncreaseOnSuccess: BigNumber) =>
    updateExercise({ weightIncreaseOnSuccess });

  const selectExerciseFromSearch = (ex: ExerciseDescriptor) => {
    updateExercise({ name: ex.name, notes: ex.instructions });
    bottomSheetRef.current?.close();
  };

  const [bottomSheetShown, setBottomSheetShown] = useState(false);
  const [filteredExerciseIds, setFilteredExerciseIds] = useState(exerciseIds);
  const exerciseListItems = useMemo(
    () => ['filter', ...filteredExerciseIds],
    [filteredExerciseIds],
  );

  return (
    <View style={{ gap: spacing[2] }}>
      <TextInput
        label={t('Exercise')}
        testID="exercise-name"
        style={{ marginBottom: spacing[2] }}
        value={exercise.name}
        onChangeText={(name) => updateExercise({ name })}
        selectTextOnFocus={true}
        right={
          <TextInput.Icon
            icon="search"
            onPress={() => {
              setBottomSheetShown(true);
              Keyboard.dismiss();
              bottomSheetRef.current?.expand();
            }}
          />
        }
      />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          width: '100%',
          gap: spacing[4],
        }}
      >
        <Card
          style={{
            flexGrow: 1,
            flex: 1,
            paddingVertical: spacing[5],
            justifyContent: 'center',
          }}
          mode="contained"
        >
          <Card.Content>
            <FixedIncrementer
              label={t('Sets')}
              increment={incrementSets}
              decrement={decrementSets}
              value={exercise.sets}
              testID="exercise-sets"
            />
          </Card.Content>
        </Card>
        <Card
          style={{
            flexGrow: 1,
            flex: 1,
            paddingVertical: spacing[5],
            justifyContent: 'center',
          }}
          mode="contained"
        >
          <Card.Content>
            <FixedIncrementer
              label={t('Reps')}
              increment={incrementReps}
              decrement={decrementReps}
              value={exercise.repsPerSet}
              testID="exercise-reps"
            />
          </Card.Content>
        </Card>
      </View>

      <TextInput
        label={t('PlanNotes')}
        testID="exercise-notes"
        style={{ marginBottom: spacing[2] }}
        value={exercise.notes}
        onChangeText={setExerciseNotes}
        multiline
      />

      <TextInput
        label={t('ExternalLink')}
        testID="exercise-link"
        style={{ marginBottom: spacing[2] }}
        placeholder="https://"
        value={exercise.link}
        onChangeText={setExerciseLink}
      />

      <View style={{ gap: spacing[2] }}>
        <EditableIncrementer
          increment={new BigNumber('0.1')}
          label={t('ProgressiveOverload')}
          testID="exercise-auto-increase"
          suffix={weightSuffix}
          value={exercise.weightIncreaseOnSuccess}
          onChange={setExerciseWeightIncrease}
        />
        <Divider />
        <View style={{ width: '100%' }}>
          <ListSwitch
            headline={t('SupersetNextExercise')}
            value={exercise.supersetWithNext}
            supportingText=""
            testID="exercise-superset"
            onValueChange={(supersetWithNext) =>
              updateExercise({ supersetWithNext })
            }
          />
        </View>
        <Divider />
        <RestEditorGroup
          rest={exercise.restBetweenSets}
          onRestUpdated={(restBetweenSets) =>
            updateExercise({ restBetweenSets })
          }
        />
      </View>
      <AppBottomSheet
        index={-1}
        sheetRef={bottomSheetRef}
        enablePanDownToClose
        enableDynamicSizing={false}
      >
        {bottomSheetShown && (
          <FlashList
            data={exerciseListItems}
            // @ts-expect-error -- It does work - see:https://github.com/gorhom/react-native-bottom-sheet/issues/1120#issuecomment-1582872948
            renderScrollComponent={BottomSheetScrollView}
            getItemType={(_, index) => (index === 0 ? 'filters' : 'exercise')}
            keyExtractor={(item, index) => (index === 0 ? 'filters' : item)}
            renderItem={(i) => {
              if (i.index === 0) {
                return (
                  <ExerciseFilterer
                    onFilteredExerciseIdsChange={setFilteredExerciseIds}
                  />
                );
              }
              return (
                <ExerciseSearchListItem
                  exerciseId={i.item}
                  onPress={selectExerciseFromSearch}
                />
              );
            }}
          />
        )}
      </AppBottomSheet>
    </View>
  );
}

function ExerciseSearchListItem(props: {
  exerciseId: string;
  onPress: (exercise: ExerciseDescriptor) => void;
}) {
  const exercise = useAppSelectorWithArg(selectExerciseById, props.exerciseId);
  return (
    <List.Item title={exercise.name} onPress={() => props.onPress(exercise)} />
  );
}
