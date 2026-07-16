import React, { ReactNode, useEffect, useRef } from 'react';
import { ColorChoice, spacing, useAppTheme } from '@/hooks/useAppTheme';
import { Animated, Platform, useWindowDimensions, View, ViewStyle } from 'react-native';
import { GlassBackground } from '@/components/presentation/foundation/glass-background';
import { floatingShadowStyle } from '@/components/presentation/foundation/floating-shadow';
import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import { Jiggler } from '@/components/presentation/foundation/jiggler';

const barRadius = spacing[5];
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
  jiggling?: boolean;
  testID?: string;
  style?: ViewStyle;
}

/** The chrome shared by every timer that runs against a target. */
export function TimerPane({ time, status, accent, segments, controls, jiggling, testID, style }: TimerPaneProps) {
  const { colors } = useAppTheme();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  return (
    // The bar clips its glass to the radius, and a clipping layer cannot cast a shadow — so the lift
    // has to come from a wrapper. Android separates itself with a hairline instead.
    <View
      style={[
        {
          alignSelf: isLandscape ? 'flex-end' : 'stretch',
          // Separates the bar from the action floating above it, which the shared gap alone leaves too tight.
          marginTop: spacing[2],
        },
        Platform.OS === 'ios' ? floatingShadowStyle : undefined,
        style,
      ]}
    >
      <View
        testID={testID}
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
          <Jiggler jiggling={!!jiggling}>
            <SurfaceText style={{ fontVariant: ['tabular-nums'] }} font="text-3xl" weight="bold" color={accent}>
              {time}
            </SurfaceText>
          </Jiggler>
          <SurfaceText
            style={{
              marginLeft: spacing[2],
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              marginRight: 'auto',
            }}
            numberOfLines={1}
            font="text-xs"
            weight="bold"
            color={accent}
          >
            {status}
          </SurfaceText>
          {controls}
        </View>
        <View style={{ paddingBottom: spacing[2] }}>
          <ProgressBar segments={segments} colors={colors} trackColor={colors.outlineVariant} />
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
  const cover = useRef(new Animated.Value(1)).current;

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
      <View
        style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, flexDirection: 'row' }}
        pointerEvents="none"
      >
        {segments.map((segment, index) => (
          <View key={index} style={{ flex: segment.flex }}>
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
          </View>
        ))}
      </View>
    </View>
  );
}
