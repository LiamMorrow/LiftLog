import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useEffectEvent, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, useAnimatedValue, View } from 'react-native';

const NATIVE_SPLASH_BACKGROUND = '#fcfdf6';
const NATIVE_SPLASH_GLYPH = '#046f03';
const NATIVE_SPLASH_IMAGE_WIDTH = 100;
const VIEWBOX = 51.429;
const UNIT = NATIVE_SPLASH_IMAGE_WIDTH / VIEWBOX;

const BAR = { x: -12.1218, y: -1.0101, width: 24.2436, height: 2.0203 };
const LOGO_PLATES = [
  { x: -8.0812, y: -6.0609, width: 2.0203, height: 12.1218 },
  { x: 6.0609, y: -6.0609, width: 2.0203, height: 12.1218 },
  { x: -10.1015, y: -4.0406, width: 2.07, height: 8.0812 },
  { x: 8.0315, y: -4.0406, width: 2.07, height: 8.0812 },
];
const EXTRA_LEFT = { x: -11.6, y: -2.6, width: 1.5, height: 5.2 };
const EXTRA_RIGHT = { x: 10.1, y: -2.6, width: 1.5, height: 5.2 };

const PLATE_START_OFFSET = 7 * UNIT;
const PLATE_OVERSHOOT = 0.4 * UNIT;
const DIP_DEPTH = 1.5 * UNIT;
const BOB_HEIGHT = 6;

type Phase = 'waiting' | 'intro' | 'loop' | 'outro';

interface AnimatedSplashProps {
  isReady: boolean;
  onFinished: () => void;
}

