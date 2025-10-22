import AppBottomSheet from '@/components/presentation/app-bottom-sheet';
import EditableIncrementer from '@/components/presentation/editable-incrementer';
import ExerciseFilterer from '@/components/presentation/exercise-filterer';
import FixedIncrementer from '@/components/presentation/fixed-incrementer';
import ListSwitch from '@/components/presentation/list-switch';
import RestEditorGroup from '@/components/presentation/rest-editor-group';
import { spacing } from '@/hooks/useAppTheme';
import { ExerciseBlueprint } from '@/models/session-models';
import { RootState, useAppSelector, useAppSelectorWithArg } from '@/store';
import { showSnackbar } from '@/store/app';
import { useDispatch } from 'react-redux';
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
import { Image, Keyboard, View } from 'react-native';
import { Button, Card, Divider, IconButton, List, TextInput } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';

interface ExerciseEditorProps {
  exercise: ExerciseBlueprint;
  updateExercise: (ex: ExerciseBlueprint) => void;
}

export function ExerciseEditor(props: ExerciseEditorProps) {
  const dispatch = useDispatch();
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

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      dispatch(showSnackbar({ text: 'Permission to access media library is required!' }));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      updateExercise({ imageUri: result.assets[0].uri });
    }
  };

  const removeImage = () => {
    const updated = exercise.toPOJO();
    delete updated.imageUri;
    updateExercise(ExerciseBlueprint.fromPOJO(updated));
  };

  const setExerciseWeightIncrease = (weightIncreaseOnSuccess: BigNumber) =>
    updateExercise({ weightIncreaseOnSuccess });

  const selectExerciseFromSearch = (ex: ExerciseDescriptor) => {
    updateExercise({ 
      name: ex.name, 
      notes: ex.instructions,
      ...(ex.imageUri !== undefined && { imageUri: ex.imageUri }),
    });
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
        {exercise.imageUri ? (
          <>
            <Card mode="elevated" style={{ overflow: 'hidden' }} elevation={2}>
              <Image
                source={{ uri: exercise.imageUri }}
                style={{ width: '100%', height: 220 }}
                resizeMode="contain"
              />
            </Card>
            <View style={{ flexDirection: 'row', gap: spacing[2] }}>
              <Button
                mode="outlined"
                onPress={pickImage}
                icon="image-edit"
                style={{ flex: 1 }}
              >
                Change Image
              </Button>
              <IconButton
                icon="delete"
                mode="outlined"
                onPress={removeImage}
              />
            </View>
          </>
        ) : (
          <Button
            mode="contained"
            onPress={pickImage}
            icon="image-plus"
          >
            Add Exercise Image
          </Button>
        )}
      </View>

      <View style={{ gap: spacing[2] }}>
        <EditableIncrementer
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
