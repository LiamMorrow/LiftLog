import AppBottomSheet from '@/components/presentation/app-bottom-sheet';
import DurationEditor from '@/components/presentation/duration-editor';
import EditableIncrementer from '@/components/presentation/editable-incrementer';
import ExerciseFilterer from '@/components/presentation/exercise-filterer';
import FixedIncrementer from '@/components/presentation/fixed-incrementer';
import LabelledForm from '@/components/presentation/labelled-form';
import LabelledFormRow from '@/components/presentation/labelled-form-row';
import ListSwitch from '@/components/presentation/list-switch';
import RestEditorGroup from '@/components/presentation/rest-editor-group';
import SelectButton from '@/components/presentation/select-button';
import { spacing } from '@/hooks/useAppTheme';
import {
  CardioExerciseBlueprint,
  CardioTarget,
  DistanceCardioTarget,
  DistanceUnits,
  ExerciseBlueprint,
  TimeCardioTarget,
  WeightedExerciseBlueprint,
} from '@/models/blueprint-models';
import { useAppSelector, useAppSelectorWithArg } from '@/store';
import {
  ExerciseDescriptor,
  selectExerciseById,
  selectExerciseIds,
} from '@/store/stored-sessions';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Duration } from '@js-joda/core';
import { FlashList } from '@shopify/flash-list';
import { useTranslate } from '@tolgee/react';
import BigNumber from 'bignumber.js';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, View } from 'react-native';
import { Card, List, SegmentedButtons, TextInput } from 'react-native-paper';
import { match, P } from 'ts-pattern';

