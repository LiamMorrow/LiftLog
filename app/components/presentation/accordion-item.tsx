import React, { useCallback, useEffect, useRef } from 'react';
import { View, LayoutChangeEvent, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  Easing,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

type AccordionItemProps = {
  isExpanded: boolean;
  unexpandedHeight?: number;
  startsExpanded?: boolean;
  duration?: number;
  onToggled?: (expanded: boolean) => void;
  children: React.ReactNode;
  style?: object;
};

export function AccordionItem({
  isExpanded,
  startsExpanded,
  duration = 200,
  onToggled,
  children,
  style,
  unexpandedHeight = 0,
}: AccordionItemProps) {
  const contentHeight = useSharedValue(unexpandedHeight); // measured height of children
  const animatedHeight = useSharedValue(unexpandedHeight);
  const animate = useCallback(() => {
    const targetHeight = isExpanded
      ? measuredHeightRef.current
      : unexpandedHeight;
    animatedHeight.set(
      withTiming(
        targetHeight,
        { duration, easing: Easing.cubic },
        (isFinished) => {
          if (isFinished && onToggled) {
            runOnJS(onToggled)(isExpanded);
          }
        },
      ),
    );
  }, [isExpanded, duration, onToggled, animatedHeight, unexpandedHeight]);

  const measuredHeightRef = useRef(unexpandedHeight);

  // Animate height when isExpanded changes
  useEffect(() => animate(), [animate]);

  // Animated style for the container
  const containerStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
    overflow: 'hidden',
  }));

  // Measure children height once
  const onLayoutContent = (e: LayoutChangeEvent) => {
    const height = e.nativeEvent.layout.height;
    measuredHeightRef.current = height;
    contentHeight.value = height;
    if (isExpanded && startsExpanded) {
      animatedHeight.set(height);
    }
    animate();
  };

  return (
    <Animated.View style={[containerStyle, style]}>
      <View style={styles.content} onLayout={onLayoutContent}>
        {children}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  content: {
    position: 'absolute',
    width: '100%',
  },
});
