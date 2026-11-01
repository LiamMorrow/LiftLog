import { useAppTheme } from '@/hooks/useAppTheme';
import { Rest } from '@/models/blueprint-models';
import { formatTimeSpan } from '@/utils/format-time-span';
import { Duration } from '@js-joda/core';
import { useTranslate } from '@tolgee/react';
import { useState } from 'react';
import { type LayoutChangeEvent, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { AppText } from '@/components/presentation/foundation/app-text';

const THUMB = 28;
const TRACK = 6;
const STEP_SECONDS = 15;
const DEFAULT_SPAN_SECONDS = 10 * 60;

export type RestKey = 'minRest' | 'maxRest' | 'failureRest';
const order: RestKey[] = ['minRest', 'maxRest', 'failureRest'];

const clamp = (value: number, lower: number, upper: number) => Math.min(upper, Math.max(lower, value));

export type RestThumbStyle = { fill: string; border: string };

export function useRestThumbStyles(): Record<RestKey, RestThumbStyle> {
  const { colors } = useAppTheme();
  return {
    minRest: { fill: colors.surface, border: colors.green },
    maxRest: { fill: colors.amber, border: colors.surface },
    failureRest: { fill: colors.red, border: colors.surface },
  };
}

export function RestRangeSlider({ rest, onChange }: { rest: Rest; onChange: (rest: Rest) => void }) {
  const { colors } = useAppTheme();
  const { t } = useTranslate();
  const thumbStyles = useRestThumbStyles();
  const [trackWidth, setTrackWidth] = useState(0);
  const [activeThumb, setActiveThumb] = useState<RestKey>('minRest');
  const seconds: Record<RestKey, number> = {
    minRest: rest.minRest.seconds(),
    maxRest: rest.maxRest.seconds(),
    failureRest: rest.failureRest.seconds(),
  };
  const longest = Math.max(...Object.values(seconds));
  const [baseSpan] = useState(() => Math.max(DEFAULT_SPAN_SECONDS, Math.ceil(longest / 60) * 60));
  const span = Math.max(baseSpan, Math.ceil(longest / 60) * 60);
  const labels: Record<RestKey, string> = {
    minRest: t('rest.min.label'),
    maxRest: t('rest.max.label'),
    failureRest: t('rest.failure.label'),
  };

  const toX = (value: number) => (value / span) * trackWidth;
  const secondsAt = (x: number) => (trackWidth > 0 ? clamp((x - THUMB / 2) / trackWidth, 0, 1) * span : 0);

  const setValue = (key: RestKey, value: number) => {
    const index = order.indexOf(key);
    const lower = index > 0 ? seconds[order[index - 1]!] : 0;
    const upper = index < order.length - 1 ? seconds[order[index + 1]!] : span;
    const next = clamp(Math.round(value / STEP_SECONDS) * STEP_SECONDS, lower, upper);
    if (next !== seconds[key]) {
      onChange({ ...rest, [key]: Duration.ofSeconds(next) });
    }
  };

  // Overlapping thumbs sit at the same value, so a touch to their right means the later one.
  const nearestThumb = (value: number) =>
    order.reduce((best, key) => {
      const distance = Math.abs(seconds[key] - value);
      const bestDistance = Math.abs(seconds[best] - value);
      return distance < bestDistance || (distance === bestDistance && value > seconds[key]) ? key : best;
    }, order[0]!);

  const gesture = Gesture.Pan()
    .runOnJS(true)
    .minDistance(0)
    .onBegin((e) => {
      const value = secondsAt(e.x);
      const key = nearestThumb(value);
      setActiveThumb(key);
      setValue(key, value);
    })
    .onChange((e) => setValue(activeThumb, secondsAt(e.x)));

  const onLayout = (e: LayoutChangeEvent) => setTrackWidth(Math.max(0, e.nativeEvent.layout.width - THUMB));

  const segment = (from: number, to: number, color: string) => (
    <View
      style={{
        position: 'absolute',
        left: THUMB / 2 + toX(from),
        width: Math.max(0, toX(to) - toX(from)),
        top: (THUMB - TRACK) / 2,
        height: TRACK,
        backgroundColor: color,
      }}
    />
  );

  return (
    <View style={{ gap: 4 }}>
      <View onLayout={onLayout} style={{ height: THUMB }}>
        {trackWidth > 0 && (
          <>
            <View
              style={{
                position: 'absolute',
                left: THUMB / 2,
                width: trackWidth,
                top: (THUMB - TRACK) / 2,
                height: TRACK,
                borderRadius: TRACK / 2,
                backgroundColor: colors.surfaceContainerHighest,
              }}
            />
            {segment(seconds.minRest, seconds.maxRest, thumbStyles.minRest.border)}
            {segment(seconds.maxRest, seconds.failureRest, thumbStyles.failureRest.fill)}
            <GestureDetector gesture={gesture}>
              <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}>
                {order.map((key) => (
                  <View
                    key={key}
                    testID={`rest-slider-${key}`}
                    accessible
                    accessibilityRole="adjustable"
                    accessibilityLabel={labels[key]}
                    accessibilityValue={{ text: formatTimeSpan(Duration.ofSeconds(seconds[key])) }}
                    accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
                    onAccessibilityAction={(e) =>
                      setValue(
                        key,
                        seconds[key] + (e.nativeEvent.actionName === 'increment' ? STEP_SECONDS : -STEP_SECONDS),
                      )
                    }
                    style={{
                      position: 'absolute',
                      left: toX(seconds[key]),
                      top: 0,
                      width: THUMB,
                      height: THUMB,
                      borderRadius: THUMB / 2,
                      backgroundColor: thumbStyles[key].fill,
                      borderWidth: 3,
                      borderColor: thumbStyles[key].border,
                      zIndex: key === activeThumb ? 1 : 0,
                    }}
                  />
                ))}
              </View>
            </GestureDetector>
          </>
        )}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: THUMB / 2 }}>
        <AppText variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
          {formatTimeSpan(Duration.ZERO)}
        </AppText>
        <AppText variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
          {formatTimeSpan(Duration.ofSeconds(span))}
        </AppText>
      </View>
    </View>
  );
}
