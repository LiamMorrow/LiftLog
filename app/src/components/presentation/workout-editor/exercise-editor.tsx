import AppBottomSheet from '@/components/presentation/foundation/app-bottom-sheet';
import DurationEditor from '@/components/presentation/foundation/editors/duration-editor';
import EditableIncrementer from '@/components/presentation/foundation/editors/editable-incrementer';
import ExerciseFilterer from '@/components/presentation/workout-editor/exercise-filterer';
import FixedIncrementer from '@/components/presentation/foundation/editors/fixed-incrementer';
import Button from '@/components/presentation/foundation/gesture-wrappers/button';
import Form from '@/components/presentation/foundation/form';
import { RestEditorDialog } from '@/components/presentation/workout-editor/rest-editor-dialog';
import SelectButton from '@/components/presentation/foundation/select-button';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import {
  CardioExerciseBlueprint,
  CardioExerciseBlueprintPOJO,
  CardioExerciseSetBlueprint,
  CardioTarget,
  DistanceCardioTarget,
  DistanceUnits,
  ExerciseBlueprint,
  matchCardioTarget,
  TimeCardioTarget,
  WeightedExerciseBlueprint,
  WeightedExerciseBlueprintPOJO,
} from '@/models/blueprint-models';
import { useAppSelector, useAppSelectorWithArg } from '@/store';
import {
  selectExerciseById,
  selectExerciseIds,
  updateExercise,
} from '@/store/stored-sessions';
import { assertUnreachable } from '@/utils/assert-unreachable';
import BottomSheet, {
  useBottomSheetScrollableCreator,
} from '@gorhom/bottom-sheet';
import { Duration } from '@js-joda/core';
import { T, useTranslate } from '@tolgee/react';
import BigNumber from 'bignumber.js';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, View } from 'react-native';
import { Divider, List, SegmentedButtons, TextInput } from 'react-native-paper';
import { match, P } from 'ts-pattern';
import { LegendList } from '@legendapp/list';
import { ExerciseDescriptor } from '@/models/exercise-models';
import { useDispatch } from 'react-redux';
import { uuid } from '@/utils/uuid';
import { FormRow } from '@/components/presentation/foundation/form-row';
import {
  SegmentedList,
  SegmentListFormElement,
} from '@/components/presentation/foundation/segmented-list';
import { SegmentedListSwitch } from '@/components/presentation/foundation/segmented-list-switch';
import RestFormat from '@/components/presentation/foundation/rest-format';
import { KeysOfType } from '@/utils/types';

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
  const BottomSheetScrollView = useBottomSheetScrollableCreator();
  const selectExerciseFromSearch = (ex: ExerciseDescriptor) => {
    updateExercise({ name: ex.name });
    setFilteredExerciseIds(exerciseIds);
    setSuggestedNewExercise('NONE');
    bottomSheetRef.current?.close();
  };

  const [bottomSheetShown, setBottomSheetShown] = useState(false);
  const [filteredExerciseIds, setFilteredExerciseIds] = useState(exerciseIds);
  const [suggestedNewExercise, setSuggestedNewExercise] = useState<
    ExerciseDescriptor | 'NONE'
  >('NONE');
  const exerciseListItems = useMemo(
    () => ['filter', suggestedNewExercise, ...filteredExerciseIds] as const,
    [filteredExerciseIds, suggestedNewExercise],
  );
  const { exercise: propsExercise, updateExercise: updatePropsExercise } =
    props;
  const [exercise, setExercise] = useState(propsExercise);

  // Bit of a hack to let us update exercise immediately without going through the whole props loop
  useEffect(() => {
    setExercise(propsExercise);
  }, [propsExercise]);
  const updateExercise = (
    ex: Partial<WeightedExerciseBlueprint | CardioExerciseBlueprint>,
  ) => {
    const update = exercise.with(
      ex as unknown as Partial<
        WeightedExerciseBlueprintPOJO & CardioExerciseBlueprintPOJO
      >,
    );
    setExercise(update);
    updatePropsExercise(update);
  };

  const handleTypeChange = (type: string) => {
    let newExercise: CardioExerciseBlueprint | WeightedExerciseBlueprint =
      exercise;
    if (type === 'weighted') {
      newExercise = WeightedExerciseBlueprint.empty().with({
        ...exercise,
        type: 'WeightedExerciseBlueprint',
        sets: undefined!, // Will not overwrite empty
      });
    } else {
      newExercise = CardioExerciseBlueprint.empty().with({
        ...exercise,
        type: 'CardioExerciseBlueprint',
        sets: undefined!, // Will not overwrite empty
      });
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
    <View style={{ paddingVertical: spacing.pageHorizontalMargin }}>
      <Form>
        <FormRow>
          <Button
            icon={'contentPasteSearch'}
            mode="contained"
            onPress={() => {
              setBottomSheetShown(true);
              Keyboard.dismiss();
              bottomSheetRef.current?.expand();
            }}
          >
            {exercise.name}
          </Button>
        </FormRow>
        <FormRow>
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
        </FormRow>
        {exerciseEditor}
      </Form>
      <AppBottomSheet
        index={-1}
        sheetRef={bottomSheetRef}
        enablePanDownToClose
        enableDynamicSizing={false}
      >
        {bottomSheetShown && (
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
                    onPress={selectExerciseFromSearch}
                  />
                ) : undefined;
              }
              return (
                <ExerciseIdSearchListItem
                  exerciseId={i.item as string}
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

function CardioExerciseEditor({
  exercise,
  updateExercise,
}: {
  exercise: CardioExerciseBlueprint;
  updateExercise: (
    ex: Partial<CardioExerciseBlueprint | WeightedExerciseBlueprint>,
  ) => void;
}) {
  const { colors } = useAppTheme();
  return (
    <>
      <SharedFieldsEditor exercise={exercise} updateExercise={updateExercise} />
      {exercise.sets.map((set, setIndex) => (
        <CardioSetEditor
          set={set}
          key={setIndex}
          updateSet={(newSet) =>
            updateExercise({
              sets: exercise.sets.map((oldSet, i) =>
                setIndex === i ? newSet : oldSet,
              ),
            })
          }
        />
      ))}

      <List.Section>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
          <Button
            icon={'doNotDisturbOn'}
            disabled={exercise.sets.length === 1}
            textColor={colors.error}
            onPress={() =>
              updateExercise({
                sets: exercise.sets.filter(
                  (_, i) => i !== exercise.sets.length - 1,
                ),
              })
            }
          >
            <T keyName="exercise.cardio_set.remove.button" />
          </Button>
          <Button
            icon={'addCircle'}
            onPress={() =>
              updateExercise({
                sets: [
                  ...exercise.sets,
                  exercise.sets[exercise.sets.length - 1],
                ],
              })
            }
          >
            <T keyName="exercise.cardio_set.add.button" />
          </Button>
        </View>
      </List.Section>
    </>
  );
}

function CardioSetEditor(props: {
  set: CardioExerciseSetBlueprint;
  updateSet: (val: CardioExerciseSetBlueprint) => void;
}) {
  const { t } = useTranslate();
  const { set, updateSet } = props;
  const toggleSetItem =
    (item: KeysOfType<CardioExerciseSetBlueprint, boolean>) => () =>
      updateSet(set.with({ [item]: !set[item] }));
  return (
    <>
      <CardioTargetEditor
        target={set.target}
        onValueChange={(target) => updateSet(set.with({ target }))}
      />
      <SegmentedList
        renderItem={(i) => i[0]}
        onItemPress={([_, toggle]) => toggle()}
        items={
          [
            [
              <SegmentedListSwitch
                value={set.trackDuration || set.target.type === 'time'}
                testID="track-time-switch"
                icon={'timer'}
                onValueChange={toggleSetItem('trackDuration')}
                label={t('exercise.track_time.label')}
                disabled={set.target.type === 'time'}
              />,
              toggleSetItem('trackDuration'),
            ],
            [
              <SegmentedListSwitch
                value={set.trackDistance || set.target.type === 'distance'}
                icon={'trailLength'}
                testID="track-distance-switch"
                onValueChange={toggleSetItem('trackDistance')}
                label={t('exercise.track_distance.label')}
                disabled={set.target.type === 'distance'}
              />,
              toggleSetItem('trackDistance'),
            ],
            [
              <SegmentedListSwitch
                icon={'speed'}
                value={set.trackResistance}
                onValueChange={toggleSetItem('trackResistance')}
                label={t('exercise.track_resistance.label')}
              />,
              toggleSetItem('trackResistance'),
            ],
            [
              <SegmentedListSwitch
                value={set.trackIncline}
                icon={'elevation'}
                onValueChange={toggleSetItem('trackIncline')}
                label={t('exercise.track_incline.label')}
              />,
              toggleSetItem('trackIncline'),
            ],
            [
              <SegmentedListSwitch
                value={set.trackWeight}
                icon={'weight'}
                onValueChange={toggleSetItem('trackWeight')}
                label={t('exercise.track_weight.label')}
              />,
              toggleSetItem('trackWeight'),
            ],
            [
              <SegmentedListSwitch
                value={set.trackSteps}
                icon={'steps'}
                onValueChange={toggleSetItem('trackSteps')}
                label={t('exercise.track_steps.label')}
              />,
              toggleSetItem('trackSteps'),
            ],
          ] as const
        }
      />

      <Divider />
    </>
  );
}

function SharedFieldsEditor({
  exercise,
  updateExercise,
}: {
  exercise: ExerciseBlueprint;
  updateExercise: (
    ex: Partial<CardioExerciseBlueprint | WeightedExerciseBlueprint>,
  ) => void;
}) {
  const { t } = useTranslate();
  return (
    <>
      <FormRow>
        <TextInput
          mode="outlined"
          label={t('plan.notes.label')}
          testID="exercise-notes"
          style={{ marginBottom: spacing[2] }}
          value={exercise.notes}
          onChangeText={(notes) => updateExercise({ notes })}
          multiline
        />
      </FormRow>
      <FormRow>
        <TextInput
          mode="outlined"
          testID="exercise-link"
          label={t('generic.external_link.label')}
          style={{ marginBottom: spacing[2] }}
          placeholder="https://"
          value={exercise.link}
          onChangeText={(link) => updateExercise({ link })}
        />
      </FormRow>
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
  const handleTypeChange = (type: CardioTarget['type']) => {
    if (type === target.type) {
      return;
    }
    switch (type) {
      case 'distance':
        onValueChange({
          type: 'distance',
          value: {
            unit: useImperialUnits ? 'mile' : 'metre',
            value: BigNumber(useImperialUnits ? 2.5 : 5000),
          },
        });
        return;
      case 'time':
        onValueChange({
          type: 'time',
          value: Duration.ofMinutes(30),
        });
        return;

      default:
        assertUnreachable(type);
    }
  };
  return (
    <>
      <FormRow>
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
      </FormRow>

      {matchCardioTarget(target, {
        distance: (t) => (
          <DistanceTargetEditor target={t} onValueChange={onValueChange} />
        ),
        time: (t) => (
          <TimeTargetEditor target={t} onValueChange={onValueChange} />
        ),
      })}
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
  const { colors } = useAppTheme();
  const [restDialogOpen, setRestDialogOpen] = useState(false);

  const setSets = (value: number) =>
    updateExercise({ sets: Math.max(value, 1) });

  const setReps = (value: number) =>
    updateExercise({ repsPerSet: Math.max(value, 1) });

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
          marginBlockEnd: spacing[2],
        }}
      >
        <View style={{ flex: 1 }}>
          <FixedIncrementer
            label={t('exercise.sets.label')}
            onValueChange={setSets}
            value={exercise.sets}
            testID="exercise-sets"
          />
        </View>
        <View style={{ flex: 1 }}>
          <FixedIncrementer
            label={t('exercise.reps.label')}
            onValueChange={setReps}
            value={exercise.repsPerSet}
            testID="exercise-reps"
          />
        </View>
      </View>

      <SharedFieldsEditor exercise={exercise} updateExercise={updateExercise} />

      <FormRow>
        <EditableIncrementer
          label={t('exercise.progressive_overload.label')}
          testID="exercise-auto-increase"
          value={exercise.weightIncreaseOnSuccess}
          onChange={setExerciseWeightIncrease}
        />
      </FormRow>

      <RestEditorDialog
        onRestUpdated={(restBetweenSets) => updateExercise({ restBetweenSets })}
        rest={exercise.restBetweenSets}
        dialogOpen={restDialogOpen}
        setDialogOpen={setRestDialogOpen}
      />
      <FormRow>
        <SegmentedList
          items={[
            <SegmentListFormElement
              label={t('rest.rest.label')}
              icon={'airlineSeatReclineExtraFill'}
              right={
                <RestFormat
                  style={{ color: colors.onSurface }}
                  rest={exercise.restBetweenSets}
                />
              }
            />,

            <SegmentedListSwitch
              label={t('workout.superset_next_exercise.button')}
              icon={'link'}
              value={exercise.supersetWithNext}
              testID="exercise-superset"
              onValueChange={(supersetWithNext) =>
                updateExercise({ supersetWithNext })
              }
            />,
          ]}
          renderItem={(i) => i}
          onItemPress={(_, i) => {
            match(i)
              .with(0, () => setRestDialogOpen(true))
              .with(1, () =>
                updateExercise({
                  supersetWithNext: !exercise.supersetWithNext,
                }),
              )
              .run();
          }}
        />
      </FormRow>
    </View>
  );
}
