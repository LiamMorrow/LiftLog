import { useMountEffect } from '@/hooks/useMountEffect';
import { useRef } from 'react';
import { Animated, Easing, Text, View } from 'react-native';

const RISE_DISTANCE = 56;
const DURATION_MS = 900;

export interface FloatingEmoji {
  key: string;
  emoji: string;
  /** Horizontal offset so a burst of emoji fan out rather than stacking in one column. */
  drift: number;
  delayMs: number;
}

interface FloatingEmojiLayerProps {
  emojis: FloatingEmoji[];
  onFinished: (key: string) => void;
}

/** Sits above the cheer buttons and lets them through — purely decorative. */
export function FloatingEmojiLayer({ emojis, onFinished }: FloatingEmojiLayerProps) {
  if (emojis.length === 0) {
    return null;
  }

  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: -RISE_DISTANCE }}>
      {emojis.map((emoji) => (
        <RisingEmoji key={emoji.key} emoji={emoji} onFinished={() => onFinished(emoji.key)} />
      ))}
    </View>
  );
}

function RisingEmoji({ emoji, onFinished }: { emoji: FloatingEmoji; onFinished: () => void }) {
  const anim = useRef(new Animated.Value(0)).current;

  useMountEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: DURATION_MS,
      delay: emoji.delayMs,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(({ finished }) => finished && onFinished());
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        bottom: 0,
        left: emoji.drift,
        opacity: anim.interpolate({ inputRange: [0, 0.15, 0.7, 1], outputRange: [0, 1, 1, 0] }),
        transform: [
          { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -RISE_DISTANCE] }) },
          { scale: anim.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.6, 1.1, 0.9] }) },
        ],
      }}
    >
      <Text style={{ fontSize: 22 }}>{emoji.emoji}</Text>
    </Animated.View>
  );
}
