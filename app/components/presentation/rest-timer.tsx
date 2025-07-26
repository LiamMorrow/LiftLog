import React, { useCallback, useEffect, useState } from 'react';
import { ColorChoice, spacing, useAppTheme } from '@/hooks/useAppTheme';
// Using Tolgee for localization
import { Rest } from '@/models/session-models';
import { Duration, LocalDateTime } from '@js-joda/core';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
} from 'react-native-reanimated';
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
    const [textColor, backgroundColor]: [ColorChoice, ColorChoice] =
      firstProgressBarProgress < 1
        ? ['onTertiaryContainer', 'tertiaryContainer']
        : secondProgressBarProgress < 1 && secondProgressBarProgress !== -1
          ? ['onPrimaryContainer', 'primaryContainer']
          : ['error', 'errorContainer'];
    return {
      timeSinceStart,
      firstProgressBarProgress,
      secondProgressBarProgress,
      textColor,
      backgroundColor,
    };
  }, [startTime, rest, failed, isSameMinMaxRest]);

  const [timerState, setTimerState] = useState(getTimerState());

  // Reanimated shared values for smooth progress
  const primaryOffset = useSharedValue(0);
  const orangeOffset = useSharedValue(0);

  // Animated props for SVG paths
  const AnimatedPath = Animated.createAnimatedComponent(Path);
  const animatedPrimaryProps = useAnimatedProps(() => ({
    strokeDashoffset: primaryOffset.value,
  }));
  const animatedOrangeProps = useAnimatedProps(() => ({
    strokeDashoffset: orangeOffset.value,
  }));
  const pillHeight = spacing[14];
  const pillWidth = pillHeight * 2.2;
  const radius = (pillHeight - 6) / 2;
  const straightLength = pillWidth - pillHeight;
  const pillPerimeter = 2 * straightLength + 2 * Math.PI * radius;

  // Timer effect to update all timer-related values every 200ms
  useEffect(() => {
    const timer = setInterval(() => {
      const state = getTimerState();
      setTimerState(state);
      // Animate progress bars
      primaryOffset.set(
        withTiming(pillPerimeter * (1 - state.firstProgressBarProgress), {
          duration: 200,
        }),
      );
      orangeOffset.set(
        withTiming(pillPerimeter * (1 - state.secondProgressBarProgress), {
          duration: 200,
        }),
      );
    }, 200);
    return () => clearInterval(timer);
  }, [getTimerState, pillPerimeter, primaryOffset, orangeOffset]);

  return (
    <View
      style={{
        width: pillWidth,
        height: pillHeight,
        pointerEvents: 'none',
        overflow: 'hidden',
        borderRadius: pillHeight,
        backgroundColor: colors[timerState.backgroundColor],
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
          <AnimatedPath
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
            animatedProps={animatedPrimaryProps}
          />
          {/* Orange progress bar (minRest to maxRest) */}
          {!failed && !isSameMinMaxRest && (
            <AnimatedPath
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
              animatedProps={animatedOrangeProps}
              opacity={timerState.secondProgressBarProgress > 0 ? 1 : 0}
            />
          )}
        </Svg>
      </View>
      <SurfaceText
        style={{ fontVariant: ['tabular-nums'] }}
        font="text-2xl"
        weight={'bold'}
        color={timerState.textColor}
      >
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
