import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ColorChoice, spacing, useAppTheme } from '@/hooks/useAppTheme';
import { Rest } from '@/models/blueprint-models';
import { Duration, OffsetDateTime } from '@js-joda/core';
import Svg, { Path } from 'react-native-svg';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { GlassView, isLiquidGlassAvailable, type GlassStyle } from 'expo-glass-effect';
import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import IconButton from '@/components/presentation/foundation/gesture-wrappers/icon-button';
import { Jiggler } from '@/components/presentation/foundation/jiggler';
import { useTranslate } from '@tolgee/react';

interface RestTimerProps {
  rest: Rest;
  startTime: OffsetDateTime;
  pausedAt: OffsetDateTime | undefined;
  failed: boolean;
  style?: ViewStyle;
  onRestart: () => void;
  onDismiss: () => void;
  onTogglePause: () => void;
}

export default function RestTimer({
  rest,
  startTime,
  pausedAt,
  failed,
  style,
  onRestart,
  onDismiss,
  onTogglePause,
}: RestTimerProps) {
  const { colors } = useAppTheme();
  const { t } = useTranslate();
  const paused = pausedAt !== undefined;
  const isSameMinMaxRest = rest.minRest.equals(rest.maxRest);
  const [jiggled, setJiggled] = useState([] as string[]);

  useEffect(() => {
    setJiggled([]);
  }, [startTime]);

  const getTimerState = useCallback(() => {
    const now = pausedAt ?? OffsetDateTime.now();
    const diffMs = Duration.between(startTime, now);
    const timeSinceStart = formatTimeSpan(diffMs);
    const firstProgressBarProgress = failed
      ? Math.min(diffMs.toMillis() / rest.failureRest.toMillis(), 1)
      : Math.min(diffMs.toMillis() / rest.minRest.toMillis(), 1);
    const secondProgressBarProgress =
      failed || isSameMinMaxRest
        ? -1
        : Math.min(
            (diffMs.toMillis() - rest.minRest.toMillis()) / (rest.maxRest.toMillis() - rest.minRest.toMillis()),
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
  }, [startTime, pausedAt, rest, failed, isSameMinMaxRest]);

  const [timerState, setTimerState] = useState(getTimerState());
  const [jiggling, setJiggling] = useState(false);

  const triggerJiggle = useCallback(
    (milestone: string) => {
      if (jiggled.includes(milestone)) return;
      impactAsync(ImpactFeedbackStyle.Heavy).catch(console.log);
      setJiggling(true);
      setTimeout(() => setJiggling(false), 10);
      setJiggled((j) => [...j, milestone]);
    },
    [jiggled],
  );

  const pillHeight = spacing[14];
  const pillWidth = pillHeight * 2.2;
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

  return (
    <View style={{ alignItems: 'center', gap: spacing[2] }}>
      <Jiggler
        testID="rest-timer"
        jiggling={jiggling}
        style={[
          {
            width: pillWidth,
            height: pillHeight,
            pointerEvents: 'none',
            overflow: 'hidden',
            borderRadius: pillHeight,
            alignItems: 'center',
            justifyContent: 'center',
          },
          style,
        ]}
      >
        <GlassBackground
          radius={pillHeight}
          color={colors[timerState.backgroundColor]}
          glassEffectStyle="clear"
          tintColor={withAlpha(colors[timerState.backgroundColor], 0.85)}
        />
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
              visible={!failed && !isSameMinMaxRest && timerState.secondProgressBarProgress > 0}
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
      </Jiggler>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          overflow: 'hidden',
          borderRadius: pillHeight,
        }}
      >
        <GlassBackground radius={pillHeight} color={colors.surfaceContainer} />
        <IconButton
          icon="close"
          iconColor={colors.onSurface}
          accessibilityLabel={t('rest_timer.dismiss')}
          onPress={onDismiss}
        />
        <IconButton
          icon={paused ? 'playArrow' : 'pause'}
          iconColor={colors.onSurface}
          animated
          accessibilityLabel={paused ? t('rest_timer.resume') : t('rest_timer.pause')}
          onPress={onTogglePause}
        />
        <IconButton
          icon="replay"
          iconColor={colors.onSurface}
          accessibilityLabel={t('rest_timer.restart')}
          onPress={() => {
            onRestart();
            triggerJiggle('reset');
          }}
        />
      </View>
    </View>
  );
}

function GlassBackground({
  radius,
  color,
  tintColor,
  glassEffectStyle = 'regular',
}: {
  radius: number;
  color: string;
  tintColor?: string;
  glassEffectStyle?: GlassStyle;
}) {
  const { colorScheme } = useAppTheme();
  if (!isLiquidGlassAvailable()) {
    return (
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { borderRadius: radius, backgroundColor: color }]}
      />
    );
  }
  return (
    <GlassView
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
      glassEffectStyle={glassEffectStyle}
      colorScheme={colorScheme}
      tintColor={tintColor}
    />
  );
}

function withAlpha(hex: string, alpha: number): string {
  const a = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${a}`;
}

function formatTimeSpan(ms: Duration): string {
  const totalSeconds = Math.floor(ms.toMillis() / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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
