import { CardioTrackerCard } from '@/components/presentation/cardio/CardioTrackerCard';
import IconButton from '@/components/presentation/gesture-wrappers/icon-button';
import TimerEditor from '@/components/presentation/timer-editor';
import { useAppTheme, spacing, rounding } from '@/hooks/useAppTheme';
import { RecordedCardioExercise } from '@/models/session-models';
import { Duration, OffsetDateTime } from '@js-joda/core';
import { useState, useCallback, useEffect } from 'react';
import { useAnimatedValue, Animated, View } from 'react-native';
import { match, P } from 'ts-pattern';

export function CardioTimer({
  recordedExercise,
  currentBlockStartTime,
  setCurrentBlockStartTime,
  updateDuration,
}: {
  recordedExercise: RecordedCardioExercise;
  currentBlockStartTime: OffsetDateTime | undefined;

  setCurrentBlockStartTime: (val: OffsetDateTime | undefined) => void;
  updateDuration: (duration: Duration | undefined) => void;
}) {
  const playPauseButtonSize = 24;
  const { colors } = useAppTheme();
  const animatedRadius = useAnimatedValue(40);

  const getTimerState = useCallback(
    (providedDuration: Duration | undefined) => {
      const now = OffsetDateTime.now();
      const duration = match({
        recordedDuration: providedDuration,
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
    },
    [currentBlockStartTime],
  );
  const [timerState, setTimerState] = useState<Duration>(
    getTimerState(recordedExercise.duration),
  );
  const handlePlay = () => {
    const now = OffsetDateTime.now();
    setCurrentBlockStartTime(now);
  };
  const handlePause = () => {
    if (!currentBlockStartTime) {
      return;
    }
    const now = OffsetDateTime.now();
    setCurrentBlockStartTime(undefined);

    updateDuration(
      Duration.between(currentBlockStartTime, now).plus(
        recordedExercise.duration ?? Duration.ZERO,
      ),
    );
  };

  const handlePlayPause = () => {
    const toValue = currentBlockStartTime
      ? playPauseButtonSize
      : rounding.roundedRectangleRadius;
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

  // Update timer
  useEffect(() => {
    if (currentBlockStartTime) {
      const timer = setInterval(() => {
        const state = getTimerState(recordedExercise.duration);
        setTimerState(state);
      }, 200);
      return () => clearInterval(timer);
    }
  }, [currentBlockStartTime, getTimerState, recordedExercise.duration]);

  // Periodically persist - This will cyclically update the duration and it is a dependency, so it implicitly retriggers
  useEffect(() => {
    if (currentBlockStartTime) {
      const interval = setTimeout(() => {
        const now = OffsetDateTime.now();
        setCurrentBlockStartTime(now);
        updateDuration(
          Duration.between(currentBlockStartTime, now).plus(
            recordedExercise.duration ?? Duration.ZERO,
          ),
        );
      }, 5000);
      return () => clearTimeout(interval);
    }
  }, [
    currentBlockStartTime,
    updateDuration,
    recordedExercise.duration,
    setCurrentBlockStartTime,
  ]);

  return (
    <CardioTrackerCard onHold={() => updateDuration(undefined)}>
      <View style={{ alignItems: 'center', gap: spacing[2] }}>
        <TimerEditor
          readonly={!!currentBlockStartTime}
          duration={timerState}
          onDurationUpdated={(d) => {
            updateDuration(d);
            const state = getTimerState(d);
            setTimerState(state);
          }}
        />
        <IconButton
          icon={currentBlockStartTime ? 'pause' : 'playArrow'}
          animated
          size={playPauseButtonSize}
          testID="cardio-timer-play-pause"
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
