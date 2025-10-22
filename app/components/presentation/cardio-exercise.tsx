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
import {
  localeFormatBigNumber,
  localeParseBigNumber,
} from '@/utils/locale-bignumber';
import { match, P } from 'ts-pattern';
import { ReactNode, useEffect, useState } from 'react';
import { Duration, LocalDateTime } from '@js-joda/core';
import Reanimated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from 'react-native-reanimated';
import {
  Animated,
  StyleSheet,
  TextInput,
  useAnimatedValue,
  View,
} from 'react-native';
import TimerEditor from '@/components/presentation/timer-editor';
import IconButton from '@/components/presentation/gesture-wrappers/icon-button';
import { font, spacing, useAppTheme } from '@/hooks/useAppTheme';
import { Card, Menu, Text } from 'react-native-paper';
import BigNumber from 'bignumber.js';
import { useAppSelector } from '@/store';
import { isNotNullOrUndefinedOrFalse } from '@/utils/null';
import Holdable from '@/components/presentation/holdable';

interface CardioExerciseProps {
  recordedExercise: RecordedCardioExercise;
  previousRecordedExercises: RecordedCardioExercise[];
  toStartNext: boolean;
  isReadonly: boolean;
  showPreviousButton: boolean;

  updateStartedAt: (startedAt: LocalDateTime | undefined) => void;
  updateDuration: (duration: Duration | undefined) => void;
  updateDistance: (distance: Distance | undefined) => void;
  updateIncline: (incline: BigNumber | undefined) => void;
  updateResistance: (resistance: BigNumber | undefined) => void;
  updateNotesForExercise: (notes: string) => void;
  onOpenLink: () => void;
  onEditExercise: () => void;
  onRemoveExercise: () => void;
}

export default function CardioExercise(props: CardioExerciseProps) {
  const timer = props.recordedExercise.duration && (
    <CardioTimer
      recordedExercise={props.recordedExercise}
      updateStartedAt={props.updateStartedAt}
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

function CardioTimer({
  recordedExercise,
  updateDuration,
  updateStartedAt,
}: {
  recordedExercise: RecordedCardioExercise;
  updateStartedAt: (startedAt: LocalDateTime | undefined) => void;
  updateDuration: (duration: Duration | undefined) => void;
}) {
  const playPauseButtonSize = 34;
  const { colors } = useAppTheme();
  const animatedRadius = useAnimatedValue(40);
  const [currentBlockStartTime, setCurrentBlockStartTime] = useState<
    LocalDateTime | undefined
  >();

  const getTimerState = () => {
    const now = LocalDateTime.now();
    const duration = match({
      recordedDuration: recordedExercise.duration,
      currentBlockStartTime,
    })
      .with(
        {
          recordedDuration: P.nonNullable,
          currentBlockStartTime: P.nonNullable,
        },
        ({ recordedDuration, currentBlockStartTime }) =>
          recordedDuration.plus(Duration.between(currentBlockStartTime, now)),
      )
      .with(
        { recordedDuration: P.nonNullable },
        ({ recordedDuration }) => recordedDuration,
      )
      .with(
        { currentBlockStartTime: P.nonNullable },
        ({ currentBlockStartTime }) =>
          Duration.between(currentBlockStartTime, now),
      )
      .with(
        { currentBlockStartTime: undefined, recordedDuration: undefined },
        () => Duration.ZERO,
      )
      .exhaustive();

    return duration;
  };
  const [timerState, setTimerState] = useState<Duration>(getTimerState());
  const handlePlay = () => {
    const now = LocalDateTime.now();
    setCurrentBlockStartTime(now);
    if (!recordedExercise.startedAt) {
      updateStartedAt(now);
    }
  };
  const handlePause = () => {
    if (!currentBlockStartTime) {
      return;
    }
    const now = LocalDateTime.now();
    setCurrentBlockStartTime(undefined);

    updateDuration(
      Duration.between(currentBlockStartTime, now).plus(
        recordedExercise.duration ?? Duration.ZERO,
      ),
    );
  };

  const handlePlayPause = () => {
    const toValue = currentBlockStartTime ? playPauseButtonSize : 10;
    if (currentBlockStartTime) {
      handlePause();
    } else {
      handlePlay();
    }

    Animated.timing(animatedRadius, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const state = getTimerState();
      setTimerState(state);
    }, 200);
    return () => clearInterval(timer);
  });

  return (
    <CardioTrackerCard onHold={() => updateDuration(undefined)}>
      <View style={{ alignItems: 'center', gap: spacing[2] }}>
        <TimerEditor
          readonly={!!currentBlockStartTime}
          duration={timerState}
          onDurationUpdated={(d) => updateDuration(d)}
        />
        <IconButton
          icon={currentBlockStartTime ? 'pause' : 'playArrow'}
          animated
          size={playPauseButtonSize}
          onPress={handlePlayPause}
          containerColor={currentBlockStartTime ? colors.amber : colors.green}
          iconColor={currentBlockStartTime ? colors.onAmber : colors.onGreen}
          style={{
            borderRadius: animatedRadius,
          }}
          mode="contained-tonal"
        />
      </View>
    </CardioTrackerCard>
  );
}
function CardioResistanceTracker({
  resistance,
  updateResistance,
}: {
  resistance: BigNumber;
  updateResistance: (resistance: BigNumber | undefined) => void;
}) {
  return (
    <CardioTrackerCard onHold={() => updateResistance(undefined)}>
      <DecimalEditor
        value={resistance}
        onChange={(value) => updateResistance(value)}
      />
      <Text style={styles.bigText}>
        <T keyName="resistance" />
      </Text>
    </CardioTrackerCard>
  );
}
function CardioInclineTracker({
  incline,
  updateIncline,
}: {
  incline: BigNumber;
  updateIncline: (incline: BigNumber | undefined) => void;
}) {
  return (
    <CardioTrackerCard onHold={() => updateIncline(undefined)}>
      <DecimalEditor
        value={incline}
        onChange={(value) => updateIncline(value)}
      />
      <Text style={styles.bigText}>
        <T keyName="incline" />
      </Text>
    </CardioTrackerCard>
  );
}

