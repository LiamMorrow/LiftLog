import {
  RecordedCardioExercise,
  RecordedCardioExerciseSet,
} from '@/models/session-models';
import ExerciseSection from '@/components/presentation/exercise-section';
import {
  CardioTarget,
  Distance,
  DistanceCardioTarget,
  DistanceUnit,
  TimeCardioTarget,
} from '@/models/blueprint-models';
import { T, TranslationKey, useTranslate } from '@tolgee/react';
import { localeFormatBigNumber } from '@/utils/locale-bignumber';
import { useState } from 'react';
import { Duration, OffsetDateTime } from '@js-joda/core';
import Reanimated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from 'react-native-reanimated';
import { View } from 'react-native';
import IconButton from '@/components/presentation/gesture-wrappers/icon-button';
import { rounding, spacing, useAppTheme } from '@/hooks/useAppTheme';
import { Menu, Text } from 'react-native-paper';
import BigNumber from 'bignumber.js';
import { useAppSelector } from '@/store';
import { isNotNullOrUndefinedOrFalse } from '@/utils/null';
import { CardioTimer } from '@/components/presentation/cardio/CardioTimer';
import { CardioResistanceTracker } from '@/components/presentation/cardio/CardioResistanceTracker';
import { CardioInclineTracker } from '@/components/presentation/cardio/CardioInclineTracker';
import { formatDuration } from '@/utils/format-duration';
import { getShortUnit } from '@/utils/unit';
import { DecimalEditor } from '@/components/presentation/DecimalEditor';
import { CardioValueSelector } from '@/components/presentation/cardio/CardioValueSelector';
import FocusRing from '@/components/presentation/focus-ring';
import { Weight } from '@/models/weight';
import { CardioWeightTracker } from '@/components/presentation/cardio/CardioWeightTracker';
import { usePreferredWeightUnit } from '@/hooks/usePreferredWeightUnit';
import { CardioStepsTracker } from '@/components/presentation/cardio/CardioStepsTracker';

type CardioExerciseSetCallback<T> = (value: T) => void;
type CardioExerciseCallback<T> = (value: T, setIndex: number) => void;

interface CardioExerciseProps {
  recordedExercise: RecordedCardioExercise;
  previousRecordedExercises: RecordedCardioExercise[];
  toStartNext: boolean;
  isReadonly: boolean;
  showPreviousButton: boolean;

  setCurrentBlockStartTime: CardioExerciseCallback<OffsetDateTime | undefined>;
  updateDuration: CardioExerciseCallback<Duration | undefined>;
  updateDistance: CardioExerciseCallback<Distance | undefined>;
  updateIncline: CardioExerciseCallback<BigNumber | undefined>;
  updateWeight: CardioExerciseCallback<Weight | undefined>;
  updateSteps: CardioExerciseCallback<number | undefined>;
  updateResistance: CardioExerciseCallback<BigNumber | undefined>;
  updateNotesForExercise: (notes: string) => void;
  onOpenLink: () => void;
  onEditExercise: () => void;
  onRemoveExercise: () => void;
}

export function CardioExercise(props: CardioExerciseProps) {
  const setCallback =
    <T,>(
      cb: CardioExerciseCallback<T>,
      setIndex: number,
    ): CardioExerciseSetCallback<T> =>
    (val) =>
      cb(val, setIndex);
  return (
    <ExerciseSection
      recordedExercise={props.recordedExercise}
      previousRecordedExercises={props.previousRecordedExercises}
      toStartNext={props.toStartNext}
      isReadonly={props.isReadonly}
      showPreviousButton={props.showPreviousButton}
      updateNotesForExercise={props.updateNotesForExercise}
      onOpenLink={props.onOpenLink}
      onEditExercise={props.onEditExercise}
      onRemoveExercise={props.onRemoveExercise}
    >
      <View style={{ gap: spacing[4] }}>
        {props.recordedExercise.sets.map((set, setIndex) => (
          <CardioExerciseSet
            set={set}
            key={setIndex}
            toStartNext={
              props.toStartNext &&
              (props.recordedExercise.sets[setIndex - 1]?.isCompletelyFilled ??
                true)
            }
            setCurrentBlockStartTime={setCallback(
              props.setCurrentBlockStartTime,
              setIndex,
            )}
            updateDuration={setCallback(props.updateDuration, setIndex)}
            updateDistance={setCallback(props.updateDistance, setIndex)}
            updateWeight={setCallback(props.updateWeight, setIndex)}
            updateSteps={setCallback(props.updateSteps, setIndex)}
            updateIncline={setCallback(props.updateIncline, setIndex)}
            updateResistance={setCallback(props.updateResistance, setIndex)}
          />
        ))}
      </View>
    </ExerciseSection>
  );
}

