import { RecordedCardioExercise, RecordedCardioExerciseSet } from '@/models/session-models';
import ExerciseSection from '@/components/presentation/workout/exercise-section';
import { CardioTarget, Distance, DistanceUnit } from '@/models/blueprint-models';
import { T, useTranslate } from '@tolgee/react';
import { localeDisplayFormatBigNumber } from '@/utils/locale-bignumber';
import { Duration, OffsetDateTime } from '@js-joda/core';
import { ReactNode, useEffect, useState } from 'react';

import { View } from 'react-native';
import IconButton from '@/components/presentation/foundation/icon-button';
import { rounding, spacing, useAppTheme } from '@/hooks/useAppTheme';
import { AppText } from '@/components/presentation/foundation/app-text';
import BigNumber from 'bignumber.js';
import { useAppSelector } from '@/store';
import { formatDuration } from '@/utils/format-duration';
import { getShortUnit } from '@/utils/unit';
import { DecimalInput, DurationInput, IntegerInput } from '@/components/presentation/foundation/editors/number-inputs';
import SelectPicker from '@/components/presentation/foundation/select-picker';
import { WeightEditor } from '@/components/presentation/foundation/editors/weight-editor';
import { NegateWeightButton } from '@/components/presentation/foundation/editors/weight-input-controls';
import { CardioValueTile } from '@/components/presentation/workout/cardio/cardio-value-tile';
import { Weight } from '@/models/weight';
import { usePreferredWeightUnit } from '@/hooks/usePreferredWeightUnit';
import { Updater } from '@/utils/types';

interface CardioExerciseProps {
  recordedExercise: RecordedCardioExercise;
  previousLineageExercise: RecordedCardioExercise | undefined;
  toStartNext: boolean;
  isReadonly: boolean;
  showPreviousButton: boolean;
  titleLeading?: ReactNode;

  updateExercise: (update: Updater<RecordedCardioExercise>) => void;
  updateSet: (setIndex: number, update: Updater<RecordedCardioExerciseSet>) => void;
  onStartTimer: (setIndex: number) => void;
  onEditExercise: (() => void) | undefined;
  onRemoveExercise: () => void;
  onMoveExerciseUp: (() => void) | undefined;
  onMoveExerciseDown: (() => void) | undefined;
}

export function CardioExercise(props: CardioExerciseProps) {
  const { recordedExercise, updateExercise, updateSet } = props;
  const { t } = useTranslate();

  return (
    <ExerciseSection
      recordedExercise={recordedExercise}
      previousLineageExercise={props.previousLineageExercise}
      toStartNext={props.toStartNext}
      isReadonly={props.isReadonly}
      showPreviousButton={props.showPreviousButton}
      titleLeading={props.titleLeading}
      updateExercise={updateExercise}
      onEditExercise={props.onEditExercise}
      onRemoveExercise={props.onRemoveExercise}
      onMoveExerciseUp={props.onMoveExerciseUp}
      onMoveExerciseDown={props.onMoveExerciseDown}
    >
      <View style={{ gap: spacing[4] }}>
        {recordedExercise.sets.map((set, setIndex) => (
          <CardioExerciseSet
            set={set}
            key={setIndex}
            editorSubtitle={t('exercise.set_of_exercise.label', {
              exercise: recordedExercise.blueprint.name,
              number: setIndex + 1,
            })}
            isReadonly={props.isReadonly}
            toStartNext={props.toStartNext && (recordedExercise.sets[setIndex - 1]?.isCompletelyFilled ?? true)}
            updateSet={(update) => updateSet(setIndex, update)}
            onStartTimer={() => props.onStartTimer(setIndex)}
            onStopTimer={() => updateSet(setIndex, (s) => s.withTimerStopped(OffsetDateTime.now()))}
          />
        ))}
      </View>
    </ExerciseSection>
  );
}

interface CardioExerciseSetProps {
  set: RecordedCardioExerciseSet;
  editorSubtitle: string;
  toStartNext: boolean;
  isReadonly: boolean;

  updateSet: (update: Updater<RecordedCardioExerciseSet>) => void;
  onStartTimer: () => void;
  onStopTimer: () => void;
}

