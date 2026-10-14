import { spacing } from '@/hooks/useAppTheme';
import { ReactNode, useEffect, useState } from 'react';
import { Animated, Easing, useAnimatedValue } from 'react-native';

/**
 * Slides the page's accessory in and out, and animates the space it takes with it, so the actions
 * above don't jump when it appears or leaves.
 */
export function PageActionsAccessory({ children }: { children?: ReactNode }) {
  const visible = !!children;

  const progress = useAnimatedValue(visible ? 1 : 0);

  const [mounted, setMounted] = useState(visible);
  if (visible && !mounted) setMounted(true);

  const [height, setHeight] = useState(0);

  const [content, setContent] = useState(children);
  if (children && children !== content) setContent(children);

  useEffect(() => {
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
      {content}
    </Animated.View>
  );
}
