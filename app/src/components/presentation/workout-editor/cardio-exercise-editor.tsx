import RestFormat from '@/components/presentation/foundation/rest-format';
import SelectPicker from '@/components/presentation/foundation/select-picker';
import SegmentedPicker from '@/components/presentation/foundation/segmented-picker';
import {
  SegmentedGroup,
  SegmentedList,
  SegmentListFormElement,
} from '@/components/presentation/foundation/segmented-list';
import { SegmentedListSwitch } from '@/components/presentation/foundation/segmented-list-switch';
import { RestEditorDialog } from '@/components/presentation/workout-editor/rest-editor-dialog';
import { SharedFieldsEditor } from '@/components/presentation/workout-editor/shared-fields-editor';
import StraightenIcon from '@expo/material-symbols/straighten.xml';
import TimerIcon from '@expo/material-symbols/timer.xml';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { DecimalInput, DurationInput } from '@/components/presentation/foundation/editors/number-inputs';
import { Icon } from '@/components/presentation/foundation/icon';
import { TitledSection } from '@/components/presentation/foundation/titled-section';
import { formatCardioTarget } from '@/utils/format-cardio-target';
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
import { useTranslate } from '@tolgee/react';
import BigNumber from 'bignumber.js';
import { ReactNode, useEffect, useState } from 'react';
import { View } from 'react-native';
import { AppText } from '@/components/presentation/foundation/app-text';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { clearCardioSetEdit } from '@/store/app';
import { uuid } from '@/utils/uuid';

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
  const { t } = useTranslate();
  const { colors } = useAppTheme();
  const { push } = useRouter();
  const dispatch = useDispatch();
  const [requestId] = useState(() => uuid());
  const edit = useAppSelector((x) => x.app.cardioSetEdit);

  useEffect(() => {
    if (edit?.requestId !== requestId) {
      return;
    }
    dispatch(clearCardioSetEdit());
    const editedSet = edit.set && CardioExerciseSetBlueprint.fromJSON(edit.set);
    updateExercise({
      sets: editedSet
        ? exercise.sets.map((oldSet, i) => (i === edit.setIndex ? editedSet : oldSet))
        : exercise.sets.filter((_, i) => i !== edit.setIndex),
    });
  }, [edit, requestId, dispatch, exercise, updateExercise]);

  const openSet = (setIndex: number, set: CardioExerciseSetBlueprint, setCount: number) =>
    push({
      pathname: '/cardio-set-editor',
      params: {
        requestId,
        setIndex,
        set: JSON.stringify(set.toJSON()),
        canRemove: String(setCount > 1),
      },
    });

  const addSet = () => {
    const newSet = exercise.sets[exercise.sets.length - 1] ?? CardioExerciseSetBlueprint.empty();
    updateExercise({ sets: [...exercise.sets, newSet] });
    openSet(exercise.sets.length, newSet, exercise.sets.length + 1);
  };

  const trackedLabels = (set: CardioExerciseSetBlueprint) =>
    [
      (set.trackDuration || set.target.type === 'time') && t('generic.time.label'),
      (set.trackDistance || set.target.type === 'distance') && t('exercise.distance.label'),
      set.trackResistance && t('exercise.resistance.label'),
      set.trackIncline && t('exercise.incline.label'),
      set.trackWeight && t('weight.weight.label'),
      set.trackSteps && t('exercise.steps.label'),
      set.restBetweenSets && t('rest.rest.label'),
    ]
      .filter(Boolean)
      .join(' · ');

  return (
    <>
      <TitledSection title={t('exercise.sets.label')}>
        <SegmentedGroup>
          {[
            ...exercise.sets.map((set, index) => (
              <SegmentListFormElement
                key={`set-${index}`}
                testID={`cardio-set-${index}`}
                label={t('exercise.set_number.label', { number: index + 1 })}
                supportingText={trackedLabels(set)}
                onPress={() => openSet(index, set, exercise.sets.length)}
                right={
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}>
                    <AppText variant="labelLarge">{formatCardioTarget(set.target)}</AppText>
                    <Icon source="chevronRight" size={20} color={colors.onSurfaceVariant} />
                  </View>
                }
              />
            )),
            <SegmentListFormElement
              key="add"
              testID="cardio-add-set"
              label={t('exercise.cardio_set.add.button')}
              icon="add"
              onPress={addSet}
            />,
          ]}
        </SegmentedGroup>
      </TitledSection>
      <SharedFieldsEditor exercise={exercise} updateExercise={updateExercise} />
    </>
  );
}

export function CardioSetEditor(props: {
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
      <TitledSection title={t('exercise.tracking.title')}>
        <SegmentedList
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
      </TitledSection>
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
    <TitledSection title={t('exercise.target.title')}>
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
      <SegmentedGroup>
        {matchCardioTarget(target, {
          distance: (t) => <DistanceTargetEditor target={t} onValueChange={onValueChange} />,
          time: (t) => <TimeTargetEditor target={t} onValueChange={onValueChange} />,
        })}
      </SegmentedGroup>
    </TitledSection>
  );
}

function DistanceTargetEditor(props: {
  target: DistanceCardioTarget;
  onValueChange: (t: DistanceCardioTarget) => void;
}) {
  const { t } = useTranslate();
  const { target, onValueChange } = props;
  return (
    <TargetRow label={t('exercise.distance.label')}>
      <DecimalInput
        value={target.value.value}
        onChange={(value) => onValueChange({ ...target, value: { ...target.value, value } })}
        accessibilityLabel={t('exercise.distance.label')}
        minWidth={spacing[24]}
      />
      <SelectPicker
        testID="setDistanceUnit"
        value={target.value.unit}
        options={distanceUnitOptions}
        onChange={(unit) => onValueChange({ ...target, value: { ...target.value, unit } })}
      />
    </TargetRow>
  );
}

function TimeTargetEditor(props: { target: TimeCardioTarget; onValueChange: (t: TimeCardioTarget) => void }) {
  const { t } = useTranslate();
  return (
    <TargetRow label={t('generic.time.label')}>
      <DurationInput
        showHours
        duration={props.target.value}
        onDurationUpdated={(value) => props.onValueChange({ type: 'time', value })}
      />
    </TargetRow>
  );
}

function TargetRow(props: { label: string; children: ReactNode }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: spacing[2],
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[3],
      }}
    >
      <AppText variant="labelLarge" style={{ flex: 1 }}>
        {props.label}
      </AppText>
      {props.children}
    </View>
  );
}
