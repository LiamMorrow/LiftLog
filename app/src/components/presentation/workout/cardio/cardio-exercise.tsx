import { RecordedCardioExercise, RecordedCardioExerciseSet } from '@/models/session-models';
import ExerciseSection from '@/components/presentation/workout/exercise-section';
import { CardioTarget, Distance, DistanceUnit } from '@/models/blueprint-models';
import { T, useTranslate } from '@tolgee/react';
import { localeFormatBigNumber } from '@/utils/locale-bignumber';
import { Duration, OffsetDateTime } from '@js-joda/core';
import { useEffect, useState } from 'react';

import { View } from 'react-native';
import IconButton from '@/components/presentation/foundation/gesture-wrappers/icon-button';
import { rounding, spacing, useAppTheme } from '@/hooks/useAppTheme';
import { Text } from 'react-native-paper';
import Menu from '@/components/presentation/foundation/menu';
import BigNumber from 'bignumber.js';
import { useAppSelector } from '@/store';
import { formatDuration } from '@/utils/format-duration';
import { getShortUnit } from '@/utils/unit';
import { DecimalEditor } from '@/components/presentation/foundation/editors/decimal-editor';
import { IntegerEditor } from '@/components/presentation/foundation/editors/integer-editor';
import { WeightEditor } from '@/components/presentation/foundation/editors/weight-editor';
import DurationEditor from '@/components/presentation/foundation/editors/duration-editor';
import { CardioValueTile } from '@/components/presentation/workout/cardio/cardio-value-tile';
import FocusRing from '@/components/presentation/foundation/focus-ring';
import { Weight } from '@/models/weight';
import { usePreferredWeightUnit } from '@/hooks/usePreferredWeightUnit';
import { Updater } from '@/utils/types';

interface CardioExerciseProps {
  recordedExercise: RecordedCardioExercise;
  previousRecordedExercises: RecordedCardioExercise[];
  toStartNext: boolean;
  isReadonly: boolean;
  showPreviousButton: boolean;

  updateExercise: (update: Updater<RecordedCardioExercise>) => void;
  updateSet: (setIndex: number, update: Updater<RecordedCardioExerciseSet>) => void;
  onStartTimer: (setIndex: number) => void;
  onEditExercise: () => void;
  onRemoveExercise: () => void;
}

