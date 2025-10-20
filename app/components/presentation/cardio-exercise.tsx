import { RecordedCardioExercise } from '@/models/session-models';
import ExerciseSection from '@/components/presentation/exercise-section';
import {
  CardioTarget,
  DistanceCardioTarget,
  DistanceUnit,
  TimeCardioTarget,
} from '@/models/blueprint-models';
import { T, useTranslate } from '@tolgee/react';
import { localeFormatBigNumber } from '@/utils/locale-bignumber';
import { match, P } from 'ts-pattern';
import LimitedHtml from '@/components/presentation/limited-html';
import { useEffect, useState } from 'react';
import { Duration, LocalDateTime } from '@js-joda/core';
import { Animated, useAnimatedValue, View } from 'react-native';
import TimerEditor from '@/components/presentation/timer-editor';
import IconButton from '@/components/presentation/gesture-wrappers/icon-button';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { Card, Text } from 'react-native-paper';

interface CardioExerciseProps {
  recordedExercise: RecordedCardioExercise;
  previousRecordedExercises: RecordedCardioExercise[];
  toStartNext: boolean;
  isReadonly: boolean;
  showPreviousButton: boolean;

  updateStartedAt: (startedAt: LocalDateTime | undefined) => void;
  updateDuration: (duration: Duration | undefined) => void;
  updateNotesForExercise: (notes: string) => void;
  onOpenLink: () => void;
  onEditExercise: () => void;
  onRemoveExercise: () => void;
}

export default function CardioExercise(props: CardioExerciseProps) {
  const showTimer =
    props.recordedExercise.blueprint.trackTime ||
    props.recordedExercise.blueprint.target.type === 'time';
  const timer = showTimer && (
    <CardioTimer
      recordedExercise={props.recordedExercise}
      updateStartedAt={props.updateStartedAt}
      updateDuration={props.updateDuration}
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
        {timer}
      </View>
    </ExerciseSection>
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
    <Card mode="contained" style={{ alignSelf: 'flex-start' }}>
      <Card.Content>
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
      </Card.Content>
    </Card>
  );
}

function CardioTargetHandler(props: { target: CardioTarget }) {
  if (props.target.type === 'distance') {
    return <DistanceCardioTargetHandler target={props.target} />;
  }
  return <TimeCardioTargetHandler target={props.target} />;
}

function DistanceCardioTargetHandler(props: { target: DistanceCardioTarget }) {
  const { t } = useTranslate();
  return (
    <LimitedHtml
      value={t('Target distance {distance}', {
        distance:
          localeFormatBigNumber(props.target.value) +
          getShortUnit(props.target.unit),
      })}
    />
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