interface ExerciseEditorProps {
  exercise: ExerciseBlueprint;
  updateExercise: (ex: ExerciseBlueprint) => void;
}
const distanceUnitOptions = DistanceUnits.map((value) => ({
  value,
  label: value + 's',
}));
export function ExerciseEditor(props: ExerciseEditorProps) {
  const exerciseIds = useAppSelector(selectExerciseIds);
  const bottomSheetRef = useRef<BottomSheet>(null);
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
  const { t } = useTranslate();
  const { exercise: propsExercise, updateExercise: updatePropsExercise } =
    props;
  const [exercise, setExercise] = useState(propsExercise);

  // Bit of a hack to let us update exercise immediately without going through the whole props loop
  useEffect(() => {
    setExercise(propsExercise);
  }, [propsExercise]);
  const updateExercise = (ex: Partial<ExerciseBlueprint>) => {
    const update = exercise.with(ex);
    setExercise(update);
    updatePropsExercise(update);
  };

  const handleTypeChange = (type: string) => {
    let newExercise = exercise;
    if (type === 'weighted') {
      newExercise = WeightedExerciseBlueprint.empty().with(exercise);
    } else {
      newExercise = CardioExerciseBlueprint.empty().with(exercise);
    }
    setExercise(newExercise);
    updatePropsExercise(newExercise);
  };

  const exerciseEditor = match(exercise)
    .with(P.instanceOf(WeightedExerciseBlueprint), (e) => (
      <WeightedExerciseEditor exercise={e} updateExercise={updateExercise} />
    ))
    .with(P.instanceOf(CardioExerciseBlueprint), (e) => (
      <CardioExerciseEditor exercise={e} updateExercise={updateExercise} />
    ))
    .exhaustive();

  return (
    <View style={{ gap: spacing[4] }}>
      <LabelledForm>
        <LabelledFormRow label={t('exercise.name.label')} icon="infoFill">
          <TextInput
            testID="exercise-name"
            mode="outlined"
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
        </LabelledFormRow>
        <LabelledFormRow
          label={t('exercise.type.label')}
          icon={'fitnessCenterFill'}
        >
          <SegmentedButtons
            value={
              exercise instanceof WeightedExerciseBlueprint
                ? 'weighted'
                : 'cardio'
            }
            buttons={[
              {
                value: 'weighted',
                label: 'Weighted',
                icon: 'fitnessCenter',
                testID: 'weighted-button',
              },
              {
                value: 'cardio',
                label: 'Cardio/Time',
                icon: 'directionsRun',
                testID: 'cardio-button',
              },
            ]}
            onValueChange={handleTypeChange}
          />
        </LabelledFormRow>
        {exerciseEditor}
      </LabelledForm>
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

function CardioExerciseEditor({
  exercise,
  updateExercise,
}: {
  exercise: CardioExerciseBlueprint;
  updateExercise: (ex: Partial<ExerciseBlueprint>) => void;
}) {
  const { t } = useTranslate();
  return (
    <>
      <CardioTargetEditor
        target={exercise.target}
        onValueChange={(target) => updateExercise({ target })}
      />
      <SharedFieldsEditor exercise={exercise} updateExercise={updateExercise} />

      <List.Section>
        <ListSwitch
          value={exercise.trackDuration || exercise.target.type === 'time'}
          onValueChange={(trackDuration) => updateExercise({ trackDuration })}
          headline={t('exercise.track_time.label')}
          disabled={exercise.target.type === 'time'}
        />
        <ListSwitch
          value={exercise.trackDistance || exercise.target.type === 'distance'}
          onValueChange={(trackDistance) => updateExercise({ trackDistance })}
          headline={t('exercise.track_distance.label')}
          disabled={exercise.target.type === 'distance'}
        />
        <ListSwitch
          value={exercise.trackResistance}
          onValueChange={(trackResistance) =>
            updateExercise({ trackResistance })
          }
          headline={t('exercise.track_resistance.label')}
        />
        <ListSwitch
          value={exercise.trackIncline}
          onValueChange={(trackIncline) => updateExercise({ trackIncline })}
          headline={t('exercise.track_incline.label')}
        />
      </List.Section>
    </>
  );
}

function SharedFieldsEditor({
  exercise,
  updateExercise,
}: {
  exercise: ExerciseBlueprint;
  updateExercise: (ex: Partial<ExerciseBlueprint>) => void;
}) {
  const { t } = useTranslate();
  return (
    <>
      <LabelledFormRow label={t('plan.notes.label')} icon="notesFill">
        <TextInput
          mode="outlined"
          testID="exercise-notes"
          style={{ marginBottom: spacing[2] }}
          value={exercise.notes}
          onChangeText={(notes) => updateExercise({ notes })}
          multiline
        />
      </LabelledFormRow>
      <LabelledFormRow
        label={t('generic.external_link.label')}
        icon="publicFill"
      >
        <TextInput
          mode="outlined"
          testID="exercise-link"
          style={{ marginBottom: spacing[2] }}
          placeholder="https://"
          value={exercise.link}
          onChangeText={(link) => updateExercise({ link })}
        />
      </LabelledFormRow>
    </>
  );
}

function CardioTargetEditor(props: {
  target: CardioTarget;
  onValueChange: (t: CardioTarget) => void;
}) {
  const useImperialUnits = useAppSelector((x) => x.settings.useImperialUnits);
  const { target, onValueChange } = props;
  const { t } = useTranslate();
  const handleTypeChange = (type: string) => {
    if (type === target.type) {
      return;
    }
    if (type === 'distance') {
      onValueChange({
        type: 'distance',
        value: {
          unit: useImperialUnits ? 'mile' : 'metre',
          value: BigNumber(useImperialUnits ? 2.5 : 5000),
        },
      });
    } else {
      onValueChange({
        type: 'time',
        value: Duration.ofMinutes(30),
      });
    }
  };
  return (
    <>
      <LabelledFormRow
        label={t('exercise.cardio_target.label')}
        icon={'targetFill'}
      >
        <SegmentedButtons
          value={target.type}
          onValueChange={handleTypeChange}
          buttons={[
            {
              value: 'distance',
              label: t('exercise.distance.label'),
              icon: 'trailLength',
              testID: 'distance-button',
            },
            {
              value: 'time',
              label: t('generic.time.label'),
              icon: 'timer',
              testID: 'time-button',
            },
          ]}
        />
      </LabelledFormRow>

      {match(target)
        .with({ type: 'distance' }, (t) => (
          <DistanceTargetEditor target={t} onValueChange={onValueChange} />
        ))
        .with({ type: 'time' }, (t) => (
          <TimeTargetEditor target={t} onValueChange={onValueChange} />
        ))
        .exhaustive()}
    </>
  );
}

function DistanceTargetEditor(props: {
  target: DistanceCardioTarget;
  onValueChange: (t: DistanceCardioTarget) => void;
}) {
  const { target, onValueChange } = props;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <View style={{ flex: 1 }}>
        <EditableIncrementer
          onChange={(value) =>
            onValueChange({ ...target, value: { ...target.value, value } })
          }
          disallowNegative
          value={props.target.value.value}
        />
      </View>

      <SelectButton
        testID="setDistanceUnit"
        value={target.value.unit}
        options={distanceUnitOptions}
        onChange={(unit) =>
          onValueChange({ ...target, value: { ...target.value, unit } })
        }
      />
    </View>
  );
}

function TimeTargetEditor(props: {
  target: TimeCardioTarget;
  onValueChange: (t: TimeCardioTarget) => void;
}) {
  return (
    <DurationEditor
      duration={props.target.value}
      showHours
      onDurationUpdated={(value) =>
        props.onValueChange({ type: 'time', value })
      }
    />
  );
}

function WeightedExerciseEditor({
  exercise,
  updateExercise,
}: {
  exercise: WeightedExerciseBlueprint;
  updateExercise: (ex: Partial<ExerciseBlueprint>) => void;
}) {
  const { t } = useTranslate();

  const incrementSets = () => updateExercise({ sets: exercise.sets + 1 });

  const decrementSets = () =>
    updateExercise({ sets: Math.max(exercise.sets - 1, 0) });

  const incrementReps = () =>
    updateExercise({ repsPerSet: exercise.repsPerSet + 1 });

  const decrementReps = () =>
    updateExercise({ repsPerSet: Math.max(exercise.repsPerSet - 1, 0) });

  const setExerciseWeightIncrease = (weightIncreaseOnSuccess: BigNumber) =>
    updateExercise({ weightIncreaseOnSuccess });

  return (
    <View style={{ gap: spacing[2] }}>
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
              label={t('exercise.sets.label')}
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
              label={t('exercise.reps.label')}
              increment={incrementReps}
              decrement={decrementReps}
              value={exercise.repsPerSet}
              testID="exercise-reps"
            />
          </Card.Content>
        </Card>
      </View>

      <SharedFieldsEditor exercise={exercise} updateExercise={updateExercise} />

      <LabelledFormRow
        label={t('exercise.progressive_overload.label')}
        icon="speedFill"
      >
        <EditableIncrementer
          testID="exercise-auto-increase"
          value={exercise.weightIncreaseOnSuccess}
          onChange={setExerciseWeightIncrease}
        />
      </LabelledFormRow>

      <RestEditorGroup
        rest={exercise.restBetweenSets}
        onRestUpdated={(restBetweenSets) => updateExercise({ restBetweenSets })}
      />

      <ListSwitch
        headline={t('workout.superset_next_exercise.button')}
        value={exercise.supersetWithNext}
        supportingText=""
        testID="exercise-superset"
        onValueChange={(supersetWithNext) =>
          updateExercise({ supersetWithNext })
        }
      />
    </View>
  );
}