/** The recorded duration only banks on a cycle, so a running set reads the clock instead. */
function useLiveDuration(set: RecordedCardioExerciseSet): Duration | undefined {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!set.isTimerRunning) {
      return;
    }
    const interval = setInterval(() => setTick((tick) => tick + 1), 500);
    return () => clearInterval(interval);
  }, [set.isTimerRunning]);

  return set.isTimerRunning ? set.elapsedAt(OffsetDateTime.now()) : set.duration;
}

function CardioExerciseSet(props: CardioExerciseSetProps) {
  const { set, updateSet, isReadonly } = props;
  const { t } = useTranslate();
  const imperialByDefault = useAppSelector((x) => x.settings.useImperialUnits);
  const preferredWeightUnit = usePreferredWeightUnit();
  const liveDuration = useLiveDuration(set);
  const { blueprint } = set;

  const emptyDistance: Distance = (blueprint.target.type === 'distance' && blueprint.target.value) || {
    value: BigNumber(0),
    unit: imperialByDefault ? 'mile' : 'kilometre',
  };

  return (
    <View style={{ gap: spacing[4] }}>
      <CardioTargetHandler target={blueprint.target} />
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: spacing[2],
        }}
      >
        {set.tracksDuration && (
          <CardioDurationTile
            editorSubtitle={props.editorSubtitle}
            duration={liveDuration}
            isReadonly={isReadonly}
            isTimerRunning={set.isTimerRunning}
            onChange={(duration) => updateSet((s) => s.with({ duration }))}
          />
        )}
        {set.tracksDistance && (
          <CardioDistanceTile
            editorSubtitle={props.editorSubtitle}
            distance={set.distance}
            isReadonly={isReadonly}
            emptyValue={emptyDistance}
            onChange={(distance) => updateSet((s) => s.with({ distance }))}
          />
        )}
        {blueprint.trackIncline && (
          <CardioValueTile
            isReadonly={isReadonly}
            editorSubtitle={props.editorSubtitle}
            value={set.incline}
            emptyValue={BigNumber(0)}
            format={localeDisplayFormatBigNumber}
            label={t('exercise.incline.label')}
            testID="cardio-incline-tile"
            onChange={(incline) => updateSet((s) => s.with({ incline }))}
          >
            {(value, setValue) => (
              <DecimalInput
                size="large"
                autoFocus
                flex={1}
                value={value}
                onChange={setValue}
                accessibilityLabel={t('exercise.incline.label')}
              />
            )}
          </CardioValueTile>
        )}
        {blueprint.trackResistance && (
          <CardioValueTile
            isReadonly={isReadonly}
            editorSubtitle={props.editorSubtitle}
            value={set.resistance}
            emptyValue={BigNumber(0)}
            format={localeDisplayFormatBigNumber}
            label={t('exercise.resistance.label')}
            testID="cardio-resistance-tile"
            onChange={(resistance) => updateSet((s) => s.with({ resistance }))}
          >
            {(value, setValue) => (
              <DecimalInput
                size="large"
                autoFocus
                flex={1}
                value={value}
                onChange={setValue}
                accessibilityLabel={t('exercise.resistance.label')}
              />
            )}
          </CardioValueTile>
        )}
        {blueprint.trackWeight && (
          <CardioValueTile
            isReadonly={isReadonly}
            editorSubtitle={props.editorSubtitle}
            value={set.weight}
            emptyValue={new Weight(0, preferredWeightUnit)}
            format={(weight) => weight.shortLocaleFormat()}
            label={t('weight.weight.label')}
            testID="cardio-weight-tile"
            editorStyle={{ flexDirection: 'column', alignItems: 'stretch' }}
            onChange={(weight) => updateSet((s) => s.with({ weight }))}
            headerAction={(value, setValue) => <NegateWeightButton weight={value} onChange={setValue} />}
          >
            {(value, setValue) => (
              <WeightEditor increment={BigNumber(2.5)} updateWeight={setValue} weight={value} allowNegative />
            )}
          </CardioValueTile>
        )}
        {blueprint.trackSteps && (
          <CardioValueTile
            isReadonly={isReadonly}
            editorSubtitle={props.editorSubtitle}
            value={set.steps}
            emptyValue={0}
            format={(steps) => steps.toString()}
            label={t('exercise.steps.label')}
            testID="cardio-steps-tile"
            onChange={(steps) => updateSet((s) => s.with({ steps }))}
          >
            {(value, setValue) => (
              <IntegerInput
                size="large"
                autoFocus
                flex={1}
                value={value}
                onChange={setValue}
                accessibilityLabel={t('exercise.steps.label')}
              />
            )}
          </CardioValueTile>
        )}
        {set.tracksDuration && !isReadonly && (
          <CardioTimerButton
            isTimerRunning={set.isTimerRunning}
            onStart={props.onStartTimer}
            onStop={props.onStopTimer}
          />
        )}
      </View>
    </View>
  );
}

