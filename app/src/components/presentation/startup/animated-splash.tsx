import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useEffectEvent, useState } from 'react';
import { AccessibilityInfo, Animated, Appearance, Easing, StyleSheet, useAnimatedValue, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

const NATIVE_SPLASH = {
  light: { ground: '#fcfdf6', logo: '#046f03' },
  dark: { ground: '#1a1c18', logo: '#8bd978' },
};
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
const EXTRA_LEFT = { x: -11.6, y: -2.6, width: 1.6, height: 5.2 };
const EXTRA_RIGHT = { x: 10, y: -2.6, width: 1.6, height: 5.2 };

const PLATE_START_OFFSET = 7 * UNIT;
const PLATE_OVERSHOOT = 0.4 * UNIT;
const DIP_DEPTH = 1.5 * UNIT;
const BOB_HEIGHT = 6;
const AnimatedSvg = Animated.createAnimatedComponent(Svg);

type Phase = 'waiting' | 'intro' | 'loop' | 'outro';

export interface SplashTheme {
  logo: string;
  ground: string;
}

interface AnimatedSplashProps {
  isReady: boolean;
  theme: SplashTheme | undefined;
  onFinished: () => void;
}

export function AnimatedSplash({ isReady, theme, onFinished }: AnimatedSplashProps) {
  const extra = useAnimatedValue(0);
  const flex = useAnimatedValue(0);
  const dip = useAnimatedValue(0);
  const bob = useAnimatedValue(0);
  const reveal = useAnimatedValue(0);
  const ground = useAnimatedValue(1);
  const [native] = useState(() => NATIVE_SPLASH[Appearance.getColorScheme() === 'dark' ? 'dark' : 'light']);
  const tint = useAnimatedValue(0);
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

  const hasTheme = theme !== undefined;
  const isShowing = phase !== 'waiting';
  useEffect(() => {
    if (!hasTheme || !isShowing) {
      return;
    }
    const animation = timing(tint, 1, 400, Easing.inOut(Easing.ease));
    animation.start();
    return () => animation.stop();
  }, [hasTheme, isShowing, tint]);

  const finish = useEffectEvent(onFinished);

  useEffect(() => {
    const values = { extra, flex, dip, bob, reveal, ground };
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
  }, [phase, isReady, reduceMotion, extra, flex, dip, bob, reveal, ground]);

  const glyph = tint.interpolate({
    inputRange: [0, 1],
    outputRange: [native.logo, theme?.logo ?? native.logo],
  });

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents={phase === 'outro' ? 'none' : 'auto'}
      onLayout={() => setIsLaidOut(true)}
      accessible
      accessibilityLabel="LiftLog"
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            opacity: ground,
            backgroundColor: tint.interpolate({
              inputRange: [0, 1],
              outputRange: [native.ground, theme?.ground ?? native.ground],
            }),
          },
        ]}
      />
      <View style={styles.center}>
        <View style={styles.box}>
          <Animated.View
            needsOffscreenAlphaCompositing
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
            <Logo color={glyph} extra={extra} flex={flex} />
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

type AnimatedColor = Animated.AnimatedInterpolation<string>;

function Logo({ color, extra, flex }: { color: AnimatedColor; extra: Animated.Value; flex: Animated.Value }) {
  return (
    <View style={[StyleSheet.absoluteFill, styles.rotated]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { transform: [{ scaleY: flex.interpolate({ inputRange: [0, 1], outputRange: [1, 1.25] }) }] },
        ]}
      >
        <LogoLayer rects={[BAR]} color={color} />
      </Animated.View>
      <LogoLayer rects={LOGO_PLATES} color={color} />
      <SlidingPlate rect={EXTRA_LEFT} value={extra} side={-1} color={color} />
      <SlidingPlate rect={EXTRA_RIGHT} value={extra} side={1} color={color} />
    </View>
  );
}

function LogoLayer({ rects, color }: { rects: LogoRect[]; color: AnimatedColor }) {
  return (
    <AnimatedSvg
      style={StyleSheet.absoluteFill}
      color={color}
      viewBox={`${-VIEWBOX / 2} ${-VIEWBOX / 2} ${VIEWBOX} ${VIEWBOX}`}
    >
      {rects.map((rect) => (
        <Rect key={rect.x} {...rect} fill="currentColor" />
      ))}
    </AnimatedSvg>
  );
}

interface SlidingPlateProps {
  rect: LogoRect;
  value: Animated.Value;
  side: 1 | -1;
  color: AnimatedColor;
}

function SlidingPlate({ rect, value, side, color }: SlidingPlateProps) {
  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
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
    >
      <LogoLayer rects={[rect]} color={color} />
    </Animated.View>
  );
}

interface SplashValues {
  extra: Animated.Value;
  flex: Animated.Value;
  dip: Animated.Value;
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

function intro({ extra, flex, dip }: SplashValues) {
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
  ]);
}

function settleIntro({ extra, flex, dip }: SplashValues) {
  const easing = Easing.out(Easing.quad);
  return Animated.parallel([timing(extra, 2, 200, easing), timing(flex, 0, 200, easing), timing(dip, 0, 200, easing)]);
}

function loop({ bob }: SplashValues) {
  const easing = Easing.bezier(0.45, 0, 0.55, 1);
  return Animated.loop(Animated.sequence([timing(bob, 1, 600, easing), timing(bob, 0, 600, easing)]));
}

function outro({ reveal, ground }: SplashValues) {
  return Animated.parallel([
    Animated.sequence([
      timing(reveal, 1, 110, Easing.out(Easing.ease)),
      timing(reveal, 2, 340, Easing.bezier(0.4, 0, 1, 1)),
    ]),
    Animated.sequence([Animated.delay(120), timing(ground, 0, 450, Easing.bezier(0.4, 0, 0.2, 1))]),
  ]);
}

function timing(value: Animated.Value, toValue: number, duration: number, easing: (t: number) => number) {
  return Animated.timing(value, { toValue, duration, easing, useNativeDriver: true });
}

interface LogoRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const styles = StyleSheet.create({
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
});
