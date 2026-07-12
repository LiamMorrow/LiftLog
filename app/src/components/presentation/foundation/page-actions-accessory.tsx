import { spacing } from '@/hooks/useAppTheme';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';

/**
 * Slides the page's accessory in and out, and animates the space it takes with it, so the actions
 * above don't jump when it appears or leaves.
 */
export function PageActionsAccessory({ children }: { children?: ReactNode }) {
  const visible = !!children;
  const progress = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const [mounted, setMounted] = useState(visible);
  const [height, setHeight] = useState(0);
  // Leaving outlives the prop, so the last accessory stays on screen for as long as it takes to go.
  const departing = useRef(children);
  if (children) departing.current = children;

  useEffect(() => {
    if (visible) setMounted(true);
    const transition = Animated.timing(progress, {
      toValue: visible ? 1 : 0,
      duration: 250,
      easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      // Margin is a layout prop, so this one can't run off the main thread.
      useNativeDriver: false,
    });
    transition.start(({ finished }) => {
      if (finished && !visible) setMounted(false);
    });
    return () => transition.stop();
  }, [visible, progress]);

  if (!mounted) return null;

  return (
    <Animated.View
      onLayout={(event) => setHeight(event.nativeEvent.layout.height)}
      style={{
        alignSelf: 'stretch',
        // Collapsing the height would need `overflow: 'hidden'`, which would cut the bar's shadow.
        // So it keeps its size and hands the space back through a negative margin: the container is
        // anchored to the bottom, so it shrinks upwards, taking the actions down with it while the
        // bar slides out under the tab bar. The parent's gap goes with it, or it lingers as a seam.
        marginBottom: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [-(height + spacing[2]), 0],
        }),
      }}
    >
      {children ?? departing.current}
    </Animated.View>
  );
}