function CardioDurationTile(props: {
  editorSubtitle: string;
  duration: Duration | undefined;
  isTimerRunning: boolean;
  isReadonly: boolean;
  onChange: (duration: Duration) => void;
}) {
  const { t } = useTranslate();
  return (
    <CardioValueTile
      isReadonly={props.isReadonly}
      editorSubtitle={props.editorSubtitle}
      value={props.duration}
      emptyValue={Duration.ZERO}
      format={formatDuration}
      label={t('generic.time.label')}
      testID="cardio-duration-tile"
      editorStyle={{ flexDirection: 'column', alignItems: 'stretch' }}
      onChange={props.onChange}
    >
      {(value, setValue) => (
        <DurationInput
          size="large"
          autoFocus={!props.isTimerRunning}
          showHours
          duration={value}
          onDurationUpdated={setValue}
          readOnly={props.isTimerRunning}
        />
      )}
    </CardioValueTile>
  );
}

function CardioDistanceTile(props: {
  editorSubtitle: string;
  distance: Distance | undefined;
  emptyValue: Distance;
  isReadonly: boolean;
  onChange: (distance: Distance) => void;
}) {
  const { t } = useTranslate();
  const units: DistanceUnit[] = ['kilometre', 'metre', 'mile', 'yard'];
  return (
    <CardioValueTile
      isReadonly={props.isReadonly}
      editorSubtitle={props.editorSubtitle}
      value={props.distance}
      emptyValue={props.emptyValue}
      format={(distance) => localeDisplayFormatBigNumber(distance.value) + getShortUnit(distance.unit)}
      label={t('exercise.distance.label')}
      testID="cardio-distance-tile"
      onChange={props.onChange}
    >
      {(value, setValue) => (
        <>
          <DecimalInput
            size="large"
            autoFocus
            flex={1}
            value={value.value}
            onChange={(distanceValue) => setValue({ ...value, value: distanceValue })}
            accessibilityLabel={t('exercise.distance.label')}
          />
          <SelectPicker
            value={value.unit}
            options={units.map((unit) => ({ value: unit, label: getShortUnit(unit) }))}
            onChange={(unit) => setValue({ ...value, unit })}
          />
        </>
      )}
    </CardioValueTile>
  );
}

function CardioTimerButton(props: { isTimerRunning: boolean; onStart: () => void; onStop: () => void }) {
  const { colors } = useAppTheme();
  return (
    <IconButton
      testID="cardio-timer-play-pause"
      icon={props.isTimerRunning ? 'pause' : 'playArrow'}
      mode="contained-tonal"
      onPress={props.isTimerRunning ? props.onStop : props.onStart}
      containerColor={props.isTimerRunning ? colors.amber : colors.green}
      iconColor={props.isTimerRunning ? colors.onAmber : colors.onGreen}
      style={{ borderRadius: rounding.roundedRectangleRadius }}
    />
  );
}

function CardioTargetHandler(props: { target: CardioTarget }) {
  const { colors } = useAppTheme();
  const isDistance = props.target.type === 'distance';
  return (
    <View style={{ flexDirection: 'row', gap: spacing[2] }}>
      <AppText variant="bodyLarge">
        <T keyName={isDistance ? 'exercise.target_distance.label' : 'exercise.target_time.label'} />
      </AppText>
      <AppText variant="bodyLarge" style={{ color: colors.primary }}>
        {props.target.type === 'distance'
          ? localeDisplayFormatBigNumber(props.target.value.value) + getShortUnit(props.target.value.unit)
          : formatDuration(props.target.value)}
      </AppText>
    </View>
  );
}