interface CardioExerciseSetProps {
  set: RecordedCardioExerciseSet;
  toStartNext: boolean;

  setCurrentBlockStartTime: CardioExerciseSetCallback<
    OffsetDateTime | undefined
  >;
  updateDuration: CardioExerciseSetCallback<Duration | undefined>;
  updateDistance: CardioExerciseSetCallback<Distance | undefined>;
  updateWeight: CardioExerciseSetCallback<Weight | undefined>;
  updateSteps: CardioExerciseSetCallback<number | undefined>;
  updateIncline: CardioExerciseSetCallback<BigNumber | undefined>;
  updateResistance: CardioExerciseSetCallback<BigNumber | undefined>;
}

function CardioExerciseSet(props: CardioExerciseSetProps) {
  const timer = props.set.duration && (
    <CardioTimer
      currentBlockStartTime={props.set.currentBlockStartTime}
      setCurrentBlockStartTime={props.setCurrentBlockStartTime}
      set={props.set}
      updateDuration={props.updateDuration}
    />
  );
  const distanceTracker = props.set.distance && (
    <CardioDistanceTracker
      distance={props.set.distance}
      updateDistance={props.updateDistance}
    />
  );
  const inclineTracker = props.set.incline && (
    <CardioInclineTracker
      incline={props.set.incline}
      updateIncline={props.updateIncline}
    />
  );
  const resistanceTracker = props.set.resistance && (
    <CardioResistanceTracker
      resistance={props.set.resistance}
      updateResistance={props.updateResistance}
    />
  );
  const weightTracker = props.set.weight && (
    <CardioWeightTracker
      weight={props.set.weight}
      updateWeight={props.updateWeight}
    />
  );
  const stepsTracker = props.set.steps !== undefined && (
    <CardioStepsTracker
      steps={props.set.steps}
      updateSteps={props.updateSteps}
    />
  );
  return (
    <View style={{ gap: spacing[4] }}>
      <CardioTargetHandler target={props.set.blueprint.target} />
      <Reanimated.View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: spacing[2],
        }}
      >
        {timer}
        {distanceTracker}
        {inclineTracker}
        {resistanceTracker}
        {weightTracker}
        {stepsTracker}
        <AddTrackerButtonMenu
          set={props.set}
          toStartNext={props.toStartNext}
          updateDistance={props.updateDistance}
          updateDuration={props.updateDuration}
          updateIncline={props.updateIncline}
          updateResistance={props.updateResistance}
          updateWeight={props.updateWeight}
          updateSteps={props.updateSteps}
        />
      </Reanimated.View>
    </View>
  );
}

function AddTrackerButtonMenu(props: {
  set: RecordedCardioExerciseSet;
  toStartNext: boolean;

  updateDuration: CardioExerciseSetCallback<Duration | undefined>;
  updateDistance: CardioExerciseSetCallback<Distance | undefined>;
  updateIncline: CardioExerciseSetCallback<BigNumber | undefined>;
  updateWeight: CardioExerciseSetCallback<Weight | undefined>;
  updateSteps: CardioExerciseSetCallback<number | undefined>;
  updateResistance: CardioExerciseSetCallback<BigNumber | undefined>;
}) {
  const { t } = useTranslate();
  const imperialByDefault = useAppSelector((x) => x.settings.useImperialUnits);
  const preferredWeightUnit = usePreferredWeightUnit();
  const {
    set,
    toStartNext,
    updateDistance,
    updateDuration,
    updateIncline,
    updateResistance,
    updateSteps,
    updateWeight,
  } = props;
  const { blueprint } = set;
  const [menuOpen, setMenuOpen] = useState(false);

  const distanceTarget = (blueprint.target.type === 'distance' &&
    blueprint.target.value) || {
    value: BigNumber(0),
    unit: imperialByDefault ? 'mile' : 'kilometre',
  };

  const menuItem = (
    name: string,
    labelKey: TranslationKey,
    action: () => void,
  ) => (
    <Menu.Item
      key={name}
      title={t(labelKey)}
      testID={'add-tracker-menu-' + name}
      onPress={() => {
        setMenuOpen(false);
        action();
      }}
    />
  );

  const menuItems = [
    !set.distance &&
      (blueprint.trackDistance || blueprint.target.type === 'distance') &&
      menuItem('distance', 'exercise.distance.label', () =>
        updateDistance(distanceTarget),
      ),

    !set.duration &&
      (blueprint.trackDuration || blueprint.target.type === 'time') &&
      menuItem('time', 'generic.time.label', () =>
        updateDuration(Duration.ZERO),
      ),

    !set.incline &&
      blueprint.trackIncline &&
      menuItem('incline', 'exercise.incline.label', () =>
        updateIncline(BigNumber(0)),
      ),

    !set.resistance &&
      blueprint.trackResistance &&
      menuItem('resistance', 'exercise.resistance.label', () =>
        updateResistance(BigNumber(0)),
      ),

    !set.weight &&
      blueprint.trackWeight &&
      menuItem('weight', 'weight.weight.label', () =>
        updateWeight(new Weight(0, preferredWeightUnit)),
      ),

      blueprint.trackSteps &&
      menuItem('steps', 'exercise.steps.label', () => updateSteps(0)),
  ].filter(isNotNullOrUndefinedOrFalse);
  const showAddButton = !!menuItems.length;
  if (!showAddButton) {
    return undefined;
  }
  return (
    <Reanimated.View
      entering={FadeIn}
      exiting={FadeOut}
      layout={LinearTransition}
    >
      <Menu
        visible={menuOpen}
        style={{ justifyContent: 'center' }}
        onDismiss={() => setMenuOpen(false)}
        anchor={
          <FocusRing
            isSelected={toStartNext}
            padding={0}
            radius={rounding.roundedRectangleFocusRingRadius}
          >
            <IconButton
              style={{ borderRadius: rounding.roundedRectangleRadius }}
              testID="add-tracker-button"
              icon={'plus'}
              mode="contained"
              onPress={() => setMenuOpen(true)}
            />
          </FocusRing>
        }
      >
        {menuItems}
      </Menu>
    </Reanimated.View>
  );
}

