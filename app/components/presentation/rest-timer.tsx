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
import { View, ViewStyle } from 'react-native';
import { SurfaceText } from '@/components/presentation/surface-text';

interface RestTimerProps {
  rest: Rest;
  startTime: LocalDateTime;
  failed: boolean;
  style?: ViewStyle;
}

export default function RestTimer({
  rest,
  startTime,
  failed,
  style,
}: RestTimerProps) {
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
        ? ['inverseOnSurface', 'inverseSurface']
        : secondProgressBarProgress < 1 && secondProgressBarProgress !== -1
          ? ['inverseOnSurface', 'inverseSurface']
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
      style={[
        {
          width: pillWidth,
          height: pillHeight,
          pointerEvents: 'none',
          overflow: 'hidden',
          borderRadius: pillHeight,
          backgroundColor: colors[timerState.backgroundColor],
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
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
          {/* Primary progress bar (minRest/failureRest) */}
          <PillProgressBar
            color={colors.primary}
            progress={timerState.firstProgressBarProgress}
            pillWidth={pillWidth}
            pillHeight={pillHeight}
            pillPerimeter={pillPerimeter}
          />
          {/* Orange progress bar (minRest to maxRest) */}
          <PillProgressBar
            color={colors.orange}
            progress={timerState.secondProgressBarProgress}
            pillWidth={pillWidth}
            pillHeight={pillHeight}
            pillPerimeter={pillPerimeter}
            visible={
              !failed &&
              !isSameMinMaxRest &&
              timerState.secondProgressBarProgress > 0
            }
          />
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

interface PillProgressBarProps {
  color: string;
  progress: number;
  pillWidth: number;
  pillHeight: number;
  pillPerimeter: number;
  visible?: boolean;
}

function PillProgressBar({
  color,
  progress,
  pillWidth,
  pillHeight,
  pillPerimeter,
  visible = true,
}: PillProgressBarProps) {
  const AnimatedPath = Animated.createAnimatedComponent(Path);
  const offset = useSharedValue(pillPerimeter);
  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: offset.value,
  }));
  useEffect(() => {
    offset.set(
      withTiming(pillPerimeter * (1 - progress), {
        duration: 200,
      }),
    );
  }, [progress, pillPerimeter, offset]);
  if (!visible) return null;
  return (
    <AnimatedPath
      d={`M${3 + pillHeight / 2 - 3},3
          h${pillWidth - pillHeight + 0}
          a${pillHeight / 2 - 3},${pillHeight / 2 - 3} 0 0 1 0,${pillHeight - 6}
          h-${pillWidth - pillHeight + 0}
          a${pillHeight / 2 - 3},${pillHeight / 2 - 3} 0 0 1 0,-${pillHeight - 6}
          z`}
      stroke={color}
      strokeWidth={6}
      fill="none"
      strokeDasharray={pillPerimeter}
      animatedProps={animatedProps}
    />
  );
}