export function CardioExercise(props: CardioExerciseProps) {
  const { recordedExercise, updateExercise, updateSet } = props;

  return (
    <ExerciseSection
      recordedExercise={recordedExercise}
      previousRecordedExercises={props.previousRecordedExercises}
      toStartNext={props.toStartNext}
      isReadonly={props.isReadonly}
      showPreviousButton={props.showPreviousButton}
      updateExercise={updateExercise}
      onEditExercise={props.onEditExercise}
      onRemoveExercise={props.onRemoveExercise}
    >
      <View style={{ gap: spacing[4] }}>
        {recordedExercise.sets.map((set, setIndex) => (
          <CardioExerciseSet
            set={set}
            key={setIndex}
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
            duration={liveDuration}
            isTimerRunning={set.isTimerRunning}
            onSave={(duration) => updateSet((s) => s.with({ duration }))}
          />
        )}
        {set.tracksDistance && (
          <CardioDistanceTile
            distance={set.distance}
            emptyValue={emptyDistance}
            onSave={(distance) => updateSet((s) => s.with({ distance }))}
          />
        )}
        {blueprint.trackIncline && (
          <CardioValueTile
            value={set.incline}
            emptyValue={BigNumber(0)}
            format={localeFormatBigNumber}
            label={t('exercise.incline.label')}
            testID="cardio-incline-tile"
            onSave={(incline) => updateSet((s) => s.with({ incline }))}
          >
            {(value, setValue) => <DecimalEditor style={{ flex: 1 }} value={value} onChange={setValue} />}
          </CardioValueTile>
        )}
        {blueprint.trackResistance && (
          <CardioValueTile
            value={set.resistance}
            emptyValue={BigNumber(0)}
            format={localeFormatBigNumber}
            label={t('exercise.resistance.label')}
            testID="cardio-resistance-tile"
            onSave={(resistance) => updateSet((s) => s.with({ resistance }))}
          >
            {(value, setValue) => <DecimalEditor style={{ flex: 1 }} value={value} onChange={setValue} />}
          </CardioValueTile>
        )}
        {blueprint.trackWeight && (
          <CardioValueTile
            value={set.weight}
            emptyValue={new Weight(0, preferredWeightUnit)}
            format={(weight) => weight.shortLocaleFormat()}
            label={t('weight.weight.label')}
            testID="cardio-weight-tile"
            dialogStyle={{ flexDirection: 'column', alignItems: 'stretch' }}
            onSave={(weight) => updateSet((s) => s.with({ weight }))}
          >
            {(value, setValue) => (
              <WeightEditor increment={BigNumber(2.5)} updateWeight={setValue} weight={value} allowNegative />
            )}
          </CardioValueTile>
        )}
        {blueprint.trackSteps && (
          <CardioValueTile
            value={set.steps}
            emptyValue={0}
            format={(steps) => steps.toString()}
            label={t('exercise.steps.label')}
            testID="cardio-steps-tile"
            onSave={(steps) => updateSet((s) => s.with({ steps }))}
          >
            {(value, setValue) => <IntegerEditor style={{ flex: 1 }} value={value} onChange={setValue} />}
          </CardioValueTile>
        )}
        {set.tracksDuration && !isReadonly && (
          <FocusRing
            isSelected={props.toStartNext && !set.isTimerRunning}
            padding={0}
            radius={rounding.roundedRectangleFocusRingRadius}
          >
            <CardioTimerButton
              isTimerRunning={set.isTimerRunning}
              onStart={props.onStartTimer}
              onStop={props.onStopTimer}
            />
          </FocusRing>
        )}
      </View>
    </View>
  );
}

function CardioDurationTile(props: {
  duration: Duration | undefined;
  isTimerRunning: boolean;
  onSave: (duration: Duration) => void;
}) {
  const { t } = useTranslate();
  return (
    <CardioValueTile
      value={props.duration}
      emptyValue={Duration.ZERO}
      format={formatDuration}
      label={t('generic.time.label')}
      testID="cardio-duration-tile"
      dialogStyle={{ flexDirection: 'column', alignItems: 'stretch' }}
      onSave={props.onSave}
    >
      {(value, setValue) => (
        <DurationEditor duration={value} showHours onDurationUpdated={setValue} readonly={props.isTimerRunning} />
      )}
    </CardioValueTile>
  );
}

function CardioDistanceTile(props: {
  distance: Distance | undefined;
  emptyValue: Distance;
  onSave: (distance: Distance) => void;
}) {
  const { t } = useTranslate();
  const units: DistanceUnit[] = ['kilometre', 'metre', 'mile', 'yard'];
  return (
    <CardioValueTile
      value={props.distance}
      emptyValue={props.emptyValue}
      format={(distance) => localeFormatBigNumber(distance.value) + getShortUnit(distance.unit)}
      label={t('exercise.distance.label')}
      testID="cardio-distance-tile"
      onSave={props.onSave}
    >
      {(value, setValue) => (
        <>
          <DecimalEditor
            style={{ flex: 1 }}
            value={value.value}
            onChange={(distanceValue) => setValue({ ...value, value: distanceValue })}
          />
          <Menu
            trigger={(open) => (
              <IconButton onPress={open} mode="outlined" icon={() => <Text>{getShortUnit(value.unit)}</Text>} />
            )}
            items={units.map((unit) => ({
              label: unit,
              onPress: () => setValue({ ...value, unit }),
            }))}
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
      <Text variant="bodyLarge">
        <T keyName={isDistance ? 'exercise.target_distance.label' : 'exercise.target_time.label'} />
      </Text>
      <Text variant="bodyLarge" style={{ color: colors.primary }}>
        {props.target.type === 'distance'
          ? localeFormatBigNumber(props.target.value.value) + getShortUnit(props.target.value.unit)
          : formatDuration(props.target.value)}
      </Text>
    </View>
  );
}
