import React, { useCallback, useEffect, useState } from 'react';
import { ColorChoice, spacing, useAppTheme } from '@/hooks/useAppTheme';
// Using Tolgee for localization
import { Rest } from '@/models/session-models';
import { Duration, LocalDateTime } from '@js-joda/core';
import { ProgressBar } from 'react-native-paper';
import { View } from 'react-native';
import { SurfaceText } from '@/components/presentation/surface-text';

interface RestTimerProps {
  rest: Rest;
  startTime: LocalDateTime;
  failed: boolean;
}

export default function RestTimer({ rest, startTime, failed }: RestTimerProps) {
  const { colors } = useAppTheme();
  const isSameMinMaxRest = rest.minRest.equals(rest.maxRest);
  const firstProgressBarWidthPercentage =
    failed || isSameMinMaxRest
      ? 100
      : Math.round((rest.minRest.toMillis() / rest.maxRest.toMillis()) * 100);

  // Callback to get all timer-related values
  const getTimerState = useCallback(() => {
    const now = LocalDateTime.now();
    const diffMs = Duration.between(startTime, now);
    const timeSinceStart = formatTimeSpan(diffMs);
    const firstProgressBarProgress = failed
      ? Math.min(diffMs.toMillis() / rest.failureRest.toMillis(), 1)
      : Math.min(diffMs.toMillis() / rest.minRest.toMillis(), 1);
    const secondProgressBarProgress =
      failed || isSameMinMaxRest
        ? -1
        : Math.min(
            (diffMs.toMillis() - rest.minRest.toMillis()) /
              (rest.maxRest.toMillis() - rest.minRest.toMillis()),
            1,
          );
    const textColor: ColorChoice =
      firstProgressBarProgress < 1
        ? 'onSurface'
        : secondProgressBarProgress < 1 && secondProgressBarProgress !== -1
          ? 'primary'
          : 'error';
    return {
      timeSinceStart,
      firstProgressBarProgress,
      secondProgressBarProgress,
      textColor,
    };
  }, [startTime, rest, failed, isSameMinMaxRest]);

  const [timerState, setTimerState] = useState(getTimerState());

  // Timer effect to update all timer-related values every 200ms
  useEffect(() => {
    const timer = setInterval(() => {
      setTimerState(getTimerState());
    }, 200);
    return () => clearInterval(timer);
  }, [getTimerState]);

  return (
    <View
      style={{
        width: '30%',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        alignSelf: 'stretch',
        gap: spacing[0.5],
        backgroundColor: colors.surfaceContainer,
        borderRadius: spacing[2],
      }}
    >
      <SurfaceText font="text-2xl" weight={'bold'} color={timerState.textColor}>
        {timerState.timeSinceStart}
      </SurfaceText>
      <View style={{ flexDirection: 'row', position: 'absolute', bottom: 0 }}>
        <View style={{ width: `${firstProgressBarWidthPercentage}%` }}>
          <ProgressBar progress={timerState.firstProgressBarProgress} />
        </View>
        <View style={{ width: `${100 - firstProgressBarWidthPercentage}%` }}>
          <ProgressBar
            progress={timerState.secondProgressBarProgress}
            color={colors.orange}
          />
        </View>
      </View>
    </View>
  );
}

// Function to format time in m:ss format
function formatTimeSpan(ms: Duration): string {
  const totalSeconds = Math.floor(ms.toMillis() / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
