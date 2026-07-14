import DurationEditor from '@/components/presentation/foundation/editors/duration-editor';
import EditableIncrementer from '@/components/presentation/foundation/editors/editable-incrementer';
import FixedIncrementer from '@/components/presentation/foundation/editors/fixed-incrementer';
import Button from '@/components/presentation/foundation/gesture-wrappers/button';
import Form from '@/components/presentation/foundation/form';
import { RestEditorDialog } from '@/components/presentation/workout-editor/rest-editor-dialog';
import SelectPicker from '@/components/presentation/foundation/select-picker';
import SegmentedPicker from '@/components/presentation/foundation/segmented-picker';
import DirectionsRunIcon from '@expo/material-symbols/directions_run.xml';
import FitnessCenterIcon from '@expo/material-symbols/fitness_center.xml';
import StraightenIcon from '@expo/material-symbols/straighten.xml';
import TimerIcon from '@expo/material-symbols/timer.xml';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import {
  CardioExerciseBlueprint,
  CardioExerciseSetBlueprint,
  CardioTarget,
  DistanceCardioTarget,
  DistanceUnits,
  ExerciseBlueprint,
  matchCardioTarget,
  Rest,
  TimeCardioTarget,
  WeightedExerciseBlueprint,
} from '@/models/blueprint-models';
import { useAppSelector } from '@/store';

import { assertUnreachable } from '@/utils/assert-unreachable';
import { Duration } from '@js-joda/core';
import { T, useTranslate } from '@tolgee/react';
import BigNumber from 'bignumber.js';
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { Divider, List, TextInput } from 'react-native-paper';
import { match, P } from 'ts-pattern';
import { ExerciseDescriptor } from '@/models/exercise-models';
import { FormRow } from '@/components/presentation/foundation/form-row';
import { SegmentedList, SegmentListFormElement } from '@/components/presentation/foundation/segmented-list';
import { SegmentedListSwitch } from '@/components/presentation/foundation/segmented-list-switch';
import RestFormat from '@/components/presentation/foundation/rest-format';
import { KeysOfType } from '@/utils/types';
import { ExerciseSearcher } from '@/components/presentation/workout-editor/exercise-searcher';
import {
  ProgressiveOverloadSelect,
  ProgressiveOverloadValuesEditor,
} from '@/components/presentation/workout-editor/progressive-overload';

interface ExerciseEditorProps {
  exercise: ExerciseBlueprint;
  updateExercise: (ex: ExerciseBlueprint) => void;
}
const distanceUnitOptions = DistanceUnits.map((value) => ({
  value,
  label: value + 's',
}));
export function ExerciseEditor(props: ExerciseEditorProps) {
  const selectExerciseFromSearch = (ex: ExerciseDescriptor) => {
    updateExercise({ name: ex.name });
  };
  const { exercise: propsExercise, updateExercise: updatePropsExercise } = props;
  const [exercise, setExercise] = useState(propsExercise);
  const exerciseRef = useRef(exercise);
  exerciseRef.current = exercise;

  // Bit of a hack to let us update exercise immediately without going through the whole props loop
  useEffect(() => {
    setExercise(propsExercise);
  }, [propsExercise]);
  const commit = (next: CardioExerciseBlueprint | WeightedExerciseBlueprint) => {
    exerciseRef.current = next;
    setExercise(next);
    updatePropsExercise(next);
  };
  const updateExercise = (ex: Partial<WeightedExerciseBlueprint | CardioExerciseBlueprint>) => {
    commit(exerciseRef.current.with(ex as unknown as Partial<WeightedExerciseBlueprint & CardioExerciseBlueprint>));
  };

  const handleTypeChange = (type: string) => {
    const current = exerciseRef.current;
    let newExercise: CardioExerciseBlueprint | WeightedExerciseBlueprint = current;
    if (type === 'weighted') {
      newExercise = WeightedExerciseBlueprint.empty().with({
        // oxlint-disable-next-line typescript/no-misused-spread
        ...current,
        type: 'WeightedExerciseBlueprint',
        sets: undefined!, // Will not overwrite empty
      });
    } else {
      newExercise = CardioExerciseBlueprint.empty().with({
        // oxlint-disable-next-line typescript/no-misused-spread
        ...current,
        type: 'CardioExerciseBlueprint',
        sets: undefined!, // Will not overwrite empty
      });
    }
    commit(newExercise);
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
          <ExerciseSearcher currentExercise={exercise} onSelectExercise={selectExerciseFromSearch} />
        </FormRow>
        <FormRow>
          <SegmentedPicker
            value={exercise instanceof WeightedExerciseBlueprint ? 'weighted' : 'cardio'}
            options={[
              {
                value: 'weighted',
                label: 'Weighted',
                icon: FitnessCenterIcon,
                systemImage: 'dumbbell',
                testID: 'weighted-button',
              },
              {
                value: 'cardio',
                label: 'Cardio/Time',
                icon: DirectionsRunIcon,
                systemImage: 'figure.run',
                testID: 'cardio-button',
              },
            ]}
            onChange={handleTypeChange}
          />
        </FormRow>
        {exerciseEditor}
      </Form>
    </View>
  );
}

