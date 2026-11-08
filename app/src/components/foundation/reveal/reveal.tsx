import { ReactNode, useEffect, useState } from 'react';
import { Animated, Easing, useAnimatedValue, View } from 'react-native';

export const REVEAL_DURATION_MS = 250;

/**
 * Opens to fit its children when it gets some, and shuts when they go, keeping the last ones on screen while it
 * does. It only clips while moving, so once open its content can spill out of it.
 */
export function Reveal({ children }: { children?: ReactNode }) {
  const [content, setContent] = useState(children);
  if (children && children !== content) setContent(children);

  const [contentHeight, setContentHeight] = useState(0);
  const [settledHeight, setSettledHeight] = useState(0);
  const height = useAnimatedValue(0);
  const open = !!children && contentHeight > 0;
  const target = open ? contentHeight : 0;

  useEffect(() => {
    const transition = Animated.timing(height, {
      toValue: target,
      duration: REVEAL_DURATION_MS,
      easing: open ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      // Height is a layout prop, so this one can't run off the main thread.
      useNativeDriver: false,
    });
    transition.start(({ finished }) => {
      if (!finished) return;
      setSettledHeight(target);
      if (!open) {
        setContent(undefined);
        setContentHeight(0);
      }
    });
    return () => transition.stop();
  }, [open, target, height]);

  if (!content) return null;

  return (
    <Animated.View style={{ height, overflow: open && settledHeight === target ? 'visible' : 'hidden' }}>
      <View
        style={{ position: 'absolute', top: 0, left: 0, right: 0 }}
        onLayout={(event) => setContentHeight(event.nativeEvent.layout.height)}
      >
        {content}
      </View>
    </Animated.View>
  );
}