function CardioDistanceTracker({
  distance,
  updateDistance,
}: {
  distance: Distance;
  updateDistance: (distance: Distance | undefined) => void;
}) {
  const { t } = useTranslate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialogValue, setDialogValue] = useState(distance);
  const getMenuItem = (unit: DistanceUnit) => (
    <Menu.Item
      key={unit}
      title={unit}
      onPress={() => {
        setMenuOpen(false);
        setDialogValue((dv) => ({ ...dv, unit }));
      }}
    />
  );
  return (
    <CardioValueSelector
      buttonText={
        localeFormatBigNumber(distance.value) + getShortUnit(distance.unit)
      }
      label={t('exercise.distance.label')}
      onButtonPress={() => setDialogValue(distance)}
      onSave={() => updateDistance(dialogValue)}
      onHold={() => updateDistance(undefined)}
    >
      <DecimalEditor
        style={{ flex: 1 }}
        value={dialogValue.value}
        onChange={(value) => setDialogValue((dv) => ({ ...dv, value }))}
      />
      <Menu
        visible={menuOpen}
        onDismiss={() => setMenuOpen(false)}
        anchor={
          <IconButton
            onPress={() => {
              setMenuOpen(true);
            }}
            mode="outlined"
            icon={() => <Text>{getShortUnit(dialogValue.unit)}</Text>}
          />
        }
      >
        {getMenuItem('kilometre')}
        {getMenuItem('metre')}
        {getMenuItem('mile')}
        {getMenuItem('yard')}
      </Menu>
    </CardioValueSelector>
  );
}

function CardioTargetHandler(props: { target: CardioTarget }) {
  if (props.target.type === 'distance') {
    return <DistanceCardioTargetHandler target={props.target} />;
  }
  return <TimeCardioTargetHandler target={props.target} />;
}

function DistanceCardioTargetHandler(props: { target: DistanceCardioTarget }) {
  const { colors } = useAppTheme();
  return (
    <View style={{ flexDirection: 'row', gap: spacing[2] }}>
      <Text variant="bodyLarge">
        <T keyName="exercise.target_distance.label" />
      </Text>
      <Text variant="bodyLarge" style={{ color: colors.primary }}>
        {localeFormatBigNumber(props.target.value.value) +
          getShortUnit(props.target.value.unit)}
      </Text>
    </View>
  );
}

function TimeCardioTargetHandler(props: { target: TimeCardioTarget }) {
  const { colors } = useAppTheme();
  return (
    <View style={{ flexDirection: 'row', gap: spacing[2] }}>
      <Text variant="bodyLarge">
        <T keyName="exercise.target_time.label" />
      </Text>
      <Text variant="bodyLarge" style={{ color: colors.primary }}>
        {formatDuration(props.target.value)}
      </Text>
    </View>
  );
}
