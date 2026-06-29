import React, { useCallback, useEffect, useRef } from 'react';
import { View, LayoutChangeEvent, StyleSheet, Animated, Easing } from 'react-native';

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
  const animatedHeight = useRef(new Animated.Value(unexpandedHeight)).current;
  const measuredHeightRef = useRef(unexpandedHeight);

  const animate = useCallback(() => {
    const targetHeight = isExpanded ? measuredHeightRef.current : unexpandedHeight;
    Animated.timing(animatedHeight, {
      toValue: targetHeight,
      duration,
      easing: Easing.cubic,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished && onToggled) {
        onToggled(isExpanded);
      }
    });
  }, [isExpanded, duration, onToggled, animatedHeight, unexpandedHeight]);

  useEffect(() => animate(), [animate]);

  const onLayoutContent = (e: LayoutChangeEvent) => {
    const height = e.nativeEvent.layout.height;
    measuredHeightRef.current = height;
    if (isExpanded && startsExpanded) {
      animatedHeight.setValue(height);
    }
    animate();
  };

  return (
    <Animated.View style={[{ height: animatedHeight, overflow: 'hidden' }, style]}>
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
