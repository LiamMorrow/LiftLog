import React, { ReactNode, useEffect } from 'react';
import { ColorChoice, spacing, useAppTheme } from '@/hooks/useAppTheme';
import { Animated, StyleSheet, useAnimatedValue, View, ViewStyle } from 'react-native';
import { FloatingPane } from '@/components/presentation/workout/floating-pane';
import { Reveal } from '@/components/presentation/foundation/reveal';
import { AppText } from '@/components/presentation/foundation/app-text';
import { Jiggler } from '@/components/presentation/foundation/jiggler';

const trackHeight = 6;
const pipWidth = 2;

export interface TimerSegment {
  /** Sized in proportion to how long this part of the window lasts. */
  flex: number;
  progress: number;
  color: ColorChoice;
}

interface TimerPaneProps {
  time: string;
  status: string;
  accent: ColorChoice;
  segments: TimerSegment[];
  controls: ReactNode;
  /** A row above the clock, for news that arrives while the timer runs. */
  banner?: ReactNode;
  jiggling?: boolean;
  testID?: string;
  style?: ViewStyle;
}

/** The chrome shared by every timer that runs against a target. */
export function TimerPane({
  time,
  status,
  accent,
  segments,
  controls,
  banner,
  jiggling,
  testID,
  style,
}: TimerPaneProps) {
  const { colors } = useAppTheme();

  return (
    <FloatingPane testID={testID} style={style}>
      <Reveal>
        {banner ? (
          <View
            style={{
              paddingBottom: spacing[2],
              marginBottom: spacing[1],
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: colors.outlineVariant,
            }}
          >
            {banner}
          </View>
        ) : undefined}
      </Reveal>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Jiggler jiggling={!!jiggling}>
          <AppText variant="headlineLarge" style={{ fontVariant: ['tabular-nums'] }} color={accent}>
            {time}
          </AppText>
        </Jiggler>
        <AppText
          variant="labelMedium"
          style={{
            marginLeft: spacing[2],
            textTransform: 'uppercase',
            letterSpacing: 0.8,
            marginRight: 'auto',
          }}
          numberOfLines={1}
          color={accent}
        >
          {status}
        </AppText>
        {controls}
      </View>
      <View style={{ paddingBottom: spacing[2] }}>
        <ProgressBar segments={segments} colors={colors} trackColor={colors.outlineVariant} />
      </View>
    </FloatingPane>
  );
}

export function formatTimeSpan(ms: number): string {
  const totalSeconds = Math.ceil(Math.max(ms, 0) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

interface ProgressBarProps {
  segments: TimerSegment[];
  colors: ReturnType<typeof useAppTheme>['colors'];
  trackColor: string;
}

/**
 * One continuous track. The segments are its colours laid end to end, each sized by its `flex`, and a
 * single curtain hides whatever the combined progress has not yet reached.
 */
function ProgressBar({ segments, colors, trackColor }: ProgressBarProps) {
  const totalFlex = segments.reduce((sum, segment) => sum + segment.flex, 0);
  // Segments fill in order, so the filled length is the flex-weighted sum of their individual progress.
  const progress =
    totalFlex > 0 ? segments.reduce((sum, segment) => sum + segment.flex * segment.progress, 0) / totalFlex : 0;
  const cover = useAnimatedValue(1);

  useEffect(() => {
    Animated.timing(cover, {
      toValue: 1 - progress,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [progress, cover]);

  return (
    <View
      style={{
        flexDirection: 'row',
        height: trackHeight,
        borderRadius: trackHeight,
        backgroundColor: trackColor,
        overflow: 'hidden',
      }}
    >
      {segments.map((segment, index) => (
        <View key={index} style={{ flex: segment.flex, backgroundColor: colors[segment.color] }} />
      ))}
      {/* This thing is the background which covers the real progress, it scales down over time */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundColor: trackColor,
          transform: [{ scaleX: cover }],
          transformOrigin: 'right',
        }}
      />
      {/* Now we create a pip at each spot by making a container which is the width of the segment (segment.flex)
        The pip itself is just an absolutely positioned item with a colour and a width
      */}
      <View
        style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, flexDirection: 'row' }}
        pointerEvents="none"
      >
        {segments.map((segment, index) => (
          <View key={index} style={{ flex: segment.flex }}>
            {index === segments.length - 1 ? undefined : (
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  right: 0,
                  width: pipWidth,
                  backgroundColor: colors.surfaceContainerHigh,
                }}
              />
            )}
          </View>
        ))}
      </View>
    </View>
  );
}
