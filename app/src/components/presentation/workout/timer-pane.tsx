import React, { ReactNode, useEffect, useRef } from 'react';
import { ColorChoice, spacing, useAppTheme } from '@/hooks/useAppTheme';
import { Animated, Platform, View, ViewStyle } from 'react-native';
import { GlassBackground } from '@/components/presentation/foundation/glass-background';
import { floatingShadowStyle } from '@/components/presentation/foundation/floating-shadow';
import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import { Jiggler } from '@/components/presentation/foundation/jiggler';

const barRadius = spacing[5];
const trackHeight = 6;

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
          {controls}
        </View>
        <View
          style={{
            flexDirection: 'row',
            gap: spacing[1],
            paddingBottom: spacing[2],
          }}
        >
          {segments.map((segment, index) => (
            <ProgressSegment
              key={index}
              flex={segment.flex}
              progress={segment.progress}
              color={colors[segment.color]}
              trackColor={colors.outlineVariant}
            />
          ))}
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
