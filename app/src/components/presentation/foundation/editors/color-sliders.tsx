import { useAppTheme } from '@/hooks/useAppTheme';
import { hexToHsv, hsvToHex, type HexColor } from '@/utils/color';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, type LayoutChangeEvent, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

const THUMB = 28;
const TRACK_HEIGHT = 28;
/** Cap how often the (relatively expensive) palette regeneration downstream is asked to run. */
const EMIT_INTERVAL_MS = 50;

interface ColorSlidersProps {
  value: HexColor;
  onChange: (hex: HexColor) => void;
}

export function ColorSliders({ value, onChange }: ColorSlidersProps) {
  const [hsv, setHsv] = useState(() => hexToHsv(value));

  // Reflect external changes (e.g. reopening the picker on a saved color) without fighting live drags.
  const lastEmitted = useRef<HexColor>(value);
  useEffect(() => {
    if (value !== lastEmitted.current) {
      lastEmitted.current = value;
      setHsv(hexToHsv(value));
    }
  }, [value]);

  const emitTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastEmitAt = useRef(0);
  const emit = (next: { h: number; s: number; v: number }) => {
    const hex = hsvToHex(next.h, next.s, next.v);
    lastEmitted.current = hex;
    const now = Date.now();
    const elapsed = now - lastEmitAt.current;
    clearTimeout(emitTimer.current);
    if (elapsed >= EMIT_INTERVAL_MS) {
      lastEmitAt.current = now;
      onChange(hex);
    } else {
      emitTimer.current = setTimeout(() => {
        lastEmitAt.current = Date.now();
        onChange(hex);
      }, EMIT_INTERVAL_MS - elapsed);
    }
  };
  useEffect(() => () => clearTimeout(emitTimer.current), []);

  const update = (partial: Partial<typeof hsv>) => {
    setHsv((prev) => {
      const next = { ...prev, ...partial };
      emit(next);
      return next;
    });
  };

  const thumbColor = hsvToHex(hsv.h, hsv.s, hsv.v);
  const hueStops = Array.from({ length: 13 }, (_, i) => hsvToHex((i / 12) * 360, hsv.s, hsv.v));
  const satStops = [0, 0.25, 0.5, 0.75, 1].map((s) => hsvToHex(hsv.h, s, hsv.v));
  const valStops = [0, 0.25, 0.5, 0.75, 1].map((v) => hsvToHex(hsv.h, hsv.s, v));

  return (
    <View style={{ gap: THUMB / 2 }}>
      <ChannelSlider
        accessibilityLabel="Hue"
        fraction={hsv.h / 360}
        stops={hueStops}
        thumbColor={thumbColor}
        onChange={(f) => update({ h: f * 360 })}
      />
      <ChannelSlider
        accessibilityLabel="Saturation"
        fraction={hsv.s}
        stops={satStops}
        thumbColor={thumbColor}
        onChange={(f) => update({ s: f })}
      />
      <ChannelSlider
        accessibilityLabel="Brightness"
        fraction={hsv.v}
        stops={valStops}
        thumbColor={thumbColor}
        onChange={(f) => update({ v: f })}
      />
    </View>
  );
}

interface ChannelSliderProps {
  fraction: number;
  stops: string[];
  thumbColor: string;
  accessibilityLabel: string;
  onChange: (fraction: number) => void;
}

function ChannelSlider({ fraction, stops, thumbColor, accessibilityLabel, onChange }: ChannelSliderProps) {
  const { colors } = useAppTheme();
  const [trackWidth, setTrackWidth] = useState(0);
  const gradientId = useRef(`grad-${Math.random().toString(36).slice(2)}`).current;

  const setFromX = (x: number) => {
    if (trackWidth <= 0) return;
    onChange(Math.min(1, Math.max(0, x / trackWidth)));
  };

  const gesture = Gesture.Pan()
    .runOnJS(true)
    .minDistance(0)
    .onBegin((e) => setFromX(e.x))
    .onChange((e) => setFromX(e.x));

  const onLayout = (e: LayoutChangeEvent) => setTrackWidth(Math.max(0, e.nativeEvent.layout.width - THUMB));

  return (
    <View onLayout={onLayout} style={{ width: '100%', height: THUMB, justifyContent: 'center' }}>
      {trackWidth > 0 && (
        <>
          <Svg
            width={trackWidth}
            height={TRACK_HEIGHT}
            style={{ position: 'absolute', left: THUMB / 2, top: (THUMB - TRACK_HEIGHT) / 2 }}
          >
            <Defs>
              <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
                {stops.map((color, i) => (
                  <Stop key={i} offset={i / (stops.length - 1)} stopColor={color} />
                ))}
              </LinearGradient>
            </Defs>
            <Rect
              x={0}
              y={0}
              width={trackWidth}
              height={TRACK_HEIGHT}
              rx={TRACK_HEIGHT / 2}
              fill={`url(#${gradientId})`}
              stroke={colors.outlineVariant}
              strokeWidth={1}
            />
          </Svg>
          <GestureDetector gesture={gesture}>
            <View
              accessibilityRole="adjustable"
              accessibilityLabel={accessibilityLabel}
              onAccessibilityTap={() => AccessibilityInfo.announceForAccessibility(thumbColor)}
              style={{ position: 'absolute', left: THUMB / 2, top: 0, width: trackWidth, height: THUMB }}
            />
          </GestureDetector>
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              width: THUMB,
              height: THUMB,
              borderRadius: THUMB / 2,
              backgroundColor: thumbColor,
              borderColor: '#FFFFFF',
              borderWidth: 3,
              left: fraction * trackWidth,
              top: 0,
              shadowColor: '#000000',
              shadowOpacity: 0.3,
              shadowRadius: 2,
              shadowOffset: { width: 0, height: 1 },
              elevation: 2,
            }}
          />
        </>
      )}
    </View>
  );
}
