import { PopoverProps } from './popover-props';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { useEffect, useState } from 'react';
import { BackHandler, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Portal } from 'react-native-paper';
import Animated, { cubicBezier } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Frame {
  x: number;
  y: number;
  width: number;
  height: number;
}

const GAP = spacing[2];
const EDGE = spacing[4];
const ARROW_SIZE = 12;

const entrance = {
  from: { opacity: 0, transform: [{ scale: 0.85 }] },
  to: { opacity: 1, transform: [{ scale: 1 }] },
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

function place(anchor: Frame, width: number, height: number, windowWidth: number, topLimit: number) {
  const left = clamp(anchor.x - spacing[2], EDGE, windowWidth - width - EDGE);
  const above = anchor.y - GAP - height >= topLimit;
  const arrowLeft = clamp(anchor.x + anchor.width / 2 - left - ARROW_SIZE / 2, EDGE, width - EDGE - ARROW_SIZE);
  return {
    left,
    top: above ? anchor.y - GAP - height : anchor.y + anchor.height + GAP,
    above,
    arrowLeft,
    arrowTip: [arrowLeft + ARROW_SIZE / 2, above ? height : 0, 0],
  };
}

/**
 * A small card pointing at its trigger, which is measured each time it calls `open`. It sits above the trigger when
 * there is room, below it otherwise. Tapping anywhere else or pressing back closes it.
 */
export function Popover({ trigger, children, accessibilityLabel, width = 300 }: PopoverProps) {
  const { colors } = useAppTheme();
  const window = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [triggerView, setTriggerView] = useState<View | null>(null);
  const [anchor, setAnchor] = useState<Frame>();
  const [height, setHeight] = useState<number>();
  const isOpen = anchor !== undefined;

  const open = () =>
    triggerView?.measure((_x, _y, frameWidth, frameHeight, pageX, pageY) =>
      setAnchor({ x: pageX, y: pageY, width: frameWidth, height: frameHeight }),
    );
  const close = () => {
    setAnchor(undefined);
    setHeight(undefined);
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setAnchor(undefined);
      setHeight(undefined);
      return true;
    });
    return () => subscription.remove();
  }, [isOpen]);

  const contentWidth = Math.min(width, window.width - EDGE * 2);
  const placement =
    anchor && height !== undefined ? place(anchor, contentWidth, height, window.width, insets.top + EDGE) : undefined;

  return (
    <>
      <View ref={setTriggerView} collapsable={false} style={{ maxWidth: '100%' }}>
        {trigger(open)}
      </View>
      {isOpen && (
        <Portal>
          <Pressable style={StyleSheet.absoluteFill} onPress={close} accessible={false} />
          <Animated.View
            role="dialog"
            aria-label={accessibilityLabel}
            accessibilityViewIsModal
            onLayout={(event) => setHeight(event.nativeEvent.layout.height)}
            style={{
              position: 'absolute',
              left: placement?.left ?? 0,
              top: placement?.top ?? 0,
              opacity: placement ? 1 : 0,
              ...(placement && {
                animationName: entrance,
                animationDuration: 150,
                animationTimingFunction: cubicBezier(0, 0, 0.2, 1),
                animationFillMode: 'backwards',
                transformOrigin: placement.arrowTip,
              }),
              width: contentWidth,
              padding: spacing[4],
              borderRadius: 16,
              backgroundColor: colors.surface,
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.22)',
            }}
          >
            {children(close)}
            {placement && (
              <View
                style={{
                  position: 'absolute',
                  left: placement.arrowLeft,
                  ...(placement.above ? { bottom: -ARROW_SIZE / 2 } : { top: -ARROW_SIZE / 2 }),
                  width: ARROW_SIZE,
                  height: ARROW_SIZE,
                  backgroundColor: colors.surface,
                  transform: [{ rotate: '45deg' }],
                }}
              />
            )}
          </Animated.View>
        </Portal>
      )}
    </>
  );
}
