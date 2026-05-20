import { ReactNode, useEffect, useRef } from 'react';
import { Animated, Easing, ViewStyle } from 'react-native';

interface JigglerProps {
  jiggling: boolean;
  children: ReactNode;
  jiggleSpeed?: number;
  testID?: string;
  style?: ViewStyle | (ViewStyle | undefined)[];
}
export function Jiggler({
  jiggling,
  children,
  style,
  testID,
  jiggleSpeed = 80,
}: JigglerProps) {
  const amplitude = 0.1;
  const rotation = useRef(new Animated.Value(0)).current;
  const isJigglingRef = useRef(false);

  useEffect(() => {
    isJigglingRef.current = jiggling;
  }, [jiggling]);

  useEffect(() => {
    if (!jiggling) return;

    const animate = () => {
      rotation.setValue(0);
      Animated.sequence([
        Animated.timing(rotation, {
          toValue: amplitude,
          duration: jiggleSpeed,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(rotation, {
          toValue: -amplitude,
          duration: jiggleSpeed,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(rotation, {
          toValue: amplitude,
          duration: jiggleSpeed,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(rotation, {
          toValue: -amplitude,
          duration: jiggleSpeed,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(rotation, {
          toValue: amplitude,
          duration: jiggleSpeed,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(rotation, {
          toValue: -amplitude,
          duration: jiggleSpeed,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(rotation, {
          toValue: 0,
          duration: jiggleSpeed,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ]).start(({ finished }) => {
        if (finished && isJigglingRef.current) animate();
      });
    };

    animate();
  }, [jiggling, rotation, jiggleSpeed]);

  const rotateZ = rotation.interpolate({
    inputRange: [-amplitude, amplitude],
    outputRange: [`${-amplitude}rad`, `${amplitude}rad`],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      testID={testID}
      style={[style, { transform: [{ rotateZ }] }]}
    >
      {children}
    </Animated.View>
  );
}
