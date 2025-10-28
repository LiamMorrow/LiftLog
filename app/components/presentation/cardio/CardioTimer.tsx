import { CardioTrackerCard } from '@/components/presentation/cardio/CardioTrackerCard';
import IconButton from '@/components/presentation/gesture-wrappers/icon-button';
import TimerEditor from '@/components/presentation/timer-editor';
import { useAppTheme, spacing } from '@/hooks/useAppTheme';
import { RecordedCardioExercise } from '@/models/session-models';
import { LocalDateTime, Duration } from '@js-joda/core';
import { useState, useCallback, useEffect } from 'react';
import { useAnimatedValue, Animated, View } from 'react-native';
import { match, P } from 'ts-pattern';

export function CardioTimer({
  recordedExercise,
  updateDuration,
  updateStartedAt,
}: {
  recordedExercise: RecordedCardioExercise;
  updateStartedAt: (startedAt: LocalDateTime | undefined) => void;
  updateDuration: (duration: Duration | undefined) => void;
}) {
  const playPauseButtonSize = 20;
  const { colors } = useAppTheme();
  const animatedRadius = useAnimatedValue(40);
  const [currentBlockStartTime, setCurrentBlockStartTime] = useState<
    LocalDateTime | undefined
  >();

  const getTimerState = useCallback(() => {
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
  }, [currentBlockStartTime, recordedExercise.duration]);
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

  // Update timer
  useEffect(() => {
    if (currentBlockStartTime) {
      const timer = setInterval(() => {
        const state = getTimerState();
        setTimerState(state);
      }, 200);
      return () => clearInterval(timer);
    }
  }, [currentBlockStartTime, getTimerState]);

  // Periodically persist - This will cyclically update the duration and it is a dependency, so it implicitly retriggers
  useEffect(() => {
    if (currentBlockStartTime) {
      const interval = setTimeout(() => {
        const now = LocalDateTime.now();
        setCurrentBlockStartTime(now);
        updateDuration(
          Duration.between(currentBlockStartTime, now).plus(
            recordedExercise.duration ?? Duration.ZERO,
          ),
        );
      }, 5000);
      return () => clearTimeout(interval);
    }
  }, [currentBlockStartTime, updateDuration, recordedExercise.duration]);

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