export function AnimatedSplash({ isReady, onFinished }: AnimatedSplashProps) {
  const extra = useAnimatedValue(0);
  const flex = useAnimatedValue(0);
  const dip = useAnimatedValue(0);
  const shadow = useAnimatedValue(0);
  const bob = useAnimatedValue(0);
  const reveal = useAnimatedValue(0);
  const ground = useAnimatedValue(1);
  const [phase, setPhase] = useState<Phase>('waiting');
  const [isLaidOut, setIsLaidOut] = useState(false);
  const [reduceMotion, setReduceMotion] = useState<boolean>();

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  useEffect(() => {
    if (!isLaidOut || reduceMotion === undefined) {
      return;
    }
    const frame = requestAnimationFrame(() => {
      SplashScreen.hide();
      setPhase(reduceMotion ? 'loop' : 'intro');
    });
    return () => cancelAnimationFrame(frame);
  }, [isLaidOut, reduceMotion]);

  const finish = useEffectEvent(onFinished);

  useEffect(() => {
    const values = { extra, flex, dip, shadow, bob, reveal, ground };
    const animation = animationFor(phase, isReady, !!reduceMotion, values);
    if (!animation) {
      return;
    }
    animation.start(({ finished }) => {
      if (!finished) {
        return;
      }
      if (phase === 'outro') {
        finish();
      } else {
        setPhase(isReady ? 'outro' : 'loop');
      }
    });
    return () => animation.stop();
  }, [phase, isReady, reduceMotion, extra, flex, dip, shadow, bob, reveal, ground]);

  const bobScale = bob.interpolate({ inputRange: [0, 1], outputRange: [1, 0.82] });
  const bobOpacity = bob.interpolate({ inputRange: [0, 1], outputRange: [1, 0.6] });

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents={phase === 'outro' ? 'none' : 'auto'}
      onLayout={() => setIsLaidOut(true)}
      accessible
      accessibilityLabel="LiftLog"
    >
      <Animated.View style={[StyleSheet.absoluteFill, styles.ground, { opacity: ground }]} />
      <View style={styles.center}>
        <View style={styles.box}>
          <Animated.View
            style={[
              styles.shadow,
              {
                opacity: Animated.multiply(shadow, bobOpacity),
                transform: [
                  { scale: shadow.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) },
                  { scale: bobScale },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                opacity: reveal.interpolate({ inputRange: [0, 1, 2], outputRange: [1, 1, 0] }),
                transform: [
                  { translateY: bob.interpolate({ inputRange: [0, 1], outputRange: [0, -BOB_HEIGHT] }) },
                  { translateY: dip.interpolate({ inputRange: [0, 1], outputRange: [0, DIP_DEPTH] }) },
                  {
                    scale: reveal.interpolate({
                      inputRange: [0, 1, 2],
                      outputRange: reduceMotion ? [1, 1, 1] : [1, 0.86, 2.4],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={[StyleSheet.absoluteFill, styles.rotated]}>
              <Animated.View
                style={[
                  rectStyle(BAR),
                  { transform: [{ scaleY: flex.interpolate({ inputRange: [0, 1], outputRange: [1, 1.25] }) }] },
                ]}
              />
              {LOGO_PLATES.map((plate) => (
                <View key={plate.x} style={rectStyle(plate)} />
              ))}
              <SlidingPlate rect={EXTRA_LEFT} value={extra} side={-1} />
              <SlidingPlate rect={EXTRA_RIGHT} value={extra} side={1} />
            </View>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

function SlidingPlate({ rect, value, side }: { rect: Rect; value: Animated.Value; side: 1 | -1 }) {
  return (
    <Animated.View
      style={[
        rectStyle(rect),
        {
          opacity: value.interpolate({ inputRange: [0, 1, 2], outputRange: [0, 1, 1] }),
          transform: [
            {
              translateX: value.interpolate({
                inputRange: [0, 1, 2],
                outputRange: [side * PLATE_START_OFFSET, -side * PLATE_OVERSHOOT, 0],
              }),
            },
          ],
        },
      ]}
    />
  );
}

interface SplashValues {
  extra: Animated.Value;
  flex: Animated.Value;
  dip: Animated.Value;
  shadow: Animated.Value;
  bob: Animated.Value;
  reveal: Animated.Value;
  ground: Animated.Value;
}

function animationFor(phase: Phase, isReady: boolean, reduceMotion: boolean, values: SplashValues) {
  switch (phase) {
    case 'waiting':
      return undefined;
    case 'intro':
      return isReady ? settleIntro(values) : intro(values);
    case 'loop':
      if (isReady) {
        return timing(values.bob, 0, reduceMotion ? 0 : 300, Easing.out(Easing.quad));
      }
      return reduceMotion ? undefined : loop(values);
    case 'outro':
      return outro(values);
  }
}

function intro({ extra, flex, dip, shadow }: SplashValues) {
  return Animated.parallel([
    Animated.sequence([
      Animated.delay(144),
      timing(extra, 1, 270, Easing.bezier(0.5, 0, 0.9, 0.6)),
      timing(extra, 2, 108, Easing.out(Easing.ease)),
    ]),
    Animated.sequence([
      Animated.delay(396),
      timing(flex, 1, 36, Easing.linear),
      timing(flex, 0, 90, Easing.out(Easing.ease)),
    ]),
    Animated.sequence([
      Animated.delay(396),
      timing(dip, 1, 90, Easing.out(Easing.ease)),
      timing(dip, 0, 180, Easing.inOut(Easing.ease)),
    ]),
    Animated.sequence([Animated.delay(360), timing(shadow, 1, 540, Easing.out(Easing.ease))]),
  ]);
}

function settleIntro({ extra, flex, dip, shadow }: SplashValues) {
  const easing = Easing.out(Easing.quad);
  return Animated.parallel([
    timing(extra, 2, 200, easing),
    timing(flex, 0, 200, easing),
    timing(dip, 0, 200, easing),
    timing(shadow, 1, 200, easing),
  ]);
}

function loop({ bob }: SplashValues) {
  const easing = Easing.bezier(0.45, 0, 0.55, 1);
  return Animated.loop(Animated.sequence([timing(bob, 1, 600, easing), timing(bob, 0, 600, easing)]));
}

function outro({ reveal, shadow, ground }: SplashValues) {
  return Animated.parallel([
    Animated.sequence([
      timing(reveal, 1, 110, Easing.out(Easing.ease)),
      timing(reveal, 2, 340, Easing.bezier(0.4, 0, 1, 1)),
    ]),
    timing(shadow, 0, 200, Easing.linear),
    Animated.sequence([Animated.delay(120), timing(ground, 0, 450, Easing.bezier(0.4, 0, 0.2, 1))]),
  ]);
}

function timing(value: Animated.Value, toValue: number, duration: number, easing: (t: number) => number) {
  return Animated.timing(value, { toValue, duration, easing, useNativeDriver: true });
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

function rectStyle(rect: Rect) {
  return {
    position: 'absolute' as const,
    left: (rect.x + VIEWBOX / 2) * UNIT,
    top: (rect.y + VIEWBOX / 2) * UNIT,
    width: rect.width * UNIT,
    height: rect.height * UNIT,
    backgroundColor: NATIVE_SPLASH_GLYPH,
  };
}

const styles = StyleSheet.create({
  ground: {
    backgroundColor: NATIVE_SPLASH_BACKGROUND,
  },
  center: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: NATIVE_SPLASH_IMAGE_WIDTH,
    height: NATIVE_SPLASH_IMAGE_WIDTH,
  },
  rotated: {
    transform: [{ rotate: '45deg' }],
  },
  shadow: {
    position: 'absolute',
    left: NATIVE_SPLASH_IMAGE_WIDTH * 0.33,
    top: NATIVE_SPLASH_IMAGE_WIDTH * 0.74,
    width: NATIVE_SPLASH_IMAGE_WIDTH * 0.34,
    height: NATIVE_SPLASH_IMAGE_WIDTH * 0.05,
    borderRadius: NATIVE_SPLASH_IMAGE_WIDTH,
    backgroundColor: 'rgba(4, 111, 3, 0.14)',
  },
});
