import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ColorChoice, spacing, useAppTheme } from '@/hooks/useAppTheme';
import { Rest } from '@/models/blueprint-models';
import { Duration, OffsetDateTime } from '@js-joda/core';
import Svg, { Path } from 'react-native-svg';
import { Animated, Easing, View, ViewStyle } from 'react-native';
import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import Holdable from '@/components/presentation/foundation/holdable';
import IconButton from '@/components/presentation/foundation/gesture-wrappers/icon-button';
import { Tooltip } from 'react-native-paper';
import { useTranslate } from '@tolgee/react';

interface RestTimerProps {
  rest: Rest;
  startTime: OffsetDateTime;
  failed: boolean;
  style?: ViewStyle;
  resetTimer: () => void;
  stopTimer: () => void;
  allowStopTimer?: boolean;
}

export default function RestTimer({
  rest,
  startTime,
  failed,
  style,
  resetTimer,
  stopTimer,
  allowStopTimer = true,
}: RestTimerProps) {
  const { colors } = useAppTheme();
  const { t } = useTranslate();
  const isSameMinMaxRest = rest.minRest.equals(rest.maxRest);
  const [jiggled, setJiggled] = useState([] as string[]);

  useEffect(() => {
    setJiggled([]);
  }, [startTime]);

  const getTimerState = useCallback(() => {
    const now = OffsetDateTime.now();
    const diffMs = Duration.between(startTime, now);
    const timeSinceStart = formatTimeSpan(diffMs);
    const firstProgressBarProgress = failed
      ? clampProgress(diffMs.toMillis() / rest.failureRest.toMillis())
      : clampProgress(diffMs.toMillis() / rest.minRest.toMillis());
    const secondProgressBarProgress =
      failed || isSameMinMaxRest
        ? -1
        : clampProgress(
            (diffMs.toMillis() - rest.minRest.toMillis()) /
              (rest.maxRest.toMillis() - rest.minRest.toMillis()),
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

  const amplitude = 0.1;
  const rotation = useRef(new Animated.Value(0)).current;

  const triggerJiggle = useCallback(
    (milestone: string) => {
      if (jiggled.includes(milestone)) return;
      impactAsync(ImpactFeedbackStyle.Heavy).catch(console.log);

      const d = 80;
      rotation.setValue(0);
      Animated.sequence([
        Animated.timing(rotation, {
          toValue: amplitude,
          duration: d,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(rotation, {
          toValue: -amplitude,
          duration: d,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(rotation, {
          toValue: amplitude,
          duration: d,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(rotation, {
          toValue: -amplitude,
          duration: d,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(rotation, {
          toValue: amplitude,
          duration: d,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(rotation, {
          toValue: -amplitude,
          duration: d,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(rotation, {
          toValue: 0,
          duration: d,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ]).start();

      setJiggled((j) => [...j, milestone]);
    },
    [rotation, jiggled],
  );

  const pillHeight = spacing[14];
  const pillWidth = pillHeight * 2.2;
  const stopButtonSize = spacing[10];
  const radius = (pillHeight - 6) / 2;
  const straightLength = pillWidth - pillHeight;
  const pillPerimeter = 2 * straightLength + 2 * Math.PI * radius;

  useEffect(() => {
    const timer = setInterval(() => {
      const state = getTimerState();
      setTimerState(state);
      if (state.firstProgressBarProgress === 1) triggerJiggle('first');
      if (state.secondProgressBarProgress === 1) triggerJiggle('second');
    }, 200);
    return () => clearInterval(timer);
  }, [getTimerState, triggerJiggle]);

  const rotateZ = rotation.interpolate({
    inputRange: [-amplitude, amplitude],
    outputRange: [`${-amplitude}rad`, `${amplitude}rad`],
    extrapolate: 'clamp',
  });
  const showStopButton =
    allowStopTimer && timerState.firstProgressBarProgress >= 1;
  const showSecondProgressBar =
    !failed && !isSameMinMaxRest && timerState.secondProgressBarProgress > 0;

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing[2],
        },
        style,
      ]}
    >
      {allowStopTimer ? (
        showStopButton ? (
          <Tooltip title={t('rest.timer.stop.action')}>
            <IconButton
              testID="rest-timer-stop-button"
              icon="stop"
              accessibilityLabel={t('rest.timer.stop.action')}
              iconColor={colors.onPrimary}
              containerColor={colors.primary}
              mode="contained"
              size={20}
              style={{
                width: stopButtonSize,
                height: stopButtonSize,
                margin: 0,
                borderRadius: stopButtonSize / 2,
              }}
              onPress={stopTimer}
            />
          </Tooltip>
        ) : (
          <View style={{ width: stopButtonSize, height: stopButtonSize }} />
        )
      ) : null}
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
            { transform: [{ rotateZ }] },
          ]}
        >
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
              <PillProgressBar
                color={colors.primary}
                progress={timerState.firstProgressBarProgress}
                pillWidth={pillWidth}
                pillHeight={pillHeight}
                pillPerimeter={pillPerimeter}
              />
              <PillProgressBar
                color={colors.orange}
                progress={timerState.secondProgressBarProgress}
                pillWidth={pillWidth}
                pillHeight={pillHeight}
                pillPerimeter={pillPerimeter}
                visible={showSecondProgressBar}
              />
            </Svg>
          </View>
          <SurfaceText
            style={{ fontVariant: ['tabular-nums'] }}
            font="text-2xl"
            weight="bold"
            color={timerState.textColor}
          >
            {timerState.timeSinceStart}
          </SurfaceText>
        </Animated.View>
      </Holdable>
    </View>
  );
}

function formatTimeSpan(ms: Duration): string {
  const totalSeconds = Math.floor(ms.toMillis() / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function clampProgress(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

const AnimatedPath = Animated.createAnimatedComponent(Path);

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
  const offset = useRef(new Animated.Value(pillPerimeter)).current;

  useEffect(() => {
    Animated.timing(offset, {
      toValue: pillPerimeter * (1 - progress),
      duration: 200,
      useNativeDriver: false,
    }).start();
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
      strokeDashoffset={offset}
    />
  );
}