function CardioTrackerCard(props: { onHold: () => void; children: ReactNode }) {
  return (
    <Holdable
      onLongPress={props.onHold}
      style={{ alignSelf: 'stretch' }}
      entering={FadeIn}
      exiting={FadeOut}
      layout={LinearTransition}
    >
      <Card
        mode="contained"
        container={false} // needed to allow container to grow to fit stretched card
        style={{ flex: 1 }}
        contentStyle={{ flex: 1 }}
      >
        <Card.Content
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing[2],
            flex: 1,
          }}
        >
          {props.children}
        </Card.Content>
      </Card>
    </Holdable>
  );
}

function CardioDistanceTracker({
  distance,
  updateDistance,
}: {
  distance: Distance;
  updateDistance: (distance: Distance | undefined) => void;
}) {
  const { colors } = useAppTheme();
  return (
    <CardioTrackerCard onHold={() => updateDistance(undefined)}>
      <DecimalEditor
        value={distance.value}
        onChange={(value) => updateDistance({ value, unit: distance.unit })}
      />
      <Text style={[styles.bigText, { color: colors.onSecondaryContainer }]}>
        {distance.unit}s
      </Text>
    </CardioTrackerCard>
  );
}

interface DecimalEditorProps {
  value: BigNumber;
  onChange: (val: BigNumber) => void;
  testID?: string;
}

function DecimalEditor(props: DecimalEditorProps) {
  const { value, onChange } = props;
  const { colors } = useAppTheme();
  const [text, setText] = useState(localeFormatBigNumber(props.value) || '-');
  const [editorValue, setEditorValue] = useState(value);

  const handleTextChange = (text: string) => {
    setText(text);
    if (text.trim() === '') {
      setEditorValue(BigNumber(0));
      onChange(BigNumber(0));
      return;
    }

    const parsed = localeParseBigNumber(text);
    if (!parsed.isNaN()) {
      setEditorValue(parsed);
      onChange(parsed);
      return;
    }
  };
  useEffect(() => {
    if (!editorValue.eq(value)) {
      setText(localeFormatBigNumber(value) || '0');
      setEditorValue(value);
    }
  }, [value, editorValue]);
  return (
    <TextInput
      testID={props.testID}
      value={text}
      style={[styles.bigText, { color: colors.primary }]}
      inputMode={'decimal'}
      keyboardType={'decimal-pad'}
      onChangeText={handleTextChange}
      selectTextOnFocus
      onBlur={() => {
        if (text === '') {
          setText('0');
        }
        onChange(editorValue);
      }}
    />
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

function getShortUnit(unit: DistanceUnit): string {
  return match(unit)
    .with('metre', () => 'm')
    .with('kilometre', () => 'km')
    .with('mile', () => 'mi')
    .with('yard', () => 'yd')
    .exhaustive();
}

// Function to format time in m:ss format
function formatDuration(duration: Duration | undefined): string {
  if (!duration) {
    return '-:-:-';
  }
  const totalSeconds = Math.floor(duration.toMillis() / 1000);
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const hours = Math.floor(totalSeconds / 60 / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  bigText: {
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
    ...font['text-xl'],
  },
});
