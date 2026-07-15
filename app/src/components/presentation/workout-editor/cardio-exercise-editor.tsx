import DurationEditor from '@/components/presentation/foundation/editors/duration-editor';
import EditableIncrementer from '@/components/presentation/foundation/editors/editable-incrementer';
import Button from '@/components/presentation/foundation/gesture-wrappers/button';
import { FormRow } from '@/components/presentation/foundation/form-row';
import RestFormat from '@/components/presentation/foundation/rest-format';
import SelectPicker from '@/components/presentation/foundation/select-picker';
import SegmentedPicker from '@/components/presentation/foundation/segmented-picker';
import { SegmentedList, SegmentListFormElement } from '@/components/presentation/foundation/segmented-list';
import { SegmentedListSwitch } from '@/components/presentation/foundation/segmented-list-switch';
import { RestEditorDialog } from '@/components/presentation/workout-editor/rest-editor-dialog';
import { SharedFieldsEditor } from '@/components/presentation/workout-editor/shared-fields-editor';
import StraightenIcon from '@expo/material-symbols/straighten.xml';
import TimerIcon from '@expo/material-symbols/timer.xml';
import { useAppTheme } from '@/hooks/useAppTheme';
import {
  CardioExerciseBlueprint,
  CardioExerciseSetBlueprint,
  CardioTarget,
  DistanceCardioTarget,
  DistanceUnits,
  matchCardioTarget,
  Rest,
  TimeCardioTarget,
  WeightedExerciseBlueprint,
} from '@/models/blueprint-models';
import { useAppSelector } from '@/store';
import { assertUnreachable } from '@/utils/assert-unreachable';
import { KeysOfType } from '@/utils/types';
import { Duration } from '@js-joda/core';
import { T, useTranslate } from '@tolgee/react';
import BigNumber from 'bignumber.js';
import { useState } from 'react';
import { View } from 'react-native';
import { Divider, List } from 'react-native-paper';

const distanceUnitOptions = DistanceUnits.map((value) => ({
  value,
  label: value + 's',
}));

export function CardioExerciseEditor({
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
