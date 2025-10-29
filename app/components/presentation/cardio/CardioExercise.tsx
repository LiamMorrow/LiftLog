import { RecordedCardioExercise } from '@/models/session-models';
import ExerciseSection from '@/components/presentation/exercise-section';
import {
  CardioTarget,
  Distance,
  DistanceCardioTarget,
  DistanceUnit,
  TimeCardioTarget,
} from '@/models/blueprint-models';
import { T, useTranslate } from '@tolgee/react';
import { localeFormatBigNumber } from '@/utils/locale-bignumber';
import { useState } from 'react';
import { Duration } from '@js-joda/core';
import Reanimated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from 'react-native-reanimated';
import { View } from 'react-native';
import IconButton from '@/components/presentation/gesture-wrappers/icon-button';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
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

interface CardioExerciseProps {
  recordedExercise: RecordedCardioExercise;
  previousRecordedExercises: RecordedCardioExercise[];
  toStartNext: boolean;
  isReadonly: boolean;
  showPreviousButton: boolean;

  updateDuration: (duration: Duration | undefined) => void;
  updateDistance: (distance: Distance | undefined) => void;
  updateIncline: (incline: BigNumber | undefined) => void;
  updateResistance: (resistance: BigNumber | undefined) => void;
  updateNotesForExercise: (notes: string) => void;
  onOpenLink: () => void;
  onEditExercise: () => void;
  onRemoveExercise: () => void;
}

export function CardioExercise(props: CardioExerciseProps) {
  const timer = props.recordedExercise.duration && (
    <CardioTimer
      recordedExercise={props.recordedExercise}
      updateDuration={props.updateDuration}
    />
  );
  const distanceTracker = props.recordedExercise.distance && (
    <CardioDistanceTracker
      distance={props.recordedExercise.distance}
      updateDistance={props.updateDistance}
    />
  );
  const inclineTracker = props.recordedExercise.incline && (
    <CardioInclineTracker
      incline={props.recordedExercise.incline}
      updateIncline={props.updateIncline}
    />
  );
  const resistanceTracker = props.recordedExercise.resistance && (
    <CardioResistanceTracker
      resistance={props.recordedExercise.resistance}
      updateResistance={props.updateResistance}
    />
  );
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
        <CardioTargetHandler target={props.recordedExercise.blueprint.target} />
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
          <AddTrackerButtonMenu
            recordedExercise={props.recordedExercise}
            updateDistance={props.updateDistance}
            updateDuration={props.updateDuration}
            updateIncline={props.updateIncline}
            updateResistance={props.updateResistance}
          />
        </Reanimated.View>
      </View>
    </ExerciseSection>
  );
}

function AddTrackerButtonMenu(props: {
  recordedExercise: RecordedCardioExercise;
  updateDuration: (duration: Duration | undefined) => void;
  updateDistance: (distance: Distance | undefined) => void;
  updateIncline: (incline: BigNumber | undefined) => void;
  updateResistance: (updateResistance: BigNumber | undefined) => void;
}) {
  const { t } = useTranslate();
  const imperialByDefault = useAppSelector((x) => x.settings.useImperialUnits);
  const {
    recordedExercise,
    updateDistance,
    updateDuration,
    updateIncline,
    updateResistance,
  } = props;
  const { blueprint } = recordedExercise;
  const [menuOpen, setMenuOpen] = useState(false);

  const distanceTarget = (blueprint.target.type === 'distance' &&
    blueprint.target.value) || {
    value: BigNumber(0),
    unit: imperialByDefault ? 'mile' : 'kilometre',
  };

  const menuItem = (name: string, action: () => void) => (
    <Menu.Item
      key={name}
      title={name}
      onPress={() => {
        setMenuOpen(false);
        action();
      }}
    />
  );

  const menuItems = [
    !recordedExercise.distance &&
      (blueprint.trackDistance || blueprint.target.type === 'distance') &&
      menuItem(t('Distance'), () => updateDistance(distanceTarget)),

    !recordedExercise.duration &&
      (blueprint.trackDuration || blueprint.target.type === 'time') &&
      menuItem(t('Time'), () => updateDuration(Duration.ZERO)),

    !recordedExercise.incline &&
      blueprint.trackIncline &&
      menuItem(t('Incline'), () => updateIncline(BigNumber(0))),

    !recordedExercise.resistance &&
      blueprint.trackResistance &&
      menuItem(t('Resistance'), () => updateResistance(BigNumber(0))),
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
          <IconButton
            icon={'plus'}
            mode="contained"
            onPress={() => setMenuOpen(true)}
          />
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
      label={t('Distance')}
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
        <T keyName="Target distance" />
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
        <T keyName="Target time" />
      </Text>
      <Text variant="bodyLarge" style={{ color: colors.primary }}>
        {formatDuration(props.target.value)}
      </Text>
    </View>
  );
}
