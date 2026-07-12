import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ColorChoice, spacing, useAppTheme } from '@/hooks/useAppTheme';
import { Rest } from '@/models/blueprint-models';
import { Duration, OffsetDateTime } from '@js-joda/core';
import { Animated, Platform, View, ViewStyle } from 'react-native';
import { GlassBackground } from '@/components/presentation/foundation/glass-background';
import { floatingShadowStyle } from '@/components/presentation/foundation/floating-shadow';
import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { RestTimerControls } from '@/components/presentation/workout/rest-timer-controls';
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

/**
 * We treat resting as a window, not a deadline: below `minRest` you are still recovering, between min and max
 * you should lift, and past max you have gone over. Each phase owns one colour, and the two track
 * segments are the window itself, sized in proportion to how long each part of it lasts.
 */
type RestPhase = 'resting' | 'ready' | 'over';

// Neutral, then green, then red. The seed colour is the user's, so `primary` can land anywhere on the
// wheel — including on green — and a phase drawn in it would stop being distinguishable from the next.
const phaseColor: Record<RestPhase, ColorChoice> = {
  resting: 'onSurfaceVariant',
  ready: 'green',
  over: 'error',
};

const barRadius = spacing[5];
const trackHeight = 6;

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
  const [jiggled, setJiggled] = useState([] as string[]);

  useEffect(() => {
    setJiggled([]);
  }, [startTime]);

  const getTimerState = useCallback(() => {
    const now = pausedAt ?? OffsetDateTime.now();
    const elapsed = Duration.between(startTime, now).toMillis();
    // A failed set earns a single, longer rest, and a fixed rest has min === max. Both are a
    // target rather than a window, so they have no second segment to fill.
    const windowStart = (failed ? rest.failureRest : rest.minRest).toMillis();
    const windowEnd = failed || rest.minRest.equals(rest.maxRest) ? undefined : rest.maxRest.toMillis();

    if (elapsed < windowStart) {
      return {
        phase: 'resting' as const,
        windowStart,
        windowEnd,
        remaining: formatTimeSpan(windowStart - elapsed),
        restProgress: elapsed / windowStart,
        windowProgress: 0,
      };
    }
    if (windowEnd !== undefined && elapsed < windowEnd) {
      return {
        phase: 'ready' as const,
        windowStart,
        windowEnd,
        remaining: formatTimeSpan(windowEnd - elapsed),
        restProgress: 1,
        windowProgress: (elapsed - windowStart) / (windowEnd - windowStart),
      };
    }
    return {
      phase: 'over' as const,
      windowStart,
      windowEnd,
      remaining: `+${formatTimeSpan(elapsed - (windowEnd ?? windowStart))}`,
      restProgress: 1,
      windowProgress: 1,
    };
  }, [startTime, pausedAt, rest, failed]);

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

  useEffect(() => {
    const timer = setInterval(() => {
      const state = getTimerState();
      setTimerState(state);
      if (state.phase !== 'resting') triggerJiggle('ready');
      if (state.phase === 'over') triggerJiggle('over');
    }, 200);
    return () => clearInterval(timer);
  }, [getTimerState, triggerJiggle]);

  const { phase, windowStart, windowEnd } = timerState;
  const accent = phaseColor[phase];
  const trackColor = colors.outlineVariant;
  // A paused clock still reports the phase it stopped in through its colour, so the word is free to
  // carry the pause — which the play/pause glyph alone states too quietly for a timer left sitting.
  const status = paused
    ? t('rest_timer.status.paused')
    : phase === 'resting'
      ? t('rest_timer.status.resting')
      : phase === 'ready'
        ? t('rest_timer.status.ready')
        : t('rest_timer.status.over');

  return (
    // The bar clips its glass to the radius, and a clipping layer cannot cast a shadow — so the lift
    // has to come from a wrapper. Android separates itself with a hairline instead.
    <View
      style={[
        {
          alignSelf: 'stretch',
          // Separates the bar from the action floating above it, which the shared gap alone leaves too tight.
          marginTop: spacing[2],
        },
        Platform.OS === 'ios' ? floatingShadowStyle : undefined,
        style,
      ]}
    >
      <View
        testID="rest-timer"
        style={{
          borderRadius: barRadius,
          overflow: 'hidden',
          paddingVertical: spacing[2],
          paddingLeft: spacing[4],
          paddingRight: spacing[2],
          gap: spacing[1],
          borderColor: colors.outlineVariant,
          borderWidth: Platform.OS === 'android' ? 1 : 0,
        }}
      >
        <GlassBackground
          radius={barRadius}
          color={colors.surfaceContainerHigh}
          tintColor={withAlpha(colors.surfaceContainerHigh, 0.75)}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Jiggler jiggling={jiggling}>
            <SurfaceText style={{ fontVariant: ['tabular-nums'] }} font="text-3xl" weight="bold" color={accent}>
              {timerState.remaining}
            </SurfaceText>
          </Jiggler>
          <SurfaceText
            style={{
              flex: 1,
              marginLeft: spacing[2],
              textTransform: 'uppercase',
              letterSpacing: 0.8,
            }}
            numberOfLines={1}
            font="text-xs"
            weight="bold"
            color={accent}
          >
            {status}
          </SurfaceText>
          <RestTimerControls
            paused={paused}
            onRestart={() => {
              onRestart();
              triggerJiggle('reset');
            }}
            onTogglePause={onTogglePause}
            onDismiss={onDismiss}
          />
        </View>
        <View
          style={{
            flexDirection: 'row',
            gap: spacing[1],
            paddingBottom: spacing[2],
          }}
        >
          <ProgressSegment
            flex={windowStart}
            progress={timerState.restProgress}
            // With no window to redden, a fixed or failure rest has only this segment to carry the overrun.
            color={colors[phase === 'over' && windowEnd === undefined ? 'error' : 'onSurfaceVariant']}
            trackColor={trackColor}
          />
          {windowEnd !== undefined && (
            <ProgressSegment
              flex={windowEnd - windowStart}
              progress={timerState.windowProgress}
              // Only the window's own segment reddens once it has run out — a track of solid red says
              // no more than the "+0:41" beside it already does.
              color={colors[phase === 'over' ? 'error' : 'green']}
              trackColor={trackColor}
            />
          )}
        </View>
      </View>
    </View>
  );
}

function withAlpha(hex: string, alpha: number): string {
  const a = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${a}`;
}

function formatTimeSpan(ms: number): string {
  const totalSeconds = Math.ceil(Math.max(ms, 0) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

interface ProgressSegmentProps {
  flex: number;
  progress: number;
  color: string;
  trackColor: string;
}

function ProgressSegment({ flex, progress, color, trackColor }: ProgressSegmentProps) {
  const fill = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fill, {
      toValue: progress,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [progress, fill]);

  return (
    <View
      style={{
        flex,
        height: trackHeight,
        borderRadius: trackHeight,
        backgroundColor: trackColor,
        overflow: 'hidden',
      }}
    >
      <Animated.View
        style={{
          height: '100%',
          borderRadius: trackHeight,
          backgroundColor: color,
          width: fill.interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', '100%'],
          }),
        }}
      />
    </View>
  );
}
