import React, { useCallback, useEffect, useState } from 'react';
import { ColorChoice, spacing, useAppTheme } from '@/hooks/useAppTheme';
import { Rest } from '@/models/blueprint-models';
import { Duration, OffsetDateTime } from '@js-joda/core';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  useAnimatedStyle,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { View, ViewStyle } from 'react-native';
import { SurfaceText } from '@/components/presentation/surface-text';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import Holdable from '@/components/presentation/holdable';

interface RestTimerProps {
  rest: Rest;
  startTime: OffsetDateTime;
  failed: boolean;
  style?: ViewStyle;
  resetTimer: () => void;
}

export default function RestTimer({
  rest,
  startTime,
  failed,
  style,
  resetTimer,
}: RestTimerProps) {
  const { colors } = useAppTheme();
  const isSameMinMaxRest = rest.minRest.equals(rest.maxRest);
  const [jiggled, setJiggled] = useState([] as string[]);
  useEffect(() => {
    setJiggled([]);
  }, [startTime]);

  // Callback to get all timer-related values
  const getTimerState = useCallback(() => {
    const now = OffsetDateTime.now();
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
          ? ['onGreen', 'green']
          : ['onErrorContainer', 'errorContainer'];
    return {
      timeSinceStart,
      firstProgressBarProgress,
      secondProgressBarProgress,
      textColor,
      backgroundColor,
    };
  }, [startTime, rest, failed, isSameMinMaxRest]);

  const [timerState, setTimerState] = useState(getTimerState());
  const rotation = useSharedValue(0);

  const amplitude = 0.1;
  const animatedStyle = useAnimatedStyle(() => {
    const angle = amplitude * Math.sin(rotation.value);
    return {
      transform: [{ rotateZ: `${angle}rad` }],
    };
  });

  // Set this once, then rotate it with sin
  const duration = 100;
  const triggerJiggle = useCallback(
    (milestone: string) => {
      if (jiggled.includes(milestone)) {
        return;
      }
      impactAsync(ImpactFeedbackStyle.Heavy).catch(console.log);
      rotation.set(
        withRepeat(
          withTiming(2 * Math.PI, {
            duration,
            easing: Easing.linear,
          }),
          3,
          false,
          () => {
            rotation.set(0); // Reset at end
          },
        ),
      );
      setJiggled((j) => [...j, milestone]);
    },
    [rotation, jiggled],
  );
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
      if (state.firstProgressBarProgress === 1) {
        triggerJiggle('first');
      }
      if (state.secondProgressBarProgress === 1) {
        triggerJiggle('second');
      }
    }, 200);
    return () => clearInterval(timer);
  }, [getTimerState, pillPerimeter, triggerJiggle]);

  return (
    <Holdable
      onLongPress={() => {
        resetTimer();
        triggerJiggle('reset');
      }}
    >
      <Animated.View
        testID="rest-timer"
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
          animatedStyle,
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
      </Animated.View>
    </Holdable>
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
