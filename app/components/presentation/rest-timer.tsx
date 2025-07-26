import React, { useCallback, useEffect, useState } from 'react';
import { ColorChoice, spacing, useAppTheme } from '@/hooks/useAppTheme';
// Using Tolgee for localization
import { Rest } from '@/models/session-models';
import { Duration, LocalDateTime } from '@js-joda/core';
import Svg, { Path } from 'react-native-svg';
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
  // Removed unused firstProgressBarWidthPercentage

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
  const pillHeight = spacing[14];
  const pillWidth = pillHeight * 2.2;
  const radius = (pillHeight - 6) / 2;
  const straightLength = pillWidth - pillHeight;
  const pillPerimeter = 2 * straightLength + 2 * Math.PI * radius;

  return (
    <View
      style={{
        width: pillWidth,
        height: pillHeight,
        overflow: 'hidden',
        borderRadius: pillHeight,
        borderColor: colors.outlineVariant,
        borderWidth: 1,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Circular progress bar wrapping the border */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Svg width={pillWidth} height={pillHeight}>
          {/* Background rounded rectangle */}
          <Path
            d={`M${3 + pillHeight / 2 - 3},3
                h${pillWidth - pillHeight + 0}
                a${pillHeight / 2 - 3},${pillHeight / 2 - 3} 0 0 1 0,${pillHeight - 6}
                h-${pillWidth - pillHeight + 0}
                a${pillHeight / 2 - 3},${pillHeight / 2 - 3} 0 0 1 0,-${pillHeight - 6}
                z`}
            stroke={colors.outlineVariant}
            strokeWidth={6}
            fill="none"
          />
          {/* Primary progress bar (minRest/failureRest) */}
          <Path
            d={`M${3 + pillHeight / 2 - 3},3
                h${pillWidth - pillHeight + 0}
                a${pillHeight / 2 - 3},${pillHeight / 2 - 3} 0 0 1 0,${pillHeight - 6}
                h-${pillWidth - pillHeight + 0}
                a${pillHeight / 2 - 3},${pillHeight / 2 - 3} 0 0 1 0,-${pillHeight - 6}
                z`}
            stroke={colors.primary}
            strokeWidth={6}
            fill="none"
            strokeDasharray={pillPerimeter}
            strokeDashoffset={
              pillPerimeter * (1 - timerState.firstProgressBarProgress)
            }
          />
          {/* Orange progress bar (minRest to maxRest) */}
          {!failed && !isSameMinMaxRest && (
            <Path
              d={`M${3 + pillHeight / 2 - 3},3
                  h${pillWidth - pillHeight + 0}
                  a${pillHeight / 2 - 3},${pillHeight / 2 - 3} 0 0 1 0,${pillHeight - 6}
                  h-${pillWidth - pillHeight + 0}
                  a${pillHeight / 2 - 3},${pillHeight / 2 - 3} 0 0 1 0,-${pillHeight - 6}
                  z`}
              stroke={colors.orange}
              strokeWidth={6}
              fill="none"
              strokeDasharray={pillPerimeter}
              strokeDashoffset={
                pillPerimeter * (1 - timerState.secondProgressBarProgress)
              }
              opacity={timerState.secondProgressBarProgress > 0 ? 1 : 0}
            />
          )}
        </Svg>
      </View>
      <SurfaceText font="text-2xl" weight={'bold'} color={timerState.textColor}>
        {timerState.timeSinceStart}
      </SurfaceText>
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