function CardioExerciseEditor({
  exercise,
  updateExercise,
}: {
  exercise: CardioExerciseBlueprint;
  updateExercise: (ex: Partial<CardioExerciseBlueprint | WeightedExerciseBlueprint>) => void;
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
              sets: exercise.sets.map((oldSet, i) => (setIndex === i ? newSet : oldSet)),
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
                sets: exercise.sets.filter((_, i) => i !== exercise.sets.length - 1),
              })
            }
          >
            <T keyName="exercise.cardio_set.remove.button" />
          </Button>
          <Button
            icon={'addCircle'}
            onPress={() =>
              updateExercise({
                sets: [...exercise.sets, exercise.sets[exercise.sets.length - 1] ?? CardioExerciseSetBlueprint.empty()],
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
  const { colors } = useAppTheme();
  const restTimersEnabled = useAppSelector((x) => x.settings.restTimersEnabled);
  const [restDialogOpen, setRestDialogOpen] = useState(false);
  const { set, updateSet } = props;
  const rest = set.restBetweenSets;
  const toggleSetItem = (item: KeysOfType<CardioExerciseSetBlueprint, boolean>) => () =>
    updateSet(set.with({ [item]: !set[item] }));
  return (
    <>
      <CardioTargetEditor target={set.target} onValueChange={(target) => updateSet(set.with({ target }))} />
      {restTimersEnabled && rest && (
        <RestEditorDialog
          onRestUpdated={(restBetweenSets) => updateSet(set.with({ restBetweenSets }))}
          rest={rest}
          dialogOpen={restDialogOpen}
          setDialogOpen={setRestDialogOpen}
        />
      )}
      <SegmentedList
        renderItem={(i) => i}
        items={[
          <SegmentedListSwitch
            key="track-time"
            value={set.trackDuration || set.target.type === 'time'}
            testID="track-time-switch"
            icon={'timer'}
            onValueChange={toggleSetItem('trackDuration')}
            label={t('exercise.track_time.label')}
            disabled={set.target.type === 'time'}
          />,
          <SegmentedListSwitch
            key="track-distance"
            value={set.trackDistance || set.target.type === 'distance'}
            icon={'trailLength'}
            testID="track-distance-switch"
            onValueChange={toggleSetItem('trackDistance')}
            label={t('exercise.track_distance.label')}
            disabled={set.target.type === 'distance'}
          />,
          <SegmentedListSwitch
            key="track-resistance"
            icon={'speed'}
            value={set.trackResistance}
            onValueChange={toggleSetItem('trackResistance')}
            label={t('exercise.track_resistance.label')}
          />,
          <SegmentedListSwitch
            key="track-incline"
            value={set.trackIncline}
            icon={'elevation'}
            onValueChange={toggleSetItem('trackIncline')}
            label={t('exercise.track_incline.label')}
          />,
          <SegmentedListSwitch
            key="track-weight"
            value={set.trackWeight}
            icon={'weight'}
            onValueChange={toggleSetItem('trackWeight')}
            label={t('exercise.track_weight.label')}
          />,
          <SegmentedListSwitch
            key="track-steps"
            value={set.trackSteps}
            icon={'steps'}
            onValueChange={toggleSetItem('trackSteps')}
            label={t('exercise.track_steps.label')}
          />,
          // Steady-state cardio has no rest to speak of, so a set opts in rather than being given a
          // window it will never use.
          ...(restTimersEnabled
            ? [
                <SegmentedListSwitch
                  key="rest-enabled"
                  value={!!rest}
                  icon={'airlineSeatReclineExtraFill'}
                  testID="cardio-rest-switch"
                  onValueChange={(enabled) =>
                    updateSet(
                      set.with({
                        restBetweenSets: enabled ? Rest.short : undefined,
                      }),
                    )
                  }
                  label={t('exercise.rest_between_sets.label')}
                />,
              ]
            : []),
          ...(restTimersEnabled && rest
            ? [
                <SegmentListFormElement
                  key="rest-edit"
                  label={t('rest.rest.label')}
                  icon={'timer'}
                  onPress={() => setRestDialogOpen(true)}
                  right={<RestFormat style={{ color: colors.onSurface }} rest={rest} />}
                />,
              ]
            : []),
        ]}
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
  updateExercise: (ex: Partial<CardioExerciseBlueprint | WeightedExerciseBlueprint>) => void;
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

function CardioTargetEditor(props: { target: CardioTarget; onValueChange: (t: CardioTarget) => void }) {
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
        <SegmentedPicker
          value={target.type}
          onChange={handleTypeChange}
          options={[
            {
              value: 'distance',
              label: t('exercise.distance.label'),
              icon: StraightenIcon,
              systemImage: 'ruler',
              testID: 'distance-button',
            },
            {
              value: 'time',
              label: t('generic.time.label'),
              icon: TimerIcon,
              systemImage: 'timer',
              testID: 'time-button',
            },
          ]}
        />
      </FormRow>

      {matchCardioTarget(target, {
        distance: (t) => <DistanceTargetEditor target={t} onValueChange={onValueChange} />,
        time: (t) => <TimeTargetEditor target={t} onValueChange={onValueChange} />,
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
          onChange={(value) => onValueChange({ ...target, value: { ...target.value, value } })}
          disallowNegative
          value={props.target.value.value}
        />
      </View>

      <SelectPicker
        testID="setDistanceUnit"
        value={target.value.unit}
        options={distanceUnitOptions}
        onChange={(unit) => onValueChange({ ...target, value: { ...target.value, unit } })}
      />
    </View>
  );
}

function TimeTargetEditor(props: { target: TimeCardioTarget; onValueChange: (t: TimeCardioTarget) => void }) {
  return (
    <DurationEditor
      duration={props.target.value}
      showHours
      onDurationUpdated={(value) => props.onValueChange({ type: 'time', value })}
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
  const restTimersEnabled = useAppSelector((x) => x.settings.restTimersEnabled);
  const [restDialogOpen, setRestDialogOpen] = useState(false);

  const setSets = (value: number) => updateExercise({ sets: Math.max(value, 1) });

  const setReps = (value: number) => updateExercise({ repsPerSet: Math.max(value, 1) });

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

      {restTimersEnabled && (
        <RestEditorDialog
          onRestUpdated={(restBetweenSets) => updateExercise({ restBetweenSets })}
          rest={exercise.restBetweenSets}
          dialogOpen={restDialogOpen}
          setDialogOpen={setRestDialogOpen}
        />
      )}
      <FormRow>
        <SegmentedList
          items={[
            ...(restTimersEnabled
              ? [
                  <SegmentListFormElement
                    key={1}
                    label={t('rest.rest.label')}
                    icon={'airlineSeatReclineExtraFill'}
                    onPress={() => setRestDialogOpen(true)}
                    right={<RestFormat style={{ color: colors.onSurface }} rest={exercise.restBetweenSets} />}
                  />,
                ]
              : []),
            <SegmentedListSwitch
              key={2}
              label={t('workout.superset_next_exercise.button')}
              icon={'link'}
              value={exercise.supersetWithNext}
              testID="exercise-superset"
              onValueChange={(supersetWithNext) => updateExercise({ supersetWithNext })}
            />,
            <SegmentListFormElement
              key={3}
              label={t('exercise.progressive_overload.label')}
              icon={'trendingUp'}
              right={
                <ProgressiveOverloadSelect
                  value={exercise.progressiveOverload}
                  onChange={(progressiveOverload) => updateExercise({ progressiveOverload })}
                />
              }
              line2={
                <ProgressiveOverloadValuesEditor
                  value={exercise.progressiveOverload}
                  onChange={(progressiveOverload) => updateExercise({ progressiveOverload })}
                />
              }
            />,
          ]}
          renderItem={(i) => i}
        />
      </FormRow>
    </View>
  );
}
